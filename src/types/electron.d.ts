/**
 * Type declarations for Electron bridge APIs exposed via contextBridge.
 * These are available on the `window` object when running inside Electron.
 */

interface ElectronAudioDeviceInfo {
  id: string;
  name: string;
  kind: 'audioinput' | 'audiooutput';
  sampleRates: number[];
  bufferSizes: number[];
  isDefault: boolean;
}

interface ElectronMidiDeviceInfo {
  id: string;
  name: string;
  type: 'input' | 'output';
  connection: 'usb' | 'bluetooth';
}

interface ElectronMidiMessage {
  deviceId: string;
  channel: number;
  type: 'cc' | 'program_change' | 'note_on' | 'note_off';
  number: number;
  value: number;
  timestamp: number;
}

interface ElectronSaveDialogOptions {
  defaultPath?: string;
  filters?: Array<{ name: string; extensions: string[] }>;
  title?: string;
}

interface ElectronAudioBridge {
  getDevices(): Promise<ElectronAudioDeviceInfo[]>;
  setBufferSize(size: number): Promise<void>;
  getBufferSize(): Promise<number>;
  setSampleRate(rate: number): Promise<void>;
  getSampleRate(): Promise<number>;
  onDeviceChange(callback: (devices: ElectronAudioDeviceInfo[]) => void): void;
}

interface ElectronMidiBridge {
  getDevices(): Promise<ElectronMidiDeviceInfo[]>;
  openDevice(deviceId: string): Promise<void>;
  closeDevice(deviceId: string): Promise<void>;
  onMessage(callback: (message: ElectronMidiMessage) => void): void;
  onDeviceChange(callback: (devices: ElectronMidiDeviceInfo[]) => void): void;
}

interface ElectronFsBridge {
  showSaveDialog(options: ElectronSaveDialogOptions): Promise<string | null>;
  writeFile(filePath: string, data: ArrayBuffer): Promise<void>;
  getDefaultRecordingDir(): Promise<string>;
}

declare global {
  interface Window {
    electronAudio?: ElectronAudioBridge;
    electronMidi?: ElectronMidiBridge;
    electronFs?: ElectronFsBridge;
  }
}

export {};
