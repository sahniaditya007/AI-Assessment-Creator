import mongoose from "mongoose";
import { env } from "../config/env.js";
import { createGenerationWorker } from "./generationWorker.js";
import { createPdfWorker } from "./pdfWorker.js";

async function main(): Promise<void> {
  await mongoose.connect(env.mongodbUri);
  console.log("Worker connected to MongoDB");

  const generationWorker = createGenerationWorker();
  const pdfWorker = createPdfWorker();

  console.log("BullMQ workers started");

  const shutdown = async () => {
    await generationWorker.close();
    await pdfWorker.close();
    await mongoose.disconnect();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
