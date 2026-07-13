import { contextBridge } from "electron";

contextBridge.exposeInMainWorld("electronApp", {
  name: "DocTrack",
});
