import express from "express";
import cors from "cors";
import http from "http";
import mongoose from "mongoose";
import fs from "fs";
import { env } from "./config/env.js";
import assignmentRoutes from "./routes/assignments.js";
import { initWebSocket } from "./websocket/io.js";
import { createGenerationWorker } from "./workers/generationWorker.js";
import { createPdfWorker } from "./workers/pdfWorker.js";

const app = express();
const server = http.createServer(app);

initWebSocket(server);

app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (!fs.existsSync(env.uploadDir)) {
  fs.mkdirSync(env.uploadDir, { recursive: true });
}

app.get("/health", (_req, res) => {
  res.json({ status: "ok", mockAi: env.useMockAi });
});

app.use("/api/assignments", assignmentRoutes);

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
);

async function bootstrap(): Promise<void> {
  await mongoose.connect(env.mongodbUri);
  console.log("Connected to MongoDB");

  createGenerationWorker();
  createPdfWorker();
  console.log("BullMQ workers running in-process");

  server.listen(env.port, () => {
    console.log(`API listening on http://localhost:${env.port}`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});
