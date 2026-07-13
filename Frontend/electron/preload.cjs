const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electronApp', {
  name: 'DocTrack',
});
