/**
 * Electron Audio Bridge
 *
 * Provides native audio device enumeration and buffer size control
 * via IPC handlers. Supplements the Web Audio API with OS-level
 * device access that isn't available in the browser sandbox.
 */
import type { IpcMain } from 'electron';

export interface AudioDeviceInfo {
  id: string;
  name: string;
  kind: 'audioinput' | 'audiooutput';
  sampleRates: number[];
  bufferSizes: number[];
  isDefault: boolean;
}

interface AudioBridgeState {
  bufferSize: number;
  sampleRate: number;
}

const state: AudioBridgeState = {
  bufferSize: 256,
  sampleRate: 44100,
};

const SUPPORTED_BUFFER_SIZES = [64, 128, 256, 512, 1024, 2048];
const SUPPORTED_SAMPLE_RATES = [44100, 48000, 96000];

export function registerAudioBridge(ipcMain: IpcMain): void {
  ipcMain.handle('audio:getDevices', async (): Promise<AudioDeviceInfo[]> => {
    // In production, this would use native OS APIs (e.g., PortAudio bindings)
    // to enumerate audio devices with full capability info.
    // For now, return a placeholder that the renderer can extend
    // with navigator.mediaDevices.enumerateDevices() data.
    return [];
  });

  ipcMain.handle('audio:setBufferSize', async (_event, size: number): Promise<void> => {
    if (!SUPPORTED_BUFFER_SIZES.includes(size)) {
      throw new Error(`Unsupported buffer size: ${size}. Supported: ${SUPPORTED_BUFFER_SIZES.join(', ')}`);
    }
    state.bufferSize = size;
  });

  ipcMain.handle('audio:getBufferSize', async (): Promise<number> => {
    return state.bufferSize;
  });

  ipcMain.handle('audio:setSampleRate', async (_event, rate: number): Promise<void> => {
    if (!SUPPORTED_SAMPLE_RATES.includes(rate)) {
      throw new Error(`Unsupported sample rate: ${rate}. Supported: ${SUPPORTED_SAMPLE_RATES.join(', ')}`);
    }
    state.sampleRate = rate;
  });

  ipcMain.handle('audio:getSampleRate', async (): Promise<number> => {
    return state.sampleRate;
  });
}
