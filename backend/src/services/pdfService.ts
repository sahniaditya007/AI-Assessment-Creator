import PDFDocument from "pdfkit";
import type { GeneratedPaper } from "../types/assessment.js";

// ── Constants ─────────────────────────────────────────────────────────────────

const MARGIN = 50;
const PAGE_WIDTH = 595.28; // A4 points
const PAGE_HEIGHT = 841.89; // A4 points
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const FOOTER_HEIGHT = 30;
const SAFE_BOTTOM = PAGE_HEIGHT - MARGIN - FOOTER_HEIGHT;

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: "Easy",
  medium: "Moderate",
  hard: "Hard",
};

const DIFFICULTY_COLOR: Record<string, string> = {
  easy: "#2e7d32",
  medium: "#e65100",
  hard: "#b71c1c",
};

// ── Main export ───────────────────────────────────────────────────────────────

export function generatePaperPdf(paper: GeneratedPaper): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      margin: MARGIN,
      size: "A4",
      bufferPages: true,
      info: {
        Title: paper.title,
        Subject: paper.subject ?? "Assessment",
        Creator: "VedaAI Assessment Creator",
      },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    renderPaper(doc, paper);

    // Add footer to every page after all content is written
    const range = doc.bufferedPageRange();
    for (let i = 0; i < range.count; i++) {
      doc.switchToPage(range.start + i);
      doc
        .fontSize(8)
        .font("Helvetica")
        .fillColor("#aaaaaa")
        .text(
          `VedaAI Assessment Creator  •  ${paper.title}  •  Page ${i + 1} of ${range.count}`,
          MARGIN,
          PAGE_HEIGHT - MARGIN + 10,
          { width: CONTENT_WIDTH, align: "center" }
        );
    }

    doc.flushPages();
    doc.end();
  });
}

// ── Paper layout ──────────────────────────────────────────────────────────────

function renderPaper(doc: InstanceType<typeof PDFDocument>, paper: GeneratedPaper): void {
  // Title
  doc
    .fontSize(20)
    .font("Helvetica-Bold")
    .fillColor("#1a1a1a")
    .text(paper.title, MARGIN, doc.y, { width: CONTENT_WIDTH, align: "center" });

  if (paper.subject) {
    doc.moveDown(0.3);
    doc
      .fontSize(13)
      .font("Helvetica")
      .fillColor("#444444")
      .text(`Subject: ${paper.subject}`, MARGIN, doc.y, { width: CONTENT_WIDTH, align: "center" });
  }

  doc.moveDown(0.5);
  hRule(doc, 1.5);
  doc.moveDown(0.6);

  // Time + Marks row — draw each independently, no continued
  const duration = paper.durationMinutes ?? 60;
  const rowY = doc.y;
  doc
    .fontSize(11)
    .font("Helvetica-Bold")
    .fillColor("#1a1a1a")
    .text(`Time Allowed: ${duration} minutes`, MARGIN, rowY, {
      width: CONTENT_WIDTH / 2,
      align: "left",
    });
  doc
    .fontSize(11)
    .font("Helvetica-Bold")
    .fillColor("#1a1a1a")
    .text(`Maximum Marks: ${paper.totalMarks}`, MARGIN + CONTENT_WIDTH / 2, rowY, {
      width: CONTENT_WIDTH / 2,
      align: "right",
    });

  // Advance cursor past the row
  doc.y = rowY + 20;
  doc.moveDown(0.6);

  doc
    .fontSize(10)
    .font("Helvetica-Oblique")
    .fillColor("#555555")
    .text(
      "General Instructions: All questions are compulsory unless stated otherwise.",
      MARGIN,
      doc.y,
      { width: CONTENT_WIDTH }
    );

  doc.moveDown(0.8);
  hRule(doc, 0.5);
  doc.moveDown(0.8);

  // Student info
  studentInfo(doc);

  doc.moveDown(0.8);
  hRule(doc, 0.5);

  // Sections
  for (const section of paper.sections) {
    doc.moveDown(1.2);
    renderSection(doc, section);
  }
}

// ── Student info ──────────────────────────────────────────────────────────────

function studentInfo(doc: InstanceType<typeof PDFDocument>): void {
  doc
    .fontSize(11)
    .font("Helvetica-Bold")
    .fillColor("#1a1a1a")
    .text("Student Information", MARGIN, doc.y, { width: CONTENT_WIDTH });

  doc.moveDown(0.6);

  const fields = [
    { label: "Name", lineLen: 220 },
    { label: "Roll Number", lineLen: 160 },
    { label: "Section", lineLen: 120 },
  ];

  for (const field of fields) {
    const y = doc.y;
    const labelText = `${field.label}:`;

    // Draw label
    doc
      .fontSize(11)
      .font("Helvetica")
      .fillColor("#1a1a1a")
      .text(labelText, MARGIN, y);

    const labelW = doc.widthOfString(labelText) + 6;

    // Draw underline for writing space
    doc
      .moveTo(MARGIN + labelW, y + 12)
      .lineTo(MARGIN + labelW + field.lineLen, y + 12)
      .strokeColor("#555555")
      .lineWidth(0.75)
      .stroke();

    doc.moveDown(0.7);
  }
}

// ── Section ───────────────────────────────────────────────────────────────────

function renderSection(
  doc: InstanceType<typeof PDFDocument>,
  section: {
    label: string;
    title: string;
    instruction: string;
    questions: Array<{
      id: string;
      number: number;
      text: string;
      difficulty: string;
      marks: number;
      type: string;
      options?: string[];
    }>;
  }
): void {
  // Section header box
  const boxY = doc.y;
  doc.rect(MARGIN, boxY, CONTENT_WIDTH, 24).fillColor("#eeeeee").fill();
  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .fillColor("#1a1a1a")
    .text(`Section ${section.label}`, MARGIN + 8, boxY + 6, {
      width: CONTENT_WIDTH - 16,
    });

  // Move cursor below the box
  doc.y = boxY + 28;
  doc.moveDown(0.3);

  // Section subtitle (strip "Section X — " prefix)
  const cleanTitle = section.title.replace(/^Section\s+[A-Z]\s*[—\-–]\s*/i, "").trim();
  if (cleanTitle) {
    doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .fillColor("#1a1a1a")
      .text(cleanTitle, MARGIN, doc.y, { width: CONTENT_WIDTH });
    doc.moveDown(0.25);
  }

  // Instruction
  doc
    .fontSize(10)
    .font("Helvetica-Oblique")
    .fillColor("#555555")
    .text(section.instruction, MARGIN, doc.y, { width: CONTENT_WIDTH });

  // Marks note
  if (section.questions.length > 0) {
    const m = section.questions[0].marks;
    if (section.questions.every((q) => q.marks === m)) {
      doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor("#555555")
        .text(
          `Each question carries ${m} mark${m !== 1 ? "s" : ""}.`,
          MARGIN,
          doc.y,
          { width: CONTENT_WIDTH }
        );
    }
  }

  doc.moveDown(0.6);

  for (const q of section.questions) {
    renderQuestion(doc, q);
  }
}

// ── Question ──────────────────────────────────────────────────────────────────

function renderQuestion(
  doc: InstanceType<typeof PDFDocument>,
  q: {
    number: number;
    text: string;
    difficulty: string;
    marks: number;
    type: string;
    options?: string[];
  }
): void {
  // Estimate height needed and add page break if necessary
  const estimatedHeight = estimateQuestionHeight(doc, q);
  if (doc.y + estimatedHeight > SAFE_BOTTOM) {
    doc.addPage();
  }

  const diffLabel = DIFFICULTY_LABEL[q.difficulty] ?? q.difficulty;
  const diffColor = DIFFICULTY_COLOR[q.difficulty] ?? "#555555";

  // ── Question number prefix ────────────────────────────────────────────────
  const numText = `Q${q.number}.`;
  const numW = doc.fontSize(11).font("Helvetica-Bold").widthOfString(numText) + 4;
  const textX = MARGIN + numW;
  const textW = CONTENT_WIDTH - numW - 40; // leave room for marks on right

  const startY = doc.y;

  // Draw question number
  doc
    .fontSize(11)
    .font("Helvetica-Bold")
    .fillColor("#1a1a1a")
    .text(numText, MARGIN, startY, { width: numW, lineBreak: false });

  // Draw question text
  doc
    .fontSize(11)
    .font("Helvetica")
    .fillColor("#1a1a1a")
    .text(q.text, textX, startY, { width: textW });

  const afterTextY = doc.y;

  // Draw marks to the right of the question number line
  const marksText = `[${q.marks}M]`;
  doc
    .fontSize(10)
    .font("Helvetica")
    .fillColor("#777777")
    .text(marksText, MARGIN + CONTENT_WIDTH - 35, startY, {
      width: 35,
      align: "right",
      lineBreak: false,
    });

  // Restore cursor to after question text
  doc.y = afterTextY;
  doc.moveDown(0.2);

  // ── Difficulty tag ────────────────────────────────────────────────────────
  doc
    .fontSize(9)
    .font("Helvetica-Oblique")
    .fillColor(diffColor)
    .text(`Difficulty: ${diffLabel}`, textX, doc.y, { width: textW });

  doc.moveDown(0.35);

  // ── MCQ options ───────────────────────────────────────────────────────────
  if (q.type === "mcq" && q.options && q.options.length > 0) {
    const opts = q.options.slice(0, 4);
    const letters = ["(a)", "(b)", "(c)", "(d)"];
    const colW = CONTENT_WIDTH / 2 - 10;
    const col1X = textX;
    const col2X = MARGIN + CONTENT_WIDTH / 2 + 10;

    // Render options in pairs: (a)+(b) on row 1, (c)+(d) on row 2
    for (let row = 0; row < 2; row++) {
      const i1 = row * 2;
      const i2 = row * 2 + 1;
      const rowY = doc.y;

      if (i1 < opts.length) {
        doc
          .fontSize(10)
          .font("Helvetica")
          .fillColor("#1a1a1a")
          .text(`${letters[i1]}  ${opts[i1]}`, col1X, rowY, {
            width: colW,
            lineBreak: false,
          });
      }

      if (i2 < opts.length) {
        doc
          .fontSize(10)
          .font("Helvetica")
          .fillColor("#1a1a1a")
          .text(`${letters[i2]}  ${opts[i2]}`, col2X, rowY, {
            width: colW,
            lineBreak: false,
          });
      }

      // Advance cursor by one line height
      doc.y = rowY + doc.currentLineHeight(true) + 4;
    }

    doc.moveDown(0.3);
  }

  // ── True/False bubbles ────────────────────────────────────────────────────
  if (q.type === "true_false") {
    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#555555")
      .text("○  True          ○  False", textX, doc.y, { width: textW });
    doc.moveDown(0.4);
  }

  // ── Answer lines ──────────────────────────────────────────────────────────
  if (q.type === "short_answer" || q.type === "fill_blank") {
    doc.moveDown(0.3);
    answerLine(doc);
  } else if (q.type === "long_answer") {
    doc.moveDown(0.3);
    for (let i = 0; i < 4; i++) answerLine(doc);
  }

  doc.moveDown(0.6);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function answerLine(doc: InstanceType<typeof PDFDocument>): void {
  const y = doc.y + 6;
  doc
    .moveTo(MARGIN + 20, y)
    .lineTo(MARGIN + CONTENT_WIDTH, y)
    .strokeColor("#cccccc")
    .lineWidth(0.5)
    .stroke();
  doc.y = y + 14;
}

function hRule(doc: InstanceType<typeof PDFDocument>, lw = 0.5): void {
  doc
    .moveTo(MARGIN, doc.y)
    .lineTo(MARGIN + CONTENT_WIDTH, doc.y)
    .strokeColor("#cccccc")
    .lineWidth(lw)
    .stroke();
}

/**
 * Rough height estimate for a question block so we can decide
 * whether to add a page break before rendering it.
 */
function estimateQuestionHeight(
  doc: InstanceType<typeof PDFDocument>,
  q: { type: string; text: string; options?: string[] }
): number {
  const lineH = doc.currentLineHeight(true);
  // question text (assume ~2 lines average)
  let h = lineH * 2.5;
  // difficulty tag
  h += lineH * 0.8;
  // MCQ options: 2 rows
  if (q.type === "mcq") h += lineH * 2.5;
  // answer lines
  if (q.type === "short_answer" || q.type === "fill_blank") h += 20;
  if (q.type === "long_answer") h += 80;
  if (q.type === "true_false") h += lineH;
  // spacing
  h += lineH * 0.6;
  return h;
}
