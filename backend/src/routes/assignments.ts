import { Router } from "express";
import multer from "multer";
import fs from "fs/promises";
import path from "path";
import { Assignment } from "../models/Assignment.js";
import { CreateAssignmentSchema } from "../middleware/validateAssignment.js";
import { generationQueue, pdfQueue } from "../queues/generationQueue.js";
import { env } from "../config/env.js";
import {
  getCachedPaper,
  invalidatePaper,
  invalidateJobState,
} from "../services/cacheService.js";
import { emitJobProgress } from "../websocket/io.js";

const router = Router();

// ── File upload config ────────────────────────────────────────────────────────

const upload = multer({
  storage: multer.diskStorage({
    destination: env.uploadDir,
    filename: (_req, file, cb) => {
      const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
      cb(null, `${Date.now()}-${safe}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ["application/pdf", "text/plain", "text/markdown"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(file.mimetype) || ext === ".txt" || ext === ".md") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF or text files are allowed"));
    }
  },
});

// ── Helpers ───────────────────────────────────────────────────────────────────

async function readSourceText(
  file?: Express.Multer.File
): Promise<{ text?: string; fileName?: string }> {
  if (!file) return {};
  const fileName = file.originalname;
  if (file.mimetype === "text/plain" || file.mimetype === "text/markdown") {
    const text = await fs.readFile(file.path, "utf-8");
    return { text: text.slice(0, 20000), fileName };
  }
  // PDF: store a placeholder; actual content extraction can be added later
  return {
    text: `[PDF uploaded: ${fileName}. Content used as reference context.]`,
    fileName,
  };
}

// ── Routes ────────────────────────────────────────────────────────────────────

/**
 * POST /api/assignments
 * Create a new assignment (multipart/form-data).
 */
router.post("/", upload.single("sourceFile"), async (req, res, next) => {
  try {
    const questionTypesRaw =
      typeof req.body.questionTypes === "string"
        ? JSON.parse(req.body.questionTypes)
        : req.body.questionTypes;

    const parsed = CreateAssignmentSchema.safeParse({
      title: req.body.title,
      subject: req.body.subject || undefined,
      dueDate: req.body.dueDate,
      questionTypes: questionTypesRaw,
      totalQuestions: Number(req.body.totalQuestions),
      totalMarks: Number(req.body.totalMarks),
      additionalInstructions: req.body.additionalInstructions || undefined,
    });

    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const body = parsed.data;

    // Cross-field validation: counts must sum to totalQuestions
    const countSum = body.questionTypes.reduce((s, qt) => s + qt.count, 0);
    if (countSum !== body.totalQuestions) {
      res.status(400).json({
        error: `Sum of question counts (${countSum}) must equal total questions (${body.totalQuestions})`,
      });
      return;
    }

    // Cross-field validation: marks must sum to totalMarks
    const marksSum = body.questionTypes.reduce(
      (s, qt) => s + qt.count * qt.marksPerQuestion,
      0
    );
    if (marksSum !== body.totalMarks) {
      res.status(400).json({
        error: `Sum of (count × marks) (${marksSum}) must equal total marks (${body.totalMarks})`,
      });
      return;
    }

    const dueDate = new Date(body.dueDate);
    if (Number.isNaN(dueDate.getTime())) {
      res.status(400).json({ error: "Invalid due date" });
      return;
    }

    const { text, fileName } = await readSourceText(req.file);

    const assignment = await Assignment.create({
      title: body.title,
      subject: body.subject,
      dueDate,
      questionTypes: body.questionTypes,
      totalQuestions: body.totalQuestions,
      totalMarks: body.totalMarks,
      additionalInstructions: body.additionalInstructions,
      sourceFileName: fileName,
      sourceFileText: text,
      status: "draft",
    });

    res.status(201).json(assignment);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/assignments
 * List assignments (latest 50, paper content excluded).
 * Supports ?status= filter.
 */
router.get("/", async (req, res, next) => {
  try {
    const filter: Record<string, unknown> = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const assignments = await Assignment.find(filter)
      .sort({ createdAt: -1 })
      .select("-paper -sourceFileText")
      .limit(50);

    res.json(assignments);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/assignments/:id
 * Get a single assignment (includes paper if generated).
 */
router.get("/:id", async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      res.status(404).json({ error: "Assignment not found" });
      return;
    }
    res.json(assignment);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/assignments/:id/generate
 * Queue initial paper generation.
 */
router.post("/:id/generate", async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      res.status(404).json({ error: "Assignment not found" });
      return;
    }

    if (assignment.status === "generating" || assignment.status === "queued") {
      res.status(409).json({ error: "Generation already in progress" });
      return;
    }

    assignment.status = "queued";
    assignment.progress = 0;
    assignment.statusMessage = "Queued for generation";
    assignment.paper = undefined;
    assignment.error = undefined;
    await assignment.save();

    await generationQueue.add(
      "generate",
      { assignmentId: assignment.id },
      { removeOnComplete: 100, removeOnFail: 50 }
    );

    emitJobProgress({
      assignmentId: assignment.id,
      status: "queued",
      progress: 0,
      message: "Queued for generation",
    });

    res.json({ id: assignment.id, status: "queued", message: "Generation job queued" });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/assignments/:id/regenerate
 * Re-queue generation, clearing any existing paper and cache.
 */
router.post("/:id/regenerate", async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      res.status(404).json({ error: "Assignment not found" });
      return;
    }

    // Clear stale cache before re-queuing
    await Promise.all([
      invalidatePaper(assignment.id),
      invalidateJobState(assignment.id),
    ]);

    assignment.status = "queued";
    assignment.progress = 0;
    assignment.statusMessage = "Queued for regeneration";
    assignment.paper = undefined;
    assignment.error = undefined;
    await assignment.save();

    await generationQueue.add(
      "generate",
      { assignmentId: assignment.id },
      { removeOnComplete: 100, removeOnFail: 50 }
    );

    emitJobProgress({
      assignmentId: assignment.id,
      status: "queued",
      progress: 0,
      message: "Queued for regeneration",
    });

    res.json({ id: assignment.id, status: "queued", message: "Regeneration job queued" });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/assignments/:id/paper
 * Get the generated paper JSON (checks Redis cache first, then DB).
 */
router.get("/:id/paper", async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      res.status(404).json({ error: "Assignment not found" });
      return;
    }

    const cached = await getCachedPaper(assignment.id);
    const paper = assignment.paper ?? cached;

    if (!paper) {
      res.status(404).json({ error: "Paper not generated yet" });
      return;
    }

    res.json({ assignmentId: assignment.id, paper });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/assignments/:id/pdf
 * Stream a PDF of the generated paper directly (on-the-fly generation).
 */
router.get("/:id/pdf", async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment?.paper) {
      res.status(404).json({ error: "Generate the paper first" });
      return;
    }

    const { generatePaperPdf } = await import("../services/pdfService.js");
    const buffer = await generatePaperPdf(assignment.paper);

    const safeName = assignment.title
      .replace(/[^a-zA-Z0-9-_ ]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .toLowerCase()
      .slice(0, 60);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${safeName || "question-paper"}-${req.params.id}.pdf"`
    );
    res.send(buffer);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/assignments/:id/pdf
 * Queue async PDF generation to disk (for pre-generation use cases).
 */
router.post("/:id/pdf", async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment?.paper) {
      res.status(404).json({ error: "Generate the paper first" });
      return;
    }

    await pdfQueue.add("pdf", { assignmentId: assignment.id });
    res.json({ message: "PDF generation queued" });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/assignments/:id
 * Delete an assignment and its cached data.
 */
router.delete("/:id", async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      res.status(404).json({ error: "Assignment not found" });
      return;
    }

    // Clean up Redis cache
    await Promise.all([
      invalidatePaper(assignment.id),
      invalidateJobState(assignment.id),
    ]);

    await assignment.deleteOne();
    res.json({ message: "Assignment deleted" });
  } catch (err) {
    next(err);
  }
});

export default router;
