/**
 * Next.js instrumentation hook — runs once when the server starts.
 *
 * Node.js 25+ exposes a global `localStorage` object that throws
 * "localStorage.getItem is not a function" unless --localstorage-file
 * is provided. Some libraries detect `localStorage` and try to use it
 * during SSR, causing 500 errors. This polyfill provides a no-op
 * implementation so those libraries don't crash.
 */
export async function register() {
  if (typeof globalThis.localStorage !== 'undefined') {
    const storage = globalThis.localStorage;
    // Check if getItem is missing or broken (Node.js 25 issue)
    if (typeof storage.getItem !== 'function') {
      const store = new Map<string, string>();
      const noopStorage = {
        getItem(key: string): string | null {
          return store.get(key) ?? null;
        },
        setItem(key: string, value: string): void {
          store.set(key, value);
        },
        removeItem(key: string): void {
          store.delete(key);
        },
        clear(): void {
          store.clear();
        },
        get length(): number {
          return store.size;
        },
        key(index: number): string | null {
          const keys = Array.from(store.keys());
          return keys[index] ?? null;
        },
      };
      Object.defineProperty(globalThis, 'localStorage', {
        value: noopStorage,
        writable: true,
        configurable: true,
      });
    }
  }
}
