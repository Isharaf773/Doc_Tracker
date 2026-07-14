import app, { initializeApp } from "../app.js";

export default async function handler(req, res) {
  try {
    await initializeApp();
    return app(req, res);
  } catch (error) {
    console.error("DocTrack initialization failed:", error);
    return res.status(500).json({ error: "Backend initialization failed." });
  }
}
