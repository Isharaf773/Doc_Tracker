const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("doctrackDesktop", {
  platform: process.platform,
});
