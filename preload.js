const { contextBridge, ipcRenderer } = require("electron");
const path = require("path");
const { Titlebar, TitlebarColor } = require("custom-electron-titlebar");

window.addEventListener("DOMContentLoaded", () => {
    new Titlebar({
      backgroundColor: TitlebarColor.fromHex("#000"),
      overflow: "auto",
      icon: path.join(__dirname, 'icon.png'),
      iconSize: 20,
      titleHorizontalAlignment: "left",
      minimizable: true,
      maximizable: true,
      closeable: true,
      tooltips: {
        minimize: "Minimize",
        maximize: "Maximize",
        restoreDown: "Restore",
        close: "Close"
      },
      enableMnemonics: true,
      menuPosition: "left",
      transparent: 0.5
    });
  });

contextBridge.exposeInMainWorld("electron", {
    ipcRenderer: {
        send: (channel, data) => ipcRenderer.send(channel, data),
        receive: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
        invoke: (channel, data) => ipcRenderer.invoke(channel, data)
      }
});

window.addEventListener("DOMContentLoaded", () => {
    const replaceText = (selector, text) => {
        const element = document.getElementById(selector)
        if (element) element.innerText = text
    }

    for (const dependency of ["chrome", "node", "electron"]) {
        replaceText(`${dependency}-version`, process.versions[dependency])
    }
});