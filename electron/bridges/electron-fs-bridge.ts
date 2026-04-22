/**
 * Electron File System Bridge
 *
 * Provides native file save dialogs and file writing for recordings.
 * The browser sandbox doesn't allow direct file system writes, so
 * this bridge enables the recording engine to save files natively.
 */
import type { IpcMain } from 'electron';
import { dialog, app } from 'electron';
import fs from 'fs/promises';
import path from 'path';

export interface SaveDialogOptions {
  defaultPath?: string;
  filters?: Array<{ name: string; extensions: string[] }>;
  title?: string;
}

const RECORDING_FILTERS = [
  { name: 'WAV Audio', extensions: ['wav'] },
  { name: 'MP3 Audio', extensions: ['mp3'] },
  { name: 'FLAC Audio', extensions: ['flac'] },
  { name: 'All Files', extensions: ['*'] },
];

export function registerFsBridge(ipcMain: IpcMain): void {
  ipcMain.handle(
    'fs:showSaveDialog',
    async (_event, options: SaveDialogOptions): Promise<string | null> => {
      const defaultDir = path.join(app.getPath('music'), 'AmpSimPlatform');

      const result = await dialog.showSaveDialog({
        title: options.title ?? 'Save Recording',
        defaultPath: options.defaultPath ?? defaultDir,
        filters: options.filters ?? RECORDING_FILTERS,
      });

      if (result.canceled || !result.filePath) {
        return null;
      }

      return result.filePath;
    }
  );

  ipcMain.handle(
    'fs:writeFile',
    async (_event, filePath: string, data: ArrayBuffer): Promise<void> => {
      // Ensure the directory exists
      const dir = path.dirname(filePath);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(filePath, Buffer.from(data));
    }
  );

  ipcMain.handle('fs:getDefaultRecordingDir', async (): Promise<string> => {
    const dir = path.join(app.getPath('music'), 'AmpSimPlatform');
    await fs.mkdir(dir, { recursive: true });
    return dir;
  });
}
