import { Worker } from "bullmq";
import fs from "fs/promises";
import path from "path";
import { redisConnection } from "../config/redis.js";
import { PDF_QUEUE } from "../queues/generationQueue.js";
import type { PdfJobData } from "../queues/generationQueue.js";
import { Assignment } from "../models/Assignment.js";
import { env } from "../config/env.js";
import { generatePaperPdf } from "../services/pdfService.js";

export function createPdfWorker(): Worker<PdfJobData> {
  return new Worker<PdfJobData>(
    PDF_QUEUE,
    async (job) => {
      const { assignmentId } = job.data;
      const assignment = await Assignment.findById(assignmentId);
      if (!assignment?.paper) {
        throw new Error("Generated paper not found");
      }

      const buffer = await generatePaperPdf(assignment.paper);
      const fileName = `${assignmentId}.pdf`;
      const filePath = path.join(env.uploadDir, fileName);
      await fs.mkdir(env.uploadDir, { recursive: true });
      await fs.writeFile(filePath, buffer);

      await fs.writeFile(
        path.join(env.uploadDir, `${assignmentId}.pdf.meta.json`),
        JSON.stringify({ ready: true, fileName })
      );
    },
    { connection: redisConnection, concurrency: 2 }
  );
}
