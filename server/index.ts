import "dotenv/config";
import express from "express";
import cors from "cors";

export function createServer() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Health check
  app.get("/api/ping", (_req, res) => {
    res.json({ status: "ok", app: "VseOkNax" });
  });

  return app;
}
