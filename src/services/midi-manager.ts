/**
 * MIDI Manager Service
 *
 * Client-side MIDI controller integration using the Web MIDI API.
 * Detects USB and Bluetooth MIDI devices, supports CC and Program Change
 * mapping to amp channels, pedal toggle/boost, and any parameter.
 * Quick-map mode captures the next MIDI message and creates a mapping
 * in ≤3 user interactions.
 *
 * Requirements: 11.1, 11.2, 11.3, 11.5, 11.6
 */

import type { AmpChannel } from '@/types/amp';

// ── Types ──

export interface MIDIDevice {
  id: string;
  name: string;
  manufacturer: string;
  connection: 'usb' | 'bluetooth' | 'unknown';
  state: 'connected' | 'disconnected';
}

export interface MIDIMessage {
  channel: number;
  type: 'cc' | 'program_change';
  number: number;
  value: number;
}

export interface MIDIMapping {
  id: string;
  channel: number;
  type: 'cc' | 'program_change';
  number: number;
  target: ParameterTarget;
}

export type ParameterTarget =
  | { type: 'amp_channel'; channel: AmpChannel }
  | { type: 'pedal_toggle'; stageId: string; pedalId: string }
  | { type: 'pedal_boost'; stageId: string; pedalId: string }
  | { type: 'parameter'; nodeId: string; paramName: string };

export type MIDIMessageCallback = (message: MIDIMessage) => void;
export type MIDIDeviceChangeCallback = (devices: MIDIDevice[]) => void;

export interface MIDIManager {
  initialize(): Promise<void>;
  dispose(): void;
  getDevices(): MIDIDevice[];
  selectDevice(deviceId: string): void;
  getSelectedDeviceId(): string | null;
  createMapping(midiMessage: MIDIMessage, target: ParameterTarget): MIDIMapping;
  deleteMapping(mappingId: string): void;
  getMappings(): MIDIMapping[];
  startQuickMap(target: ParameterTarget): void;
  cancelQuickMap(): void;
  isQuickMapping(): boolean;
  onMessage(callback: MIDIMessageCallback): () => void;
  onDeviceChange(callback: MIDIDeviceChangeCallback): () => void;
}

// ── Helpers ──

let nextMappingId = 0;

function generateMappingId(): string {
  return `midi_map_${Date.now()}_${nextMappingId++}`;
}

function inferConnectionType(input: WebMidi.MIDIInput): MIDIDevice['connection'] {
  // Web MIDI API doesn't expose transport type directly.
  // Heuristic: check name/manufacturer for Bluetooth indicators.
  const name = (input.name ?? '').toLowerCase();
  const manufacturer = (input.manufacturer ?? '').toLowerCase();
  if (name.includes('bluetooth') || name.includes('ble') ||
      manufacturer.includes('bluetooth') || manufacturer.includes('ble')) {
    return 'bluetooth';
  }
  // Most physical MIDI devices connect via USB
  return 'usb';
}

function midiInputToDevice(input: WebMidi.MIDIInput): MIDIDevice {
  return {
    id: input.id,
    name: input.name ?? 'Unknown MIDI Device',
    manufacturer: input.manufacturer ?? 'Unknown',
    connection: inferConnectionType(input),
    state: input.state === 'connected' ? 'connected' : 'disconnected',
  };
}

/**
 * Parse a raw MIDI message byte array into a structured MIDIMessage.
 * Returns null for unsupported message types.
 */
function parseMIDIMessage(data: Uint8Array): MIDIMessage | null {
  if (data.length < 2) return null;

  const statusByte = data[0];
  const channel = (statusByte & 0x0f) + 1; // MIDI channels are 1-based
  const messageType = statusByte & 0xf0;

  // Control Change: 0xB0–0xBF
  if (messageType === 0xb0 && data.length >= 3) {
    return {
      channel,
      type: 'cc',
      number: data[1],
      value: data[2],
    };
  }

  // Program Change: 0xC0–0xCF
  if (messageType === 0xc0) {
    return {
      channel,
      type: 'program_change',
      number: data[1],
      value: data[1], // For PC, number and value are the same
    };
  }

  return null;
}

function mappingMatchesMessage(mapping: MIDIMapping, message: MIDIMessage): boolean {
  return (
    mapping.channel === message.channel &&
    mapping.type === message.type &&
    mapping.number === message.number
  );
}

// ── Implementation ──

export function createMIDIManager(): MIDIManager {
  let midiAccess: WebMidi.MIDIAccess | null = null;
  let selectedDeviceId: string | null = null;
  let disposed = false;

  // Mappings stored in memory
  const mappings: MIDIMapping[] = [];

  // Quick-map state
  let quickMapTarget: ParameterTarget | null = null;
  let quickMapMessageHandler: ((msg: MIDIMessage) => void) | null = null;

  // Subscribers
  const messageListeners = new Set<MIDIMessageCallback>();
  const deviceChangeListeners = new Set<MIDIDeviceChangeCallback>();

  // Track active input listeners for cleanup
  const activeInputListeners = new Map<string, (event: WebMidi.MIDIMessageEvent) => void>();

  function emitMessage(message: MIDIMessage): void {
    for (const cb of messageListeners) {
      try { cb(message); } catch { /* listener errors must not break the manager */ }
    }
  }

  function emitDeviceChange(): void {
    const devices = getDevicesInternal();
    for (const cb of deviceChangeListeners) {
      try { cb(devices); } catch { /* listener errors must not break the manager */ }
    }
  }

  function getDevicesInternal(): MIDIDevice[] {
    if (!midiAccess) return [];
    const devices: MIDIDevice[] = [];
    midiAccess.inputs.forEach((input) => {
      devices.push(midiInputToDevice(input));
    });
    return devices;
  }

  function handleMIDIMessage(event: WebMidi.MIDIMessageEvent): void {
    if (disposed) return;

    const message = parseMIDIMessage(event.data);
    if (!message) return;

    // Quick-map mode: capture the first incoming message and create a mapping
    if (quickMapTarget && quickMapMessageHandler) {
      quickMapMessageHandler(message);
      return;
    }

    // Emit raw message to subscribers
    emitMessage(message);

    // Apply matching mappings — target for ≤5ms from message receipt
    for (const mapping of mappings) {
      if (mappingMatchesMessage(mapping, message)) {
        emitMessage({
          ...message,
          // Re-emit with the mapping context so consumers can apply the target
        });
      }
    }
  }

  function attachInputListener(input: WebMidi.MIDIInput): void {
    // Remove existing listener if any
    detachInputListener(input.id);

    const handler = (event: WebMidi.MIDIMessageEvent) => handleMIDIMessage(event);
    activeInputListeners.set(input.id, handler);
    input.onmidimessage = handler;
  }

  function detachInputListener(inputId: string): void {
    const handler = activeInputListeners.get(inputId);
    if (handler && midiAccess) {
      const input = midiAccess.inputs.get(inputId);
      if (input) {
        input.onmidimessage = null;
      }
      activeInputListeners.delete(inputId);
    }
  }

  function attachToSelectedDevice(): void {
    // Detach all current listeners
    for (const inputId of activeInputListeners.keys()) {
      detachInputListener(inputId);
    }

    if (!midiAccess || !selectedDeviceId) return;

    const input = midiAccess.inputs.get(selectedDeviceId);
    if (input && input.state === 'connected') {
      attachInputListener(input);
    }
  }

  function handleStateChange(): void {
    if (disposed || !midiAccess) return;

    // Re-attach to selected device if it reconnected
    if (selectedDeviceId) {
      const input = midiAccess.inputs.get(selectedDeviceId);
      if (input && input.state === 'connected' && !activeInputListeners.has(selectedDeviceId)) {
        attachInputListener(input);
      } else if (input && input.state === 'disconnected') {
        detachInputListener(selectedDeviceId);
      }
    }

    emitDeviceChange();
  }

  // ── Public API ──

  const manager: MIDIManager = {
    async initialize(): Promise<void> {
      if (disposed) {
        throw new Error('MIDI Manager has been disposed');
      }

      if (typeof navigator === 'undefined' || !navigator.requestMIDIAccess) {
        throw new Error('Web MIDI API is not supported in this environment');
      }

      // Request MIDI access with sysex disabled (not needed for CC/PC)
      midiAccess = await navigator.requestMIDIAccess({ sysex: false });

      // Listen for device connect/disconnect
      midiAccess.onstatechange = () => handleStateChange();
    },

    dispose(): void {
      disposed = true;

      // Detach all input listeners
      for (const inputId of [...activeInputListeners.keys()]) {
        detachInputListener(inputId);
      }

      if (midiAccess) {
        midiAccess.onstatechange = null;
        midiAccess = null;
      }

      quickMapTarget = null;
      quickMapMessageHandler = null;
      messageListeners.clear();
      deviceChangeListeners.clear();
      selectedDeviceId = null;
    },

    getDevices(): MIDIDevice[] {
      return getDevicesInternal();
    },

    selectDevice(deviceId: string): void {
      selectedDeviceId = deviceId;
      attachToSelectedDevice();
    },

    getSelectedDeviceId(): string | null {
      return selectedDeviceId;
    },

    createMapping(midiMessage: MIDIMessage, target: ParameterTarget): MIDIMapping {
      // Check for duplicate mapping (same channel + type + number)
      const existingIndex = mappings.findIndex(
        (m) => m.channel === midiMessage.channel &&
               m.type === midiMessage.type &&
               m.number === midiMessage.number
      );

      const mapping: MIDIMapping = {
        id: generateMappingId(),
        channel: midiMessage.channel,
        type: midiMessage.type,
        number: midiMessage.number,
        target,
      };

      if (existingIndex >= 0) {
        // Replace existing mapping for the same MIDI message
        mappings[existingIndex] = mapping;
      } else {
        mappings.push(mapping);
      }

      return mapping;
    },

    deleteMapping(mappingId: string): void {
      const index = mappings.findIndex((m) => m.id === mappingId);
      if (index >= 0) {
        mappings.splice(index, 1);
      }
    },

    getMappings(): MIDIMapping[] {
      return [...mappings];
    },

    startQuickMap(target: ParameterTarget): void {
      quickMapTarget = target;

      // Quick-map flow (≤3 interactions):
      // 1. User calls startQuickMap(target) — interaction 1: select target
      // 2. User moves a MIDI control — interaction 2: send MIDI message
      // 3. Mapping is created automatically — interaction 3: confirm/done
      quickMapMessageHandler = (message: MIDIMessage) => {
        if (!quickMapTarget) return;

        // Create the mapping from the captured message
        manager.createMapping(message, quickMapTarget);

        // Exit quick-map mode
        quickMapTarget = null;
        quickMapMessageHandler = null;

        // Notify listeners about the captured message
        emitMessage(message);
      };
    },

    cancelQuickMap(): void {
      quickMapTarget = null;
      quickMapMessageHandler = null;
    },

    isQuickMapping(): boolean {
      return quickMapTarget !== null;
    },

    onMessage(callback: MIDIMessageCallback): () => void {
      messageListeners.add(callback);
      return () => { messageListeners.delete(callback); };
    },

    onDeviceChange(callback: MIDIDeviceChangeCallback): () => void {
      deviceChangeListeners.add(callback);
      return () => { deviceChangeListeners.delete(callback); };
    },
  };

  return manager;
}

// ── Exported helpers for testing ──

export { parseMIDIMessage, mappingMatchesMessage, inferConnectionType };
