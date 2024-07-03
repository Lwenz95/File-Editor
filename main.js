"use strict";
const { app, BrowserWindow, ipcMain, dialog, globalShortcut, nativeImage, Menu, Template } = require("electron");
const path = require("node:path");
const fs = require("fs");
const { setupTitlebar, attachTitlebarToWindow } = require("custom-electron-titlebar/main");
const os = require("os");

app.setPath("userData", path.join(os.tmpdir(), "electron-file-editor"));

setupTitlebar();

let win;

//threw an error causing it to break
/* require("electron-reloader")(__dirname, {
  electron: path.join(__dirname, "node_modules", "bin", "electron"),
  hardResetMethod: "exit"
}); */


const createWindow = () => {
  win = new BrowserWindow({
    show: false,
    titleBarStyle: "hidden",
    titleBarOverlay: true,
    webPreferences: {
      //sandbox: false,
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      enableRemoteModule: true,
      nodeIntegration: true,
    }
  });

  //const menu = Menu.buildFromTemplate(template);

  //Menu.setApplicationMenu(menu);

  attachTitlebarToWindow(win);

  win.once("ready-to-show", () => {
    win.maximize();
    win.show();
  })

  win.loadFile("index.html");
}

try {
	require("electron-reloader")(module);
} catch (err) {
  console.error("Failed to load electron-reloader:", err);
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on("find-and-replace", (event, args) => {
  const { files, searchValue, replaceValue } = args;
  findAndReplaceInFiles(files, searchValue, replaceValue);
});

function findAndReplaceInFiles(files, searchValue, replaceValue) {
  files.forEach((file) => {
    const filePath = path.resolve(file);

    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        console.error(`Error reading file ${filePath}:`, err);
        return;
      }

      if (data.includes(searchValue)) {
        const updatedContent = data.split(searchValue).join(replaceValue);

        fs.writeFile(filePath, updatedContent, "utf8", (err) => {
          if (err) {
            console.error(`Error writing to file ${filePath}:`, err);
            return;
          }

          console.log(`Successfully updated ${filePath}`);
        });
      } else {
        console.log(`Search value not found in ${filePath}`);
      }
    });
  });
}

ipcMain.handle("open-file-dialog", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openFile", "multiSelections"]
  });

  if (result.canceled) {
    return null;
  } else {
    return result.filePaths;
  }
});

app.whenReady().then(() => {
  const ret = globalShortcut.register("f5", () => {
    console.log("f5 is pressed");
    win.reload();
  })

  globalShortcut.register("CommandOrControl+R", () => {
    console.log("CommandOrControl+R is pressed");
    win.reload();
  });
})
