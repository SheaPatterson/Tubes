import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { registerAudioBridge } from './bridges/electron-audio-bridge';
import { registerMidiBridge } from './bridges/electron-midi-bridge';
import { registerFsBridge } from './bridges/electron-fs-bridge';

const isDev = process.env.NODE_ENV === 'development';
const DEV_SERVER_URL = 'http://localhost:3000';

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'Amp Simulation Platform',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#0a0a0a',
  });

  if (isDev) {
    mainWindow.loadURL(DEV_SERVER_URL);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../out/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Register all Node.js bridges
function registerBridges(): void {
  registerAudioBridge(ipcMain);
  registerMidiBridge(ipcMain);
  registerFsBridge(ipcMain);
}

app.whenReady().then(() => {
  registerBridges();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
