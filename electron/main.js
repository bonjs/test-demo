const { app, BrowserWindow, dialog } = require("electron");
const path = require("path");
const { autoUpdater } = require("electron-updater");

const log = require("electron-log");
const isProd = process.env.NODE_ENV === "production";

const { ipcMain } = require("electron");


log.info("Electron App 启动！");
log.info("资源路径:", process.resourcesPath);
log.info("当前环境:", process.env.NODE_ENV);

process.on("uncaughtException", (error) => {
  log.error("Uncaught Exception: ", error);
});

ipcMain.handle("get-data", async (event, url) => {
  log.info("main进程 getdata", url);
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.log("error", error);
    return { error: error.message };
  }
});
ipcMain.handle("update", async (event, url) => {
  checkForUpdates();
});



function createWindow() {
const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
        nodeIntegration: false,   // 禁用 nodeIntegration
        contextIsolation: true,   // 启用 contextIsolation
        // webSecurity: false, // 禁用 Web 安全性（不推荐，安全性降低）
        allowRunningInsecureContent: true, // 允许加载本地文件
        additionalArguments: ['--disable-features=IsolateOrigins,site-per-process'], // 解决 CSP 问题
        preload: path.join(__dirname, 'preload.js') // 正确的 preload.js 路径
    }
});
    

  // 加载 Vue 3 生成的 HTML 文件
  if (app.isPackaged) {
    // console.log('生产模式')
    // 生产模式：加载打包后的 index.html
    // let indexPath = path.join(process.resourcesPath, 'app.asar', 'dist', 'index.html');
    // let path = path.join(process.resourcesPath, 'dist', 'index.html');
    let indexPath = path.join(__dirname, '..', 'dist', 'index.html')
    log.info(indexPath)
    win.loadFile(indexPath); 
  } else {
    // 开发模式：加载 Vite 服务器
    log.info("开发模式：加载 Vite 服务器");
    win.loadURL("http://localhost:3000");
    win.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  app.on('web-contents-created', (_, contents) => {
    contents.session.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          "Content-Security-Policy": ["default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval'"]
        }
      });
    });
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

function checkForUpdates() {
  console.log("checkForUpdates");
  autoUpdater.forceDevUpdateConfig = true;
  autoUpdater.checkForUpdatesAndNotify();

  autoUpdater.on("update-available", () => {
    dialog.showMessageBox({
      type: "info",
      title: "Update Available",
      message: "A new version is available. Downloading...",
    });
  });

  autoUpdater.on("update-downloaded", () => {
    dialog.showMessageBox(
      {
        type: "question",
        buttons: ["Restart", "Later"],
        title: "Update Ready",
        message: "Update downloaded, restart now?",
      },
      (response) => {
        if (response === 0) autoUpdater.quitAndInstall();
      }
    );
  });

  autoUpdater.on("error", (error) => {
    dialog.showErrorBox(
      "Update Error",
      error == null ? "unknown" : error.toString()
    );
  });
}
