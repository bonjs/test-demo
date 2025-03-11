const { app, BrowserWindow } = require('electron');
const path = require('path');

const { ipcMain } = require('electron');

ipcMain.handle('get-data', async (event, url) => {
    console.log('main进程 getdata', url)
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log(data)
    return data;
  } catch (error) {
    console.log('error', error)
    return { error: error.message };
  }
});


function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
    },
  });

  // 加载 Vue 3 生成的 HTML 文件
  win.loadURL('http://localhost:3000'); // Vite 开发服务器

  win.webContents.openDevTools();

}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
