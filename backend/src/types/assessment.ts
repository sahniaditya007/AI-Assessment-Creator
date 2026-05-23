export type Difficulty = "easy" | "medium" | "hard";
export type QuestionType =
  | "mcq"
  | "short_answer"
  | "long_answer"
  | "true_false"
  | "fill_blank";

export type AssignmentStatus =
  | "draft"
  | "queued"
  | "generating"
  | "completed"
  | "failed";

export interface QuestionTypeConfig {
  type: QuestionType;
  count: number;
  marksPerQuestion: number;
}

export interface AssignmentInput {
  title: string;
  classLevel: string;
  subject?: string;
  dueDate: string;
  questionTypes: QuestionTypeConfig[];
  totalQuestions: number;
  totalMarks: number;
  additionalInstructions?: string;
  sourceFileText?: string;
}

export interface GeneratedQuestion {
  id: string;
  number: number;
  text: string;
  difficulty: Difficulty;
  marks: number;
  type: QuestionType;
  options?: string[];
}

export interface GeneratedSection {
  id: string;
  label: string;
  title: string;
  instruction: string;
  questions: GeneratedQuestion[];
}

export interface GeneratedPaper {
  title: string;
  subject?: string;
  totalMarks: number;
  durationMinutes?: number;
  sections: GeneratedSection[];
  generatedAt: string;
}

export interface JobProgressEvent {
  assignmentId: string;
  status: AssignmentStatus;
  progress: number;
  message: string;
  paper?: GeneratedPaper;
  error?: string;
}
