const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

function createMainWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1024,
    minHeight: 720,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const startUrl = process.env.ELECTRON_START_URL;
  const distIndex = path.join(__dirname, '..', 'dist', 'index.html');

  const loadApp = () => {
    if (startUrl) {
      mainWindow.loadURL(startUrl).catch(() => {
        if (fs.existsSync(distIndex)) {
          mainWindow.loadFile(distIndex);
        }
      });
    } else if (fs.existsSync(distIndex)) {
      mainWindow.loadFile(distIndex);
    } else {
      mainWindow.loadURL('data:text/html,<h1>DocTrack is not built yet.</h1>');
    }
  };

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.on('did-fail-load', () => {
    if (fs.existsSync(distIndex)) {
      mainWindow.loadFile(distIndex);
    }
  });

  loadApp();
}

app.whenReady().then(() => {
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
