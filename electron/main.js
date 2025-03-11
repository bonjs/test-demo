const { app, BrowserWindow } = require("electron");
const path = require("path");
const { autoUpdater } = require("electron-updater");

const { ipcMain } = require("electron");

ipcMain.handle("get-data", async (event, url) => {
  console.log("main进程 getdata", url);
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
  if (process.env.NODE_ENV === "production") {
    // 生产模式：加载打包后的 index.html
    console.log("生产模式");
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  } else {
    // 开发模式：加载 Vite 服务器
    console.log("开发模式：加载 Vite 服务器");
    win.loadURL("http://localhost:3000");
  }

  win.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  checkForUpdates();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

function checkForUpdates() {
    console.log('checkForUpdates')
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
