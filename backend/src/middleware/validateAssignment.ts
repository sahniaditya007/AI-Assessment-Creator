import { z } from "zod";

const QuestionTypeConfigSchema = z.object({
  type: z.enum([
    "mcq",
    "short_answer",
    "long_answer",
    "true_false",
    "fill_blank",
  ]),
  count: z.number().int().positive("Count must be at least 1"),
  marksPerQuestion: z
    .number()
    .positive("Marks per question must be at least 1"),
});

export const CreateAssignmentSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  classLevel: z.enum([
    "1st",
    "2nd",
    "3rd",
    "4th",
    "5th",
    "6th",
    "7th",
    "8th",
    "9th",
    "10th",
    "11th",
    "12th",
  ]),
  subject: z.string().trim().min(1, "Subject is required"),
  dueDate: z.string().min(1, "Due date is required"),
  questionTypes: z
    .array(QuestionTypeConfigSchema)
    .min(1, "At least one question type is required"),
  totalQuestions: z.number().int().positive("Total questions must be positive"),
  totalMarks: z.number().positive("Total marks must be positive"),
  additionalInstructions: z.string().optional(),
});

export type CreateAssignmentBody = z.infer<typeof CreateAssignmentSchema>;
