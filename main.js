const { app, BrowserWindow, globalShortcut } = require('electron');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 420,
    height: 650,
    alwaysOnTop: true,      // Keeps widget above all software
    frame: false,            // Removes title bar
    transparent: true,       // Enables see-through glass background
    resizable: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Loads your built React app (or dev server)
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile('dist/index.html');
  }

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
