const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 440,
    height: 680,
    alwaysOnTop: true,      // Keeps widget above all software
    frame: false,            // Removes title bar for frameless floating look
    transparent: true,       // Enables see-through glass background
    resizable: true,         // Allows customizable floating bounds
    skipTaskbar: true,       // Stays lightweight in background without cluttering taskbar
    hasShadow: false,        // Lets custom CSS handle ambient neon glow shadows
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Stay on top of full-screen apps, games, and presentation screens
  try {
    mainWindow.setAlwaysOnTop(true, 'screen-saver');
  } catch (e) {
    mainWindow.setAlwaysOnTop(true);
  }

  // Stay visible across all virtual desktops and macOS workspaces
  if (typeof mainWindow.setVisibleOnAllWorkspaces === 'function') {
    mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  }

  // Loads your built React app (or dev server)
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    mainWindow.loadFile('dist/index.html');
  }

  // Optional IPC Handler for dynamic click-through switching (e.g. transparent click-through mode)
  ipcMain.on('set-ignore-mouse-events', (event, ignore, options) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
      win.setIgnoreMouseEvents(ignore, { forward: true, ...(options || {}) });
    }
  });

  // IPC Handler for window controls (hide, close, minimize)
  ipcMain.on('window-minimize', () => {
    if (mainWindow) mainWindow.minimize();
  });

  ipcMain.on('window-hide', () => {
    if (mainWindow) mainWindow.hide();
  });

  ipcMain.on('window-close', () => {
    if (mainWindow) mainWindow.close();
  });

  // Register Global Hotkey (Win: Ctrl+Shift+Backspace / Mac: Cmd+Backspace)
  const hotkey = process.platform === 'darwin' ? 'Cmd+Backspace' : 'Ctrl+Shift+Backspace';

  globalShortcut.register(hotkey, () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

app.whenReady().then(createWindow);

// Unregister hotkeys when exiting
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

