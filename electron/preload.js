const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  getData: (data) => ipcRenderer.invoke('get-data', data), // 发送请求并返回结果
  sendMessage: (channel, data) => ipcRenderer.send(channel, data),
  invokeMessage: (channel, data) => ipcRenderer.invoke(channel, data),
});

window.addEventListener("DOMContentLoaded", () => {
  console.log("Electron Preload Loaded");
});
