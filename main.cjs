const { app, BrowserWindow, globalShortcut, ipcMain, screen } = require('electron');

let mainWindow;

function createWindow() {
  const widgetWidth = 440;
  const widgetHeight = 680;

  // Calculate bottom-right positioning based on primary display work area
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const initialX = width - widgetWidth - 20;
  const initialY = height - widgetHeight - 20;

  mainWindow = new BrowserWindow({
    width: widgetWidth,
    height: widgetHeight,
    x: initialX,
    y: initialY,
    frame: false,            // Removes title bar, close/minimize buttons, and window frame
    transparent: true,       // Enables transparent CSS background so only the widget renders
    alwaysOnTop: true,       // Keeps widget floating above all software
    resizable: false,        // Fixed floating widget size
    hasShadow: false,        // Lets custom CSS handle ambient neon glow shadows
    skipTaskbar: false,      // Accessible in taskbar / dock
    backgroundColor: '#00000000', // Fully transparent window canvas
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Stay on top of full-screen apps, games, and presentation screens with high priority
  try {
    mainWindow.setAlwaysOnTop(true, 'screen-saver', 1);
  } catch (e) {
    mainWindow.setAlwaysOnTop(true);
  }

  // Stay visible across all virtual desktops and macOS workspaces
  if (typeof mainWindow.setVisibleOnAllWorkspaces === 'function') {
    mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  }

  // Loads built React app with #desktop-widget route
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000/#desktop-widget');
  } else {
    mainWindow.loadFile('dist/index.html', { hash: 'desktop-widget' });
  }

  // Optional IPC Handler for dynamic click-through switching
  ipcMain.on('set-ignore-mouse-events', (event, ignore, options) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
      win.setIgnoreMouseEvents(ignore, { forward: true, ...(options || {}) });
    }
  });

  // IPC Handlers for window controls (hide, close, minimize)
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
    if (!mainWindow) return;
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
