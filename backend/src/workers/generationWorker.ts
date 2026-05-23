import { Worker } from "bullmq";
import { redisConnection } from "../config/redis.js";
import { GENERATION_QUEUE } from "../queues/generationQueue.js";
import type { GenerationJobData } from "../queues/generationQueue.js";
import { Assignment } from "../models/Assignment.js";
import { generateQuestionPaper } from "../services/aiService.js";
import { cachePaper, invalidatePaper, setJobState } from "../services/cacheService.js";
import { emitJobProgress } from "../websocket/io.js";
import type { AssignmentInput, AssignmentStatus } from "../types/assessment.js";

export function createGenerationWorker(): Worker<GenerationJobData> {
  const worker = new Worker<GenerationJobData>(
    GENERATION_QUEUE,
    async (job) => {
      const { assignmentId } = job.data;
      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) {
        throw new Error(`Assignment ${assignmentId} not found`);
      }

      // Clear any stale cached paper before starting
      await invalidatePaper(assignmentId);

      assignment.status = "generating";
      assignment.progress = 0;
      assignment.error = undefined;
      await assignment.save();

      /**
       * Persist progress to DB + Redis and push a WebSocket event.
       * Keeping DB writes minimal — only save at key milestones.
       */
      const notify = async (
        progress: number,
        message: string,
        status: AssignmentStatus = "generating",
        saveToDb = false
      ) => {
        assignment.progress = progress;
        assignment.statusMessage = message;
        assignment.status = status;

        if (saveToDb) {
          await assignment.save();
        }

        await setJobState(assignmentId, { progress, message, status });

        emitJobProgress({
          assignmentId,
          status,
          progress,
          message,
          paper: assignment.paper,
          error: assignment.error,
        });
      };

      // ── Step 1: Validate & prepare ──────────────────────────────────────
      await notify(5, "Validating assignment configuration...");

      const input: AssignmentInput = {
        title: assignment.title,
        subject: assignment.subject,
        dueDate: assignment.dueDate.toISOString(),
        questionTypes: assignment.questionTypes,
        totalQuestions: assignment.totalQuestions,
        totalMarks: assignment.totalMarks,
        additionalInstructions: assignment.additionalInstructions,
        sourceFileText: assignment.sourceFileText,
      };

      // ── Step 2: Build prompt ─────────────────────────────────────────────
      await notify(15, "Building structured prompt...", "generating", true);

      // ── Step 3: Send to AI ───────────────────────────────────────────────
      await notify(25, "Sending request to AI model...");

      // Emit a mid-generation heartbeat after a short delay so the UI
      // doesn't appear frozen during the LLM call (which can take 5–20s).
      const heartbeatTimer = setInterval(() => {
        const current = assignment.progress;
        if (current >= 25 && current < 70) {
          const next = Math.min(current + 5, 70);
          void notify(next, "AI is generating questions...");
        }
      }, 3000);

      let paper;
      try {
        paper = await generateQuestionPaper(input);
      } finally {
        clearInterval(heartbeatTimer);
      }

      // ── Step 4: Parse & validate output ─────────────────────────────────
      await notify(80, "Parsing and validating AI output...", "generating", true);

      // ── Step 5: Cache & persist ──────────────────────────────────────────
      await notify(90, "Saving question paper...");
      await cachePaper(assignmentId, paper);

      assignment.paper = paper;
      assignment.status = "completed";
      assignment.progress = 100;
      assignment.statusMessage = "Question paper ready";
      assignment.error = undefined;
      await assignment.save();

      emitJobProgress({
        assignmentId,
        status: "completed",
        progress: 100,
        message: "Question paper ready",
        paper,
      });
    },
    { connection: redisConnection, concurrency: 2 }
  );

  worker.on("failed", async (job, err) => {
    if (!job?.data.assignmentId) return;
    const { assignmentId } = job.data;

    console.error(`[GenerationWorker] Job failed for ${assignmentId}:`, err.message);

    try {
      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) return;

      assignment.status = "failed";
      assignment.error = err.message;
      assignment.statusMessage = "Generation failed";
      await assignment.save();

      emitJobProgress({
        assignmentId,
        status: "failed",
        progress: assignment.progress,
        message: "Generation failed",
        error: err.message,
      });
    } catch (saveErr) {
      console.error(`[GenerationWorker] Could not persist failure state:`, saveErr);
    }
  });

  return worker;
}
