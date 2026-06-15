const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const electronDist = path.join(root, "node_modules", "electron", "dist");
const outputDir = path.join(root, "release", "DocTrack-portable");
const resourcesApp = path.join(outputDir, "resources", "app");

function copyDir(from, to) {
  fs.cpSync(from, to, { recursive: true, force: true });
}

fs.rmSync(outputDir, { recursive: true, force: true });
copyDir(electronDist, outputDir);

fs.mkdirSync(resourcesApp, { recursive: true });
copyDir(path.join(root, "dist"), path.join(resourcesApp, "dist"));
copyDir(path.join(root, "electron"), path.join(resourcesApp, "electron"));
fs.copyFileSync(path.join(root, "package.json"), path.join(resourcesApp, "package.json"));
fs.copyFileSync(path.join(outputDir, "electron.exe"), path.join(outputDir, "DocTrack.exe"));

console.log(`Created portable desktop app: ${outputDir}`);
console.log("Run DocTrack.exe from that folder.");
