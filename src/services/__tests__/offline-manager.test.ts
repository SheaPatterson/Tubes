import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createOfflineManager,
  resolveConflict,
  registerServiceWorker,
  type OfflineManager,
  type ConnectivityStatus,
} from '@/services/offline-manager';
import type { SavedSignalChain } from '@/types/signal-chain';

// ── Synchronous Fake IndexedDB ──

type StoreData = Map<string, unknown>;

class FakeIDBIndex {
  private store: FakeIDBObjectStore;
  private keyPath: string;

  constructor(store: FakeIDBObjectStore, keyPath: string) {
    this.store = store;
    this.keyPath = keyPath;
  }

  getAll(query?: IDBKeyRange) {
    const store = this.store;
    const kp = this.keyPath;
    const req = { result: [] as unknown[], onsuccess: null as (() => void) | null, onerror: null as (() => void) | null };
    Promise.resolve().then(() => {
      const all = Array.from(store._data.values());
      if (query) {
        const targetValue = (query as unknown as { _value: unknown })._value;
        req.result = all.filter((item) => {
          const record = item as Record<string, unknown>;
          return record[kp] === targetValue;
        });
      } else {
        req.result = all;
      }
      req.onsuccess?.();
    });
    return req;
  }
}

class FakeIDBObjectStore {
  _data: StoreData = new Map();
  private keyPath: string;
  private indexes: Map<string, FakeIDBIndex> = new Map();

  constructor(keyPath: string) {
    this.keyPath = keyPath;
  }

  createIndex(name: string, keyPath: string, _options?: { unique: boolean }): FakeIDBIndex {
    const index = new FakeIDBIndex(this, keyPath);
    this.indexes.set(name, index);
    return index;
  }

  index(name: string): FakeIDBIndex {
    const idx = this.indexes.get(name);
    if (!idx) throw new Error(`Index ${name} not found`);
    return idx;
  }

  put(value: unknown): void {
    const key = (value as Record<string, string>)[this.keyPath];
    this._data.set(key, JSON.parse(JSON.stringify(value)));
  }

  getAll() {
    const data = this._data;
    const req = {
      result: [] as unknown[],
      onsuccess: null as (() => void) | null,
      onerror: null as (() => void) | null,
    };
    Promise.resolve().then(() => {
      req.result = Array.from(data.values());
      req.onsuccess?.();
    });
    return req;
  }

  delete(key: string): void {
    this._data.delete(key);
  }
}

class FakeIDBTransaction {
  private stores: Map<string, FakeIDBObjectStore>;
  oncomplete: (() => void) | null = null;
  onerror: (() => void) | null = null;
  error: Error | null = null;

  constructor(stores: Map<string, FakeIDBObjectStore>) {
    this.stores = stores;
  }

  objectStore(name: string): FakeIDBObjectStore {
    const store = this.stores.get(name);
    if (!store) throw new Error(`Store ${name} not found`);
    return store;
  }
}

class FakeIDBDatabase {
  objectStoreNames: { contains: (name: string) => boolean };
  private stores: Map<string, FakeIDBObjectStore> = new Map();

  constructor() {
    this.objectStoreNames = {
      contains: (name: string) => this.stores.has(name),
    };
  }

  createObjectStore(name: string, options: { keyPath: string }): FakeIDBObjectStore {
    const store = new FakeIDBObjectStore(options.keyPath);
    this.stores.set(name, store);
    return store;
  }

  transaction(storeNames: string | string[], _mode?: string): FakeIDBTransaction {
    const names = Array.isArray(storeNames) ? storeNames : [storeNames];
    const txStores = new Map<string, FakeIDBObjectStore>();
    for (const name of names) {
      const store = this.stores.get(name);
      if (store) txStores.set(name, store);
    }
    const tx = new FakeIDBTransaction(txStores);
    // Fire oncomplete synchronously via microtask
    Promise.resolve().then(() => tx.oncomplete?.());
    return tx;
  }

  close(): void {
    // no-op
  }
}

class FakeIDBKeyRange {
  _value: unknown;
  constructor(value: unknown) {
    this._value = value;
  }
  static only(value: unknown): FakeIDBKeyRange {
    return new FakeIDBKeyRange(value);
  }
}

// ── Test Setup ──

let fakeDb: FakeIDBDatabase;

beforeEach(() => {
  fakeDb = new FakeIDBDatabase();

  const mockIndexedDB = {
    open: (_name: string, _version?: number) => {
      const request = {
        result: null as FakeIDBDatabase | null,
        error: null as Error | null,
        onupgradeneeded: null as (() => void) | null,
        onsuccess: null as (() => void) | null,
        onerror: null as (() => void) | null,
      };
      // Use microtask so it resolves within the same async tick
      Promise.resolve().then(() => {
        request.result = fakeDb;
        request.onupgradeneeded?.();
        request.onsuccess?.();
      });
      return request;
    },
  };

  (globalThis as unknown as Record<string, unknown>).indexedDB = mockIndexedDB;
  (globalThis as unknown as Record<string, unknown>).IDBKeyRange = FakeIDBKeyRange;

  Object.defineProperty(navigator, 'onLine', { value: true, writable: true, configurable: true });
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ── Helpers ──

function makeChain(overrides: Partial<SavedSignalChain> = {}): SavedSignalChain {
  return {
    id: 'chain-1',
    userId: 'user-1',
    name: 'Test Chain',
    config: {
      inputSettings: { inputGain: 0.5, noiseGateEnabled: false, noiseGateThreshold: -60, noiseGateRelease: 0.1 },
      preampFx: [],
      preampTubes: { tubeCount: 3, stageGains: [1, 1, 1] },
      amplifier: {
        modelId: 'winston-chl',
        parameters: {
          preampGain: 5, volume: 5, masterVolume: 5, masterGain: 5,
          bass: 5, middle: 5, treble: 5, tone: 5, presence: 5, resonance: 5,
          channel: 'clean', toggles: {},
        },
      },
      fxLoop: [],
      cabinet: {
        cabinetId: 'winston-4x12',
        mic: { type: 'dynamic', position: { x: 0, y: 0, z: 0 }, distance: 0.5 },
      },
      outputSettings: { masterVolume: 0.7, outputGain: 0.8 },
    },
    createdAt: 1000,
    updatedAt: 2000,
    ...overrides,
  };
}

// ── Tests ──

describe('Offline Manager Service', () => {
  describe('connectivity detection', () => {
    it('reports online when navigator.onLine is true', () => {
      Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
      const manager = createOfflineManager();
      expect(manager.getConnectivityStatus()).toBe('online');
      manager.dispose();
    });

    it('reports offline when navigator.onLine is false', () => {
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
      const manager = createOfflineManager();
      expect(manager.getConnectivityStatus()).toBe('offline');
      manager.dispose();
    });

    it('emits status change on online event', () => {
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
      const manager = createOfflineManager();
      const statuses: ConnectivityStatus[] = [];
      manager.onStatusChange((s) => statuses.push(s));

      window.dispatchEvent(new Event('online'));

      expect(statuses).toEqual(['online']);
      expect(manager.getConnectivityStatus()).toBe('online');
      manager.dispose();
    });

    it('emits status change on offline event', () => {
      Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
      const manager = createOfflineManager();
      const statuses: ConnectivityStatus[] = [];
      manager.onStatusChange((s) => statuses.push(s));

      window.dispatchEvent(new Event('offline'));

      expect(statuses).toEqual(['offline']);
      expect(manager.getConnectivityStatus()).toBe('offline');
      manager.dispose();
    });

    it('does not emit duplicate status changes', () => {
      const manager = createOfflineManager();
      const statuses: ConnectivityStatus[] = [];
      manager.onStatusChange((s) => statuses.push(s));

      // Already online, firing online again should not emit
      window.dispatchEvent(new Event('online'));

      expect(statuses).toHaveLength(0);
      manager.dispose();
    });

    it('unsubscribe removes listener', () => {
      const manager = createOfflineManager();
      const statuses: ConnectivityStatus[] = [];
      const unsub = manager.onStatusChange((s) => statuses.push(s));

      unsub();
      window.dispatchEvent(new Event('offline'));

      expect(statuses).toHaveLength(0);
      manager.dispose();
    });
  });

  describe('signal chain caching', () => {
    it('caches and retrieves signal chains from IndexedDB', async () => {
      const manager = createOfflineManager();
      const chain = makeChain();

      await manager.cacheSignalChain(chain);

      const cached = await manager.getCachedSignalChains();

      expect(cached).toHaveLength(1);
      expect(cached[0].id).toBe('chain-1');
      expect(cached[0].name).toBe('Test Chain');
      manager.dispose();
    });

    it('overwrites existing chain with same id', async () => {
      const manager = createOfflineManager();

      await manager.cacheSignalChain(makeChain({ name: 'Original' }));
      await manager.cacheSignalChain(makeChain({ name: 'Updated' }));

      const cached = await manager.getCachedSignalChains();

      expect(cached).toHaveLength(1);
      expect(cached[0].name).toBe('Updated');
      manager.dispose();
    });

    it('caches multiple distinct chains', async () => {
      const manager = createOfflineManager();

      await manager.cacheSignalChain(makeChain({ id: 'a', name: 'Chain A' }));
      await manager.cacheSignalChain(makeChain({ id: 'b', name: 'Chain B' }));

      const cached = await manager.getCachedSignalChains();

      expect(cached).toHaveLength(2);
      manager.dispose();
    });
  });

  describe('mutation queuing', () => {
    it('increments pending count when caching a chain', async () => {
      const manager = createOfflineManager();
      expect(manager.getPendingChangeCount()).toBe(0);

      await manager.cacheSignalChain(makeChain());

      expect(manager.getPendingChangeCount()).toBe(1);
      manager.dispose();
    });

    it('accumulates pending count for multiple mutations', async () => {
      const manager = createOfflineManager();

      await manager.cacheSignalChain(makeChain({ id: 'a' }));
      await manager.cacheSignalChain(makeChain({ id: 'b' }));

      expect(manager.getPendingChangeCount()).toBe(2);
      manager.dispose();
    });
  });

  describe('sync', () => {
    it('syncs pending changes and decrements count', async () => {
      const manager = createOfflineManager();

      await manager.cacheSignalChain(makeChain());
      expect(manager.getPendingChangeCount()).toBe(1);

      const result = await manager.syncPendingChanges();

      expect(result.synced).toBe(1);
      expect(result.conflicts).toBe(0);
      expect(result.errors).toHaveLength(0);
      expect(manager.getPendingChangeCount()).toBe(0);
      manager.dispose();
    });

    it('returns error when trying to sync while offline', async () => {
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
      const manager = createOfflineManager();

      await manager.cacheSignalChain(makeChain());

      const result = await manager.syncPendingChanges();

      expect(result.synced).toBe(0);
      expect(result.errors).toContain('Cannot sync while offline');
      expect(manager.getPendingChangeCount()).toBe(1);
      manager.dispose();
    });
  });

  describe('CRDT conflict resolution', () => {
    it('resolves conflict by choosing the later updatedAt', () => {
      const local = makeChain({ id: 'x', name: 'Local', updatedAt: 3000 });
      const remote = makeChain({ id: 'x', name: 'Remote', updatedAt: 2000 });

      const winner = resolveConflict(local, remote);
      expect(winner.name).toBe('Local');
    });

    it('chooses remote when remote has later updatedAt', () => {
      const local = makeChain({ id: 'x', name: 'Local', updatedAt: 1000 });
      const remote = makeChain({ id: 'x', name: 'Remote', updatedAt: 5000 });

      const winner = resolveConflict(local, remote);
      expect(winner.name).toBe('Remote');
    });

    it('chooses local when timestamps are equal', () => {
      const local = makeChain({ id: 'x', name: 'Local', updatedAt: 3000 });
      const remote = makeChain({ id: 'x', name: 'Remote', updatedAt: 3000 });

      const winner = resolveConflict(local, remote);
      expect(winner.name).toBe('Local');
    });
  });

  describe('dispose', () => {
    it('stops listening to connectivity events after dispose', () => {
      const manager = createOfflineManager();
      const statuses: ConnectivityStatus[] = [];
      manager.onStatusChange((s) => statuses.push(s));

      manager.dispose();

      window.dispatchEvent(new Event('offline'));
      expect(statuses).toHaveLength(0);
    });
  });

  describe('registerServiceWorker', () => {
    it('returns null when serviceWorker is not available', async () => {
      const original = navigator.serviceWorker;
      Object.defineProperty(navigator, 'serviceWorker', {
        value: undefined,
        configurable: true,
      });

      const result = await registerServiceWorker();
      expect(result).toBeNull();

      Object.defineProperty(navigator, 'serviceWorker', {
        value: original,
        configurable: true,
      });
    });
  });
});
