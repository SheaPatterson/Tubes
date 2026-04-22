import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createMIDIManager,
  parseMIDIMessage,
  mappingMatchesMessage,
  inferConnectionType,
  type MIDIManager,
  type MIDIMessage,
  type MIDIMapping,
  type MIDIDevice,
  type ParameterTarget,
} from '@/services/midi-manager';

// ── Mock Web MIDI API ──

class MockMIDIInput {
  id: string;
  name: string;
  manufacturer: string;
  state: 'connected' | 'disconnected' = 'connected';
  onmidimessage: ((event: { data: Uint8Array }) => void) | null = null;

  constructor(id: string, name: string, manufacturer: string = 'Test Manufacturer') {
    this.id = id;
    this.name = name;
    this.manufacturer = manufacturer;
  }

  simulateMessage(data: number[]): void {
    if (this.onmidimessage) {
      this.onmidimessage({ data: new Uint8Array(data) });
    }
  }
}

class MockMIDIAccess {
  inputs: Map<string, MockMIDIInput>;
  onstatechange: (() => void) | null = null;

  constructor(inputs: MockMIDIInput[] = []) {
    this.inputs = new Map();
    for (const input of inputs) {
      this.inputs.set(input.id, input);
    }
  }

  addInput(input: MockMIDIInput): void {
    this.inputs.set(input.id, input);
    if (this.onstatechange) this.onstatechange();
  }

  removeInput(id: string): void {
    const input = this.inputs.get(id);
    if (input) {
      input.state = 'disconnected';
      if (this.onstatechange) this.onstatechange();
    }
  }
}

let mockMIDIAccess: MockMIDIAccess;

beforeEach(() => {
  mockMIDIAccess = new MockMIDIAccess([
    new MockMIDIInput('input-1', 'USB MIDI Controller', 'Akai'),
    new MockMIDIInput('input-2', 'Bluetooth LE MIDI', 'Yamaha'),
  ]);

  Object.defineProperty(navigator, 'requestMIDIAccess', {
    value: vi.fn().mockResolvedValue(mockMIDIAccess),
    writable: true,
    configurable: true,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

async function initManager(): Promise<MIDIManager> {
  const manager = createMIDIManager();
  await manager.initialize();
  return manager;
}

// ── parseMIDIMessage tests ──

describe('parseMIDIMessage', () => {
  it('parses CC message on channel 1', () => {
    // CC on channel 1: status=0xB0, cc=7, value=100
    const msg = parseMIDIMessage(new Uint8Array([0xb0, 7, 100]));
    expect(msg).toEqual({ channel: 1, type: 'cc', number: 7, value: 100 });
  });

  it('parses CC message on channel 10', () => {
    // CC on channel 10: status=0xB9
    const msg = parseMIDIMessage(new Uint8Array([0xb9, 1, 64]));
    expect(msg).toEqual({ channel: 10, type: 'cc', number: 1, value: 64 });
  });

  it('parses Program Change message', () => {
    // PC on channel 1: status=0xC0, program=5
    const msg = parseMIDIMessage(new Uint8Array([0xc0, 5]));
    expect(msg).toEqual({ channel: 1, type: 'program_change', number: 5, value: 5 });
  });

  it('returns null for Note On messages (unsupported)', () => {
    const msg = parseMIDIMessage(new Uint8Array([0x90, 60, 127]));
    expect(msg).toBeNull();
  });

  it('returns null for too-short data', () => {
    expect(parseMIDIMessage(new Uint8Array([0xb0]))).toBeNull();
    expect(parseMIDIMessage(new Uint8Array([]))).toBeNull();
  });

  it('returns null for CC with only 2 bytes', () => {
    // CC needs 3 bytes
    expect(parseMIDIMessage(new Uint8Array([0xb0, 7]))).toBeNull();
  });
});

// ── mappingMatchesMessage tests ──

describe('mappingMatchesMessage', () => {
  const mapping: MIDIMapping = {
    id: 'test',
    channel: 1,
    type: 'cc',
    number: 7,
    target: { type: 'parameter', nodeId: 'amp', paramName: 'volume' },
  };

  it('matches when channel, type, and number are equal', () => {
    const msg: MIDIMessage = { channel: 1, type: 'cc', number: 7, value: 100 };
    expect(mappingMatchesMessage(mapping, msg)).toBe(true);
  });

  it('does not match different channel', () => {
    const msg: MIDIMessage = { channel: 2, type: 'cc', number: 7, value: 100 };
    expect(mappingMatchesMessage(mapping, msg)).toBe(false);
  });

  it('does not match different type', () => {
    const msg: MIDIMessage = { channel: 1, type: 'program_change', number: 7, value: 7 };
    expect(mappingMatchesMessage(mapping, msg)).toBe(false);
  });

  it('does not match different number', () => {
    const msg: MIDIMessage = { channel: 1, type: 'cc', number: 10, value: 100 };
    expect(mappingMatchesMessage(mapping, msg)).toBe(false);
  });
});

// ── inferConnectionType tests ──

describe('inferConnectionType', () => {
  it('returns bluetooth for BLE device names', () => {
    const input = new MockMIDIInput('1', 'Bluetooth LE MIDI', 'Yamaha');
    expect(inferConnectionType(input as unknown as WebMidi.MIDIInput)).toBe('bluetooth');
  });

  it('returns usb for standard device names', () => {
    const input = new MockMIDIInput('1', 'USB MIDI Controller', 'Akai');
    expect(inferConnectionType(input as unknown as WebMidi.MIDIInput)).toBe('usb');
  });

  it('returns bluetooth when manufacturer contains ble', () => {
    const input = new MockMIDIInput('1', 'Some Device', 'BLE Corp');
    expect(inferConnectionType(input as unknown as WebMidi.MIDIInput)).toBe('bluetooth');
  });
});

// ── MIDIManager integration tests ──

describe('MIDIManager', () => {
  describe('initialization', () => {
    it('initializes with Web MIDI API', async () => {
      const manager = await initManager();
      expect(navigator.requestMIDIAccess).toHaveBeenCalledWith({ sysex: false });
      manager.dispose();
    });

    it('throws when Web MIDI API is not available', async () => {
      Object.defineProperty(navigator, 'requestMIDIAccess', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      const manager = createMIDIManager();
      await expect(manager.initialize()).rejects.toThrow('Web MIDI API is not supported');
    });

    it('throws when disposed', async () => {
      const manager = createMIDIManager();
      manager.dispose();
      await expect(manager.initialize()).rejects.toThrow('disposed');
    });
  });

  describe('device detection', () => {
    it('detects USB and Bluetooth MIDI devices on launch', async () => {
      const manager = await initManager();
      const devices = manager.getDevices();

      expect(devices).toHaveLength(2);
      expect(devices[0]).toEqual({
        id: 'input-1',
        name: 'USB MIDI Controller',
        manufacturer: 'Akai',
        connection: 'usb',
        state: 'connected',
      });
      expect(devices[1]).toEqual({
        id: 'input-2',
        name: 'Bluetooth LE MIDI',
        manufacturer: 'Yamaha',
        connection: 'bluetooth',
        state: 'connected',
      });

      manager.dispose();
    });

    it('returns empty array before initialization', () => {
      const manager = createMIDIManager();
      expect(manager.getDevices()).toEqual([]);
    });

    it('emits device change on connect/disconnect', async () => {
      const manager = await initManager();
      const changes: MIDIDevice[][] = [];
      manager.onDeviceChange((devices) => changes.push(devices));

      // Simulate new device
      mockMIDIAccess.addInput(new MockMIDIInput('input-3', 'New Controller'));
      expect(changes).toHaveLength(1);
      expect(changes[0]).toHaveLength(3);

      // Simulate disconnect
      mockMIDIAccess.removeInput('input-3');
      expect(changes).toHaveLength(2);

      manager.dispose();
    });

    it('unsubscribe removes device change listener', async () => {
      const manager = await initManager();
      const changes: MIDIDevice[][] = [];
      const unsub = manager.onDeviceChange((devices) => changes.push(devices));

      unsub();
      mockMIDIAccess.addInput(new MockMIDIInput('input-3', 'New Controller'));
      expect(changes).toHaveLength(0);

      manager.dispose();
    });
  });

  describe('device selection', () => {
    it('selects a device and receives messages from it', async () => {
      const manager = await initManager();
      const messages: MIDIMessage[] = [];
      manager.onMessage((msg) => messages.push(msg));

      manager.selectDevice('input-1');
      expect(manager.getSelectedDeviceId()).toBe('input-1');

      // Simulate CC message from selected device
      const input = mockMIDIAccess.inputs.get('input-1')!;
      input.simulateMessage([0xb0, 7, 100]);

      expect(messages).toHaveLength(1);
      expect(messages[0]).toEqual({ channel: 1, type: 'cc', number: 7, value: 100 });

      manager.dispose();
    });

    it('does not receive messages from unselected devices', async () => {
      const manager = await initManager();
      const messages: MIDIMessage[] = [];
      manager.onMessage((msg) => messages.push(msg));

      manager.selectDevice('input-1');

      // Simulate message from the OTHER device
      const input2 = mockMIDIAccess.inputs.get('input-2')!;
      input2.simulateMessage([0xb0, 1, 64]);

      expect(messages).toHaveLength(0);

      manager.dispose();
    });

    it('switches device when selecting a different one', async () => {
      const manager = await initManager();
      const messages: MIDIMessage[] = [];
      manager.onMessage((msg) => messages.push(msg));

      manager.selectDevice('input-1');
      manager.selectDevice('input-2');

      // Old device should no longer emit
      const input1 = mockMIDIAccess.inputs.get('input-1')!;
      input1.simulateMessage([0xb0, 7, 100]);
      expect(messages).toHaveLength(0);

      // New device should emit
      const input2 = mockMIDIAccess.inputs.get('input-2')!;
      input2.simulateMessage([0xb0, 1, 64]);
      expect(messages).toHaveLength(1);

      manager.dispose();
    });
  });

  describe('mapping management', () => {
    it('creates a CC mapping', async () => {
      const manager = await initManager();
      const target: ParameterTarget = { type: 'parameter', nodeId: 'amp', paramName: 'volume' };
      const msg: MIDIMessage = { channel: 1, type: 'cc', number: 7, value: 0 };

      const mapping = manager.createMapping(msg, target);

      expect(mapping.id).toBeTruthy();
      expect(mapping.channel).toBe(1);
      expect(mapping.type).toBe('cc');
      expect(mapping.number).toBe(7);
      expect(mapping.target).toEqual(target);

      expect(manager.getMappings()).toHaveLength(1);
      manager.dispose();
    });

    it('creates a Program Change mapping for amp channel switching', async () => {
      const manager = await initManager();
      const target: ParameterTarget = { type: 'amp_channel', channel: 'overdrive' };
      const msg: MIDIMessage = { channel: 1, type: 'program_change', number: 3, value: 3 };

      const mapping = manager.createMapping(msg, target);
      expect(mapping.type).toBe('program_change');
      expect(mapping.target).toEqual({ type: 'amp_channel', channel: 'overdrive' });

      manager.dispose();
    });

    it('creates pedal toggle mapping', async () => {
      const manager = await initManager();
      const target: ParameterTarget = { type: 'pedal_toggle', stageId: 'preamp', pedalId: 'ts9' };
      const msg: MIDIMessage = { channel: 1, type: 'cc', number: 64, value: 0 };

      const mapping = manager.createMapping(msg, target);
      expect(mapping.target).toEqual({ type: 'pedal_toggle', stageId: 'preamp', pedalId: 'ts9' });

      manager.dispose();
    });

    it('creates pedal boost mapping', async () => {
      const manager = await initManager();
      const target: ParameterTarget = { type: 'pedal_boost', stageId: 'fxloop', pedalId: 'delay1' };
      const msg: MIDIMessage = { channel: 1, type: 'cc', number: 65, value: 0 };

      const mapping = manager.createMapping(msg, target);
      expect(mapping.target).toEqual({ type: 'pedal_boost', stageId: 'fxloop', pedalId: 'delay1' });

      manager.dispose();
    });

    it('replaces existing mapping for same MIDI message', async () => {
      const manager = await initManager();
      const msg: MIDIMessage = { channel: 1, type: 'cc', number: 7, value: 0 };

      manager.createMapping(msg, { type: 'parameter', nodeId: 'amp', paramName: 'volume' });
      manager.createMapping(msg, { type: 'parameter', nodeId: 'amp', paramName: 'bass' });

      const mappings = manager.getMappings();
      expect(mappings).toHaveLength(1);
      expect(mappings[0].target).toEqual({ type: 'parameter', nodeId: 'amp', paramName: 'bass' });

      manager.dispose();
    });

    it('deletes a mapping by id', async () => {
      const manager = await initManager();
      const msg: MIDIMessage = { channel: 1, type: 'cc', number: 7, value: 0 };
      const mapping = manager.createMapping(msg, { type: 'parameter', nodeId: 'amp', paramName: 'volume' });

      manager.deleteMapping(mapping.id);
      expect(manager.getMappings()).toHaveLength(0);

      manager.dispose();
    });

    it('deleteMapping is a no-op for unknown id', async () => {
      const manager = await initManager();
      manager.deleteMapping('nonexistent');
      expect(manager.getMappings()).toHaveLength(0);
      manager.dispose();
    });

    it('getMappings returns a copy', async () => {
      const manager = await initManager();
      const msg: MIDIMessage = { channel: 1, type: 'cc', number: 7, value: 0 };
      manager.createMapping(msg, { type: 'parameter', nodeId: 'amp', paramName: 'volume' });

      const mappings1 = manager.getMappings();
      const mappings2 = manager.getMappings();
      expect(mappings1).not.toBe(mappings2);
      expect(mappings1).toEqual(mappings2);

      manager.dispose();
    });
  });

  describe('quick-map mode', () => {
    it('captures next MIDI message and creates mapping (≤3 interactions)', async () => {
      const manager = await initManager();
      manager.selectDevice('input-1');

      const target: ParameterTarget = { type: 'parameter', nodeId: 'amp', paramName: 'treble' };

      // Interaction 1: start quick-map with target
      manager.startQuickMap(target);
      expect(manager.isQuickMapping()).toBe(true);

      // Interaction 2: user moves a MIDI knob
      const input = mockMIDIAccess.inputs.get('input-1')!;
      input.simulateMessage([0xb0, 74, 100]); // CC 74 on channel 1

      // Interaction 3: mapping is created automatically
      expect(manager.isQuickMapping()).toBe(false);
      const mappings = manager.getMappings();
      expect(mappings).toHaveLength(1);
      expect(mappings[0].channel).toBe(1);
      expect(mappings[0].type).toBe('cc');
      expect(mappings[0].number).toBe(74);
      expect(mappings[0].target).toEqual(target);

      manager.dispose();
    });

    it('can be cancelled', async () => {
      const manager = await initManager();
      manager.selectDevice('input-1');

      manager.startQuickMap({ type: 'parameter', nodeId: 'amp', paramName: 'bass' });
      expect(manager.isQuickMapping()).toBe(true);

      manager.cancelQuickMap();
      expect(manager.isQuickMapping()).toBe(false);

      // Subsequent MIDI messages should not create mappings
      const input = mockMIDIAccess.inputs.get('input-1')!;
      input.simulateMessage([0xb0, 74, 100]);
      expect(manager.getMappings()).toHaveLength(0);

      manager.dispose();
    });

    it('emits the captured message to listeners after quick-map', async () => {
      const manager = await initManager();
      manager.selectDevice('input-1');
      const messages: MIDIMessage[] = [];
      manager.onMessage((msg) => messages.push(msg));

      manager.startQuickMap({ type: 'parameter', nodeId: 'amp', paramName: 'volume' });

      const input = mockMIDIAccess.inputs.get('input-1')!;
      input.simulateMessage([0xb0, 7, 127]);

      // The captured message should be emitted
      expect(messages).toHaveLength(1);
      expect(messages[0]).toEqual({ channel: 1, type: 'cc', number: 7, value: 127 });

      manager.dispose();
    });

    it('quick-map with Program Change', async () => {
      const manager = await initManager();
      manager.selectDevice('input-1');

      const target: ParameterTarget = { type: 'amp_channel', channel: 'crunch' };
      manager.startQuickMap(target);

      const input = mockMIDIAccess.inputs.get('input-1')!;
      input.simulateMessage([0xc0, 2]); // PC 2 on channel 1

      const mappings = manager.getMappings();
      expect(mappings).toHaveLength(1);
      expect(mappings[0].type).toBe('program_change');
      expect(mappings[0].number).toBe(2);
      expect(mappings[0].target).toEqual(target);

      manager.dispose();
    });
  });

  describe('message subscription', () => {
    it('onMessage returns unsubscribe function', async () => {
      const manager = await initManager();
      manager.selectDevice('input-1');
      const messages: MIDIMessage[] = [];
      const unsub = manager.onMessage((msg) => messages.push(msg));

      const input = mockMIDIAccess.inputs.get('input-1')!;
      input.simulateMessage([0xb0, 7, 100]);
      expect(messages).toHaveLength(1);

      unsub();
      input.simulateMessage([0xb0, 7, 50]);
      expect(messages).toHaveLength(1); // No new message

      manager.dispose();
    });

    it('handles listener errors gracefully', async () => {
      const manager = await initManager();
      manager.selectDevice('input-1');

      const goodMessages: MIDIMessage[] = [];
      manager.onMessage(() => { throw new Error('listener error'); });
      manager.onMessage((msg) => goodMessages.push(msg));

      const input = mockMIDIAccess.inputs.get('input-1')!;
      input.simulateMessage([0xb0, 7, 100]);

      // Second listener should still receive the message
      expect(goodMessages).toHaveLength(1);

      manager.dispose();
    });
  });

  describe('dispose', () => {
    it('cleans up all state', async () => {
      const manager = await initManager();
      manager.selectDevice('input-1');
      manager.createMapping(
        { channel: 1, type: 'cc', number: 7, value: 0 },
        { type: 'parameter', nodeId: 'amp', paramName: 'volume' }
      );

      manager.dispose();

      expect(manager.getDevices()).toEqual([]);
      expect(manager.getSelectedDeviceId()).toBeNull();
      expect(manager.isQuickMapping()).toBe(false);
    });

    it('stops receiving messages after dispose', async () => {
      const manager = await initManager();
      manager.selectDevice('input-1');
      const messages: MIDIMessage[] = [];
      manager.onMessage((msg) => messages.push(msg));

      const input = mockMIDIAccess.inputs.get('input-1')!;

      manager.dispose();

      // The onmidimessage handler should be cleared
      // Even if somehow called, the disposed flag prevents processing
      input.simulateMessage([0xb0, 7, 100]);
      expect(messages).toHaveLength(0);
    });
  });

  describe('device reconnection', () => {
    it('re-attaches listener when selected device reconnects', async () => {
      const manager = await initManager();
      const messages: MIDIMessage[] = [];
      manager.onMessage((msg) => messages.push(msg));
      manager.selectDevice('input-1');

      const input = mockMIDIAccess.inputs.get('input-1')!;

      // Simulate disconnect
      input.state = 'disconnected';
      input.onmidimessage = null;
      mockMIDIAccess.onstatechange?.();

      // Simulate reconnect
      input.state = 'connected';
      mockMIDIAccess.onstatechange?.();

      // Should receive messages again
      input.simulateMessage([0xb0, 7, 100]);
      expect(messages).toHaveLength(1);

      manager.dispose();
    });
  });
});
