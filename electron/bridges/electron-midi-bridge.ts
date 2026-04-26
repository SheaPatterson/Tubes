/**
 * Electron MIDI Bridge
 *
 * Provides native USB and Bluetooth MIDI device access via IPC handlers.
 * Supplements the Web MIDI API with OS-level device enumeration and
 * connection management not available in the browser sandbox.
 */
import type { IpcMain, BrowserWindow } from 'electron';

export interface MidiDeviceInfo {
  id: string;
  name: string;
  type: 'input' | 'output';
  connection: 'usb' | 'bluetooth';
}

export interface MidiMessage {
  deviceId: string;
  channel: number;
  type: 'cc' | 'program_change' | 'note_on' | 'note_off';
  number: number;
  value: number;
  timestamp: number;
}

const openDevices = new Set<string>();

export function registerMidiBridge(ipcMain: IpcMain): void {
  ipcMain.handle('midi:getDevices', async (): Promise<MidiDeviceInfo[]> => {
    // In production, this would use native MIDI libraries (e.g., node-midi,
    // @julusian/midi) to enumerate USB and Bluetooth MIDI devices.
    // The Web MIDI API in Chromium handles most cases, but this bridge
    // provides access to Bluetooth MIDI and devices that require
    // OS-level permissions.
    return [];
  });

  ipcMain.handle('midi:openDevice', async (_event, deviceId: string): Promise<void> => {
    if (openDevices.has(deviceId)) {
      return; // Already open
    }
    // In production: open the native MIDI port and start forwarding
    // messages to the renderer via 'midi:message' events.
    openDevices.add(deviceId);
  });

  ipcMain.handle('midi:closeDevice', async (_event, deviceId: string): Promise<void> => {
    openDevices.delete(deviceId);
  });
}

/**
 * Forward a MIDI message from a native device to the renderer process.
 * Call this from the native MIDI listener when a message is received.
 */
export function forwardMidiMessage(window: BrowserWindow, message: MidiMessage): void {
  window.webContents.send('midi:message', message);
}

/**
 * Notify the renderer that the MIDI device list has changed.
 */
export function notifyMidiDeviceChange(window: BrowserWindow, devices: MidiDeviceInfo[]): void {
  window.webContents.send('midi:deviceChange', devices);
}
