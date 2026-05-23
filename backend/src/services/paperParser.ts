import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import type {
  AssignmentInput,
  GeneratedPaper,
  GeneratedQuestion,
  GeneratedSection,
  QuestionType,
} from "../types/assessment.js";

// ── Schemas ──────────────────────────────────────────────────────────────────

const DifficultySchema = z
  .string()
  .transform((v) => v.toLowerCase().trim())
  .pipe(z.enum(["easy", "medium", "hard"]));

const QuestionTypeSchema = z.enum([
  "mcq",
  "short_answer",
  "long_answer",
  "true_false",
  "fill_blank",
]);

const RawQuestionSchema = z.object({
  text: z.string().min(1),
  difficulty: DifficultySchema,
  marks: z.union([z.number(), z.string().transform(Number)]).pipe(
    z.number().positive()
  ),
  type: QuestionTypeSchema,
  options: z.array(z.string()).optional().default([]),
});

const RawSectionSchema = z.object({
  label: z.string().min(1),
  title: z.string().min(1),
  instruction: z.string().min(1),
  questions: z.array(RawQuestionSchema).min(1),
});

const RawPaperSchema = z.object({
  title: z.string().min(1),
  subject: z.string().nullable().optional(),
  totalMarks: z.union([z.number(), z.string().transform(Number)]).pipe(
    z.number().positive()
  ),
  durationMinutes: z
    .union([z.number(), z.string().transform(Number)])
    .pipe(z.number().positive())
    .optional(),
  sections: z.array(RawSectionSchema).min(1),
});

// ── JSON extraction ───────────────────────────────────────────────────────────

function extractJson(raw: string): unknown {
  const trimmed = raw.trim();

  // Strip markdown code fences if present
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1].trim() : trimmed;

  // Find outermost JSON object
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("No JSON object found in model response");
  }

  try {
    return JSON.parse(candidate.slice(start, end + 1));
  } catch {
    // Last-resort: fix common LLM JSON mistakes (trailing commas)
    const cleaned = candidate
      .slice(start, end + 1)
      .replace(/,\s*([}\]])/g, "$1");
    return JSON.parse(cleaned);
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export function parsePaperResponse(
  raw: string,
  fallbackTitle: string
): GeneratedPaper {
  let parsed: z.infer<typeof RawPaperSchema>;
  try {
    parsed = RawPaperSchema.parse(extractJson(raw));
  } catch (err) {
    const msg =
      err instanceof z.ZodError
        ? err.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; ")
        : String(err);
    throw new Error(`Failed to parse AI response: ${msg}`);
  }

  let questionNumber = 1;
  const sections: GeneratedSection[] = parsed.sections.map((section) => {
    const questions: GeneratedQuestion[] = section.questions.map((q) => {
      const question: GeneratedQuestion = {
        id: uuidv4(),
        number: questionNumber++,
        text: q.text.trim(),
        difficulty: q.difficulty,
        marks: q.marks,
        type: q.type as QuestionType,
        options: [],
      };

      // Only attach options for MCQ; ensure exactly 4
      if (q.type === "mcq") {
        if (q.options && q.options.length >= 4) {
          question.options = q.options.slice(0, 4);
        } else if (q.options && q.options.length > 0) {
          const padded = [...q.options];
          while (padded.length < 4) padded.push(`Option ${padded.length + 1}`);
          question.options = padded;
        } else {
          question.options = ["Option A", "Option B", "Option C", "Option D"];
        }
      }

      return question;
    });

    return {
      id: uuidv4(),
      label: section.label.toUpperCase(),
      title: section.title,
      instruction: section.instruction,
      questions,
    };
  });

  return {
    title: parsed.title || fallbackTitle,
    subject: parsed.subject ?? undefined,
    totalMarks: parsed.totalMarks,
    durationMinutes: parsed.durationMinutes,
    sections,
    generatedAt: new Date().toISOString(),
  };
}

// ── Mock paper (used when USE_MOCK_AI=true) ───────────────────────────────────

export function buildMockPaper(input: AssignmentInput): GeneratedPaper {
  const difficulties = ["easy", "medium", "hard"] as const;
  let questionNumber = 1;

  const sections: GeneratedSection[] = input.questionTypes.map(
    (qt, sectionIndex) => {
      const label = String.fromCharCode(65 + sectionIndex);
      const questions: GeneratedQuestion[] = Array.from(
        { length: qt.count },
        (_, i) => {
          const difficulty = difficulties[i % 3];
          const base: GeneratedQuestion = {
            id: uuidv4(),
            number: questionNumber++,
            text: getMockQuestionText(qt.type, i + 1, input.title),
            difficulty,
            marks: qt.marksPerQuestion,
            type: qt.type,
            options: [],
          };
          if (qt.type === "mcq") {
            base.options = ["Option A", "Option B", "Option C", "Option D"];
          }
          return base;
        }
      );

      return {
        id: uuidv4(),
        label,
        title: `Section ${label} — ${formatType(qt.type)}`,
        instruction:
          qt.type === "mcq"
            ? "Choose the correct option for each question."
            : "Attempt all questions in this section.",
        questions,
      };
    }
  );

  return {
    title: input.title,
    subject: input.subject,
    totalMarks: input.totalMarks,
    durationMinutes: Math.max(60, input.totalQuestions * 3),
    sections,
    generatedAt: new Date().toISOString(),
  };
}

// ── Private helpers ───────────────────────────────────────────────────────────

function formatType(type: QuestionType): string {
  const labels: Record<QuestionType, string> = {
    mcq: "Multiple Choice",
    short_answer: "Short Answer",
    long_answer: "Long Answer",
    true_false: "True / False",
    fill_blank: "Fill in the Blanks",
  };
  return labels[type];
}

function getMockQuestionText(
  type: QuestionType,
  index: number,
  title: string
): string {
  const topic = title || "the subject";
  switch (type) {
    case "mcq":
      return `Which of the following best describes a key concept related to ${topic}? (Q${index})`;
    case "short_answer":
      return `Briefly explain an important principle in ${topic}. (Q${index})`;
    case "long_answer":
      return `Discuss in detail how core ideas in ${topic} apply to real-world scenarios. (Q${index})`;
    case "true_false":
      return `State whether the following assertion about ${topic} is True or False, with justification. (Q${index})`;
    case "fill_blank":
      return `Complete: The fundamental unit of study in ${topic} is ________. (Q${index})`;
    default:
      return `Question ${index} on ${topic}.`;
  }
}
