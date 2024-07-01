const { ipcRenderer } = require('electron');

document.getElementById('selectFiles').addEventListener('click', () => {
  ipcRenderer.invoke('open-file-dialog').then((filePaths) => {
    if (filePaths) {
      document.getElementById('fileList').textContent = filePaths.join('\n');
    } else {
      document.getElementById('fileList').textContent = 'No files selected';
    }
  });
});

document.getElementById('submit').addEventListener('click', () => {
  const fileListContent = document.getElementById('fileList').textContent;
  if (fileListContent === 'No files selected') {
    alert('Please select files first.');
    return;
  }

  const files = fileListContent.split('\n').map(file => file.trim()).filter(file => file !== '');
  const searchValue = document.getElementById('searchValue').value;
  const replaceValue = document.getElementById('replaceValue').value;

  if (searchValue === '') {
    alert('Please enter a search value.');
    return;
  }

  ipcRenderer.send('find-and-replace', { files, searchValue, replaceValue });
});
