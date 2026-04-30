/**
 * Web MIDI API type declarations.
 * These augment the global namespace so TypeScript recognizes
 * the WebMidi types used in src/services/midi-manager.ts.
 */

declare namespace WebMidi {
  interface MIDIAccess extends EventTarget {
    readonly inputs: MIDIInputMap;
    readonly outputs: MIDIOutputMap;
    readonly sysexEnabled: boolean;
    onstatechange: ((event: MIDIConnectionEvent) => void) | null;
  }

  interface MIDIInputMap {
    readonly size: number;
    get(id: string): MIDIInput | undefined;
    forEach(callback: (input: MIDIInput, id: string) => void): void;
    keys(): IterableIterator<string>;
    values(): IterableIterator<MIDIInput>;
    entries(): IterableIterator<[string, MIDIInput]>;
    [Symbol.iterator](): IterableIterator<[string, MIDIInput]>;
  }

  interface MIDIOutputMap {
    readonly size: number;
    get(id: string): MIDIOutput | undefined;
    forEach(callback: (output: MIDIOutput, id: string) => void): void;
  }

  interface MIDIPort extends EventTarget {
    readonly id: string;
    readonly manufacturer: string | null;
    readonly name: string | null;
    readonly type: 'input' | 'output';
    readonly version: string | null;
    readonly state: 'connected' | 'disconnected';
    readonly connection: 'open' | 'closed' | 'pending';
    onstatechange: ((event: MIDIConnectionEvent) => void) | null;
    open(): Promise<MIDIPort>;
    close(): Promise<MIDIPort>;
  }

  interface MIDIInput extends MIDIPort {
    readonly type: 'input';
    onmidimessage: ((event: MIDIMessageEvent) => void) | null;
  }

  interface MIDIOutput extends MIDIPort {
    readonly type: 'output';
    send(data: number[] | Uint8Array, timestamp?: number): void;
    clear(): void;
  }

  interface MIDIMessageEvent extends Event {
    readonly data: Uint8Array;
  }

  interface MIDIConnectionEvent extends Event {
    readonly port: MIDIPort;
  }
}

interface Navigator {
  requestMIDIAccess?(options?: { sysex?: boolean }): Promise<WebMidi.MIDIAccess>;
}
