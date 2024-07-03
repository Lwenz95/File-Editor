const { contextBridge, ipcRenderer } = require('electron');

document.getElementById('selectFiles').addEventListener('click', () => {
  ipcRenderer.invoke('open-file-dialog').then((filePaths) => {
    if (filePaths) {
      document.getElementById('fileList').textContent = filePaths.join('\n');
    } else {
      document.getElementById('fileList').textContent = 'Keine Dateien ausgewählt';
    }
  });
});

document.getElementById('submit').addEventListener('click', () => {
  const fileListContent = document.getElementById('fileList').textContent;
  if (fileListContent === 'Keine Dateien ausgewählt') {
    alert('Bitte wähle eine oder mehrere Dateien aus.');
    return;
  }

  const files = fileListContent.split('\n').map(file => file.trim()).filter(file => file !== '');
  const searchValue = document.getElementById('searchValue').value;
  const replaceValue = document.getElementById('replaceValue').value;

  if (searchValue === '') {
    alert('Bitte gebe einen Wert ein.');
    return;
  }

  ipcRenderer.send('find-and-replace', { files, searchValue, replaceValue });
});
