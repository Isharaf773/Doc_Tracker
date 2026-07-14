import app, { initializeApp } from "./app.js";

const port = process.env.PORT || 8080;

try {
  await initializeApp();

  app.listen(port, "0.0.0.0", () => {
    console.log(`DocTrack backend running on http://127.0.0.1:${port}`);
  });
} catch (error) {
  console.error("DocTrack backend failed to start:", error);
  process.exit(1);
}
