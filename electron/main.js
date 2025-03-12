const { app, BrowserWindow, dialog } = require("electron");
const path = require("path");
const { autoUpdater } = require("electron-updater");
const printer = require('@thiagoelg/node-printer');

const log = require("electron-log");
const isProd = process.env.NODE_ENV === "production";

const { ipcMain } = require("electron");

log.info("Electron App 启动！");
log.info("资源路径:", process.resourcesPath);
log.info("当前环境:", process.env.NODE_ENV);

process.on("uncaughtException", (error) => {
  log.error("Uncaught Exception: ", error);
});


// 监听获取打印机列表的请求
ipcMain.handle('get-printers', () => {
    console.log('get-printer')
    return printer.getPrinters(); // 返回所有可用的打印机
});

// 监听打印请求
ipcMain.on('print-document', (_event, printData) => {
    printer.printDirect({
        printer: printData.printerName, // 选择的打印机
        text: printData.content, // 需要打印的内容
        type: 'RAW',
        success: () => console.log('打印成功'),
        error: (err) => console.error('打印失败:', err)
    });
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

checkForUpdates();

ipcMain.handle("update", async (event, url) => {
    console.log('main update')
    log.info('main update')
    autoUpdater.checkForUpdates();
});
ipcMain.handle("test-update", async (event, url) => {
    log.info('test update')

    autoUpdater.setFeedURL({
      provider: 'github',
      owner: 'bonjs',  // 替换为你的 GitHub 用户名
      repo: 'test-demo',  // 替换为你的仓库名
    });

    console.log('testestseatesat')

    autoUpdater.checkForUpdates();
});

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false, // 禁用 nodeIntegration
      contextIsolation: true, // 启用 contextIsolation
      // webSecurity: false, // 禁用 Web 安全性（不推荐，安全性降低）
      allowRunningInsecureContent: true, // 允许加载本地文件
      additionalArguments: [
        "--disable-features=IsolateOrigins,site-per-process",
      ], // 解决 CSP 问题
      preload: path.join(__dirname, "preload.js"), // 正确的 preload.js 路径
    },
  });

  // 加载 Vue 3 生成的 HTML 文件
  if (app.isPackaged) {
    // console.log('生产模式')
    // 生产模式：加载打包后的 index.html
    // let indexPath = path.join(process.resourcesPath, 'app.asar', 'dist', 'index.html');
    // let path = path.join(process.resourcesPath, 'dist', 'index.html');
    let indexPath = path.join(__dirname, "..", "dist", "index.html");
    log.info(indexPath);
    win.loadFile(indexPath);
  } else {
    // 开发模式：加载 Vite 服务器
    log.info("开发模式：加载 Vite 服务器");
    win.loadURL("http://localhost:3000");
  }
  win.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  app.on("web-contents-created", (_, contents) => {
    contents.session.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          "Content-Security-Policy": [
            "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval'",
          ],
        },
      });
    });
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

function checkForUpdates() {
  autoUpdater.autoDownload = false; // 设置为手动下载更新
  autoUpdater.on("update-available", (info) => {
    log.info('发现新版本')
    dialog
      .showMessageBox({
        type: "info",
        title: "发现新版本",
        message: `发现新版本 ${info.version}，是否立即更新？`,
        buttons: ["是", "否"],
      })
      .then((result) => {
        log.info('response:' + result.response)
        if (result.response === 0) {
          try {
            autoUpdater.downloadUpdate();
          } catch(e) {
            log.info(e.message);
          }
            
        }
      });
  });

  autoUpdater.on("update-downloaded", () => {
    dialog
      .showMessageBox({
        type: "info",
        title: "更新已下载",
        message: "新版本已下载，是否立即安装？",
        buttons: ["是", "稍后"],
      })
      .then((result) => {

        dialog.showMessageBox({
            type: "info",
            title: "aa",
            message: `${result.response}`,
            buttons: ["是", "否"],
        }).then(() => {
            if (result.response === 0) {
                setTimeout(() => {
                    autoUpdater.quitAndInstall(true, true);
                }, 2000); // 等待 2 秒后退出
            }
        })
      });
  });

  autoUpdater.on('download-progress', (progressObj) => {
    info.log(`下载进度: ${progressObj.percent}%`);
  });

  // **如果没有新版本，提示用户**
  autoUpdater.on('update-not-available', () => {
    dialog.showMessageBox({
      type: 'info',
      title: '检查更新',
      message: '当前已经是最新版本！',
      buttons: ['确定']
    });
  });

  autoUpdater.on("error", (error) => {
    console.error("更新出错:", error);
  });
}
