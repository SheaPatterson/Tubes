import { contextBridge, ipcRenderer } from 'electron';

/** Audio bridge — native audio device enumeration and buffer size control */
const audioBridge = {
  getDevices: (): Promise<AudioDeviceInfo[]> =>
    ipcRenderer.invoke('audio:getDevices'),
  setBufferSize: (size: number): Promise<void> =>
    ipcRenderer.invoke('audio:setBufferSize', size),
  getBufferSize: (): Promise<number> =>
    ipcRenderer.invoke('audio:getBufferSize'),
  setSampleRate: (rate: number): Promise<void> =>
    ipcRenderer.invoke('audio:setSampleRate', rate),
  getSampleRate: (): Promise<number> =>
    ipcRenderer.invoke('audio:getSampleRate'),
  onDeviceChange: (callback: (devices: AudioDeviceInfo[]) => void): void => {
    ipcRenderer.on('audio:deviceChange', (_event, devices) => callback(devices));
  },
};

/** MIDI bridge — native USB/Bluetooth MIDI device access */
const midiBridge = {
  getDevices: (): Promise<MidiDeviceInfo[]> =>
    ipcRenderer.invoke('midi:getDevices'),
  openDevice: (deviceId: string): Promise<void> =>
    ipcRenderer.invoke('midi:openDevice', deviceId),
  closeDevice: (deviceId: string): Promise<void> =>
    ipcRenderer.invoke('midi:closeDevice', deviceId),
  onMessage: (callback: (message: MidiMessage) => void): void => {
    ipcRenderer.on('midi:message', (_event, message) => callback(message));
  },
  onDeviceChange: (callback: (devices: MidiDeviceInfo[]) => void): void => {
    ipcRenderer.on('midi:deviceChange', (_event, devices) => callback(devices));
  },
};

/** File system bridge — native file save dialogs for recordings */
const fsBridge = {
  showSaveDialog: (options: SaveDialogOptions): Promise<string | null> =>
    ipcRenderer.invoke('fs:showSaveDialog', options),
  writeFile: (filePath: string, data: ArrayBuffer): Promise<void> =>
    ipcRenderer.invoke('fs:writeFile', filePath, data),
  getDefaultRecordingDir: (): Promise<string> =>
    ipcRenderer.invoke('fs:getDefaultRecordingDir'),
};

// Expose bridges to renderer via contextBridge
contextBridge.exposeInMainWorld('electronAudio', audioBridge);
contextBridge.exposeInMainWorld('electronMidi', midiBridge);
contextBridge.exposeInMainWorld('electronFs', fsBridge);

// Type definitions for the bridges (used in preload scope)
interface AudioDeviceInfo {
  id: string;
  name: string;
  kind: 'audioinput' | 'audiooutput';
  sampleRates: number[];
  bufferSizes: number[];
  isDefault: boolean;
}

interface MidiDeviceInfo {
  id: string;
  name: string;
  type: 'input' | 'output';
  connection: 'usb' | 'bluetooth';
}

interface MidiMessage {
  deviceId: string;
  channel: number;
  type: 'cc' | 'program_change' | 'note_on' | 'note_off';
  number: number;
  value: number;
  timestamp: number;
}

interface SaveDialogOptions {
  defaultPath?: string;
  filters?: Array<{ name: string; extensions: string[] }>;
  title?: string;
}
