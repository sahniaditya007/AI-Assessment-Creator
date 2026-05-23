import mongoose, { Schema, Document } from "mongoose";
import type {
  AssignmentStatus,
  GeneratedPaper,
  QuestionTypeConfig,
} from "../types/assessment.js";

export interface IAssignment extends Document {
  title: string;
  subject?: string;
  dueDate: Date;
  questionTypes: QuestionTypeConfig[];
  totalQuestions: number;
  totalMarks: number;
  additionalInstructions?: string;
  sourceFileName?: string;
  sourceFileText?: string;
  status: AssignmentStatus;
  progress: number;
  statusMessage: string;
  paper?: GeneratedPaper;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionTypeConfigSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["mcq", "short_answer", "long_answer", "true_false", "fill_blank"],
      required: true,
    },
    count: { type: Number, required: true, min: 1 },
    marksPerQuestion: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const AssignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true, trim: true },
    subject: { type: String, trim: true },
    dueDate: { type: Date, required: true },
    questionTypes: { type: [QuestionTypeConfigSchema], required: true },
    totalQuestions: { type: Number, required: true, min: 1 },
    totalMarks: { type: Number, required: true, min: 1 },
    additionalInstructions: { type: String },
    sourceFileName: { type: String },
    sourceFileText: { type: String },
    status: {
      type: String,
      enum: ["draft", "queued", "generating", "completed", "failed"],
      default: "draft",
    },
    progress: { type: Number, default: 0 },
    statusMessage: { type: String, default: "" },
    paper: { type: Schema.Types.Mixed },
    error: { type: String },
  },
  { timestamps: true }
);

export const Assignment = mongoose.model<IAssignment>(
  "Assignment",
  AssignmentSchema
);
