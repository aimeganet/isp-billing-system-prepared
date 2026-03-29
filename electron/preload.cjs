const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("desktopApp", {
  getInfo: () => ipcRenderer.invoke("app:get-info"),
  openUserDataFolder: () => ipcRenderer.invoke("app:open-user-data")
});
