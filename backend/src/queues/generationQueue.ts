import { Queue } from "bullmq";
import { redisConnection } from "../config/redis.js";

export const GENERATION_QUEUE = "assessment-generation";
export const PDF_QUEUE = "assessment-pdf";

export interface GenerationJobData {
  assignmentId: string;
}

export interface PdfJobData {
  assignmentId: string;
}

export const generationQueue = new Queue<GenerationJobData>(GENERATION_QUEUE, {
  connection: redisConnection,
});

export const pdfQueue = new Queue<PdfJobData>(PDF_QUEUE, {
  connection: redisConnection,
});
