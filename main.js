"use strict";
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('node:path');
const fs = require('fs');

let win;

//threw an error causing it to break
/* require("electron-reloader")(__dirname, {
  electron: path.join(__dirname, "node_modules", "bin", "electron"),
  hardResetMethod: "exit"
}); */

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: false,
      enableRemoteModule: true,
      nodeIntegration: true
    }
  });

  win.loadFile('index.html');
}

try {
	require('electron-reloader')(module);
} catch {}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on('find-and-replace', (event, args) => {
  const { files, searchValue, replaceValue } = args;
  findAndReplaceInFiles(files, searchValue, replaceValue);
});

function findAndReplaceInFiles(files, searchValue, replaceValue) {
  files.forEach((file) => {
    const filePath = path.resolve(file);

    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error(`Error reading file ${filePath}:`, err);
        return;
      }

      if (data.includes(searchValue)) {
        const updatedContent = data.split(searchValue).join(replaceValue);

        fs.writeFile(filePath, updatedContent, 'utf8', (err) => {
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

ipcMain.handle('open-file-dialog', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections']
  });

  if (result.canceled) {
    return null;
  } else {
    return result.filePaths;
  }
});
