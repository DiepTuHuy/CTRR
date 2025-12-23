const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      sandbox: false, 
      webSecurity: false
    }
  });
  // Electron sẽ tìm giao diện trong thư mục 'dist' sau khi bạn build
  win.loadFile(path.join(__dirname, 'build/index.html'));
  win.webContents.openDevTools(); //
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});