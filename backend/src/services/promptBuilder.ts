import type { AssignmentInput } from "../types/assessment.js";

const QUESTION_TYPE_LABELS: Record<string, string> = {
  mcq: "Multiple Choice (MCQ)",
  short_answer: "Short Answer",
  long_answer: "Long Answer / Essay",
  true_false: "True / False",
  fill_blank: "Fill in the Blanks",
};

/**
 * Compute a sensible exam duration based on question types and counts.
 * MCQ: 1.5 min, short: 5 min, long: 15 min, true_false: 1 min, fill_blank: 3 min
 */
function estimateDuration(input: AssignmentInput): number {
  const perType: Record<string, number> = {
    mcq: 1.5,
    short_answer: 5,
    long_answer: 15,
    true_false: 1,
    fill_blank: 3,
  };
  const minutes = input.questionTypes.reduce(
    (sum, qt) => sum + qt.count * (perType[qt.type] ?? 3),
    0
  );
  // Round up to nearest 15 minutes, minimum 30
  return Math.max(30, Math.ceil(minutes / 15) * 15);
}

export function buildGenerationPrompt(input: AssignmentInput): string {
  const typeBreakdown = input.questionTypes
    .map(
      (qt, i) =>
        `  Section ${String.fromCharCode(65 + i)} — ${QUESTION_TYPE_LABELS[qt.type] ?? qt.type}: ` +
        `${qt.count} question${qt.count !== 1 ? "s" : ""}, ${qt.marksPerQuestion} mark${qt.marksPerQuestion !== 1 ? "s" : ""} each ` +
        `(subtotal: ${qt.count * qt.marksPerQuestion} marks)`
    )
    .join("\n");

  const estimatedDuration = estimateDuration(input);

  const sourceContext = input.sourceFileText
    ? `\n\nReference material from uploaded document (use this as the knowledge base for questions):\n"""\n${input.sourceFileText.slice(0, 8000)}\n"""`
    : "";

  const instructions = input.additionalInstructions
    ? `\nAdditional teacher instructions: ${input.additionalInstructions}`
    : "";

  // Build difficulty guidance: spread easy/medium/hard across each section
  const difficultyGuide = input.questionTypes
    .map((qt, i) => {
      const label = String.fromCharCode(65 + i);
      if (qt.count === 1) return `  Section ${label}: 1 question → difficulty: "medium"`;
      if (qt.count === 2) return `  Section ${label}: Q1 easy, Q2 hard`;
      const easy = Math.ceil(qt.count * 0.35);
      const hard = Math.floor(qt.count * 0.25);
      const medium = qt.count - easy - hard;
      return `  Section ${label}: ~${easy} easy, ~${medium} medium, ~${hard} hard`;
    })
    .join("\n");

  return `You are an expert academic assessment designer. Your task is to generate a complete, exam-ready question paper as a single valid JSON object.

ASSIGNMENT DETAILS
==================
Title: ${input.title}
${input.subject ? `Subject: ${input.subject}` : "Subject: General"}
Total Questions: ${input.totalQuestions}
Total Marks: ${input.totalMarks}
Suggested Duration: ${estimatedDuration} minutes

SECTION BREAKDOWN (one section per question type)
==================================================
${typeBreakdown}

DIFFICULTY DISTRIBUTION PER SECTION
=====================================
${difficultyGuide}
${instructions}${sourceContext}

OUTPUT FORMAT
=============
Return ONLY a valid JSON object — no markdown fences, no commentary, no trailing text.

{
  "title": "<paper title>",
  "subject": "<subject or null>",
  "totalMarks": <number>,
  "durationMinutes": <number>,
  "sections": [
    {
      "label": "A",
      "title": "Section A — Multiple Choice Questions",
      "instruction": "Choose the most appropriate option for each question. Each question carries 1 mark.",
      "questions": [
        {
          "text": "<full question text>",
          "difficulty": "easy",
          "marks": <number>,
          "type": "mcq",
          "options": ["<option 1>", "<option 2>", "<option 3>", "<option 4>"]
        }
      ]
    }
  ]
}

STRICT RULES
============
1. Create exactly one section per question type in the breakdown above, labelled A, B, C… in order.
2. Each section must contain EXACTLY the number of questions specified in the breakdown.
3. The sum of all question marks must equal ${input.totalMarks}.
4. MCQ questions MUST have exactly 4 options. All other types must have an empty options array [].
5. Difficulty values must be exactly "easy", "medium", or "hard" — no other values.
6. Question text must be complete, unambiguous, and exam-appropriate. No placeholders.
7. Do NOT include answer keys, explanations, or any text outside the JSON object.
8. Each section's "instruction" must be a complete sentence describing what students should do.`;
}
