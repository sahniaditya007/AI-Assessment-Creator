import { create } from "zustand";
import type {
  Assignment,
  AssignmentFormState,
  AssignmentStatus,
  ClassLevel,
  GeneratedPaper,
  JobProgressEvent,
  QuestionType,
  QuestionTypeConfig,
} from "@/types/assessment";

type SubjectOption = {
  value: string;
  label: string;
};

export const CLASS_OPTIONS: { value: ClassLevel; label: string }[] = [
  { value: "1st", label: "Class 1" },
  { value: "2nd", label: "Class 2" },
  { value: "3rd", label: "Class 3" },
  { value: "4th", label: "Class 4" },
  { value: "5th", label: "Class 5" },
  { value: "6th", label: "Class 6" },
  { value: "7th", label: "Class 7" },
  { value: "8th", label: "Class 8" },
  { value: "9th", label: "Class 9" },
  { value: "10th", label: "Class 10" },
  { value: "11th", label: "Class 11" },
  { value: "12th", label: "Class 12" },
];

const SUBJECT_OPTIONS_BY_CLASS: Record<ClassLevel, SubjectOption[]> = {
  "1st": [
    { value: "English", label: "English" },
    { value: "Mathematics", label: "Mathematics" },
    { value: "Environmental Studies", label: "Environmental Studies" },
    { value: "Hindi", label: "Hindi" },
  ],
  "2nd": [
    { value: "English", label: "English" },
    { value: "Mathematics", label: "Mathematics" },
    { value: "Environmental Studies", label: "Environmental Studies" },
    { value: "Hindi", label: "Hindi" },
  ],
  "3rd": [
    { value: "English", label: "English" },
    { value: "Mathematics", label: "Mathematics" },
    { value: "Environmental Studies", label: "Environmental Studies" },
    { value: "Hindi", label: "Hindi" },
  ],
  "4th": [
    { value: "English", label: "English" },
    { value: "Mathematics", label: "Mathematics" },
    { value: "Science", label: "Science" },
    { value: "Hindi", label: "Hindi" },
    { value: "Social Studies", label: "Social Studies" },
  ],
  "5th": [
    { value: "English", label: "English" },
    { value: "Mathematics", label: "Mathematics" },
    { value: "Science", label: "Science" },
    { value: "Hindi", label: "Hindi" },
    { value: "Social Studies", label: "Social Studies" },
  ],
  "6th": [
    { value: "English", label: "English" },
    { value: "Mathematics", label: "Mathematics" },
    { value: "Science", label: "Science" },
    { value: "Social Science", label: "Social Science" },
    { value: "Hindi", label: "Hindi" },
    { value: "Computer Science", label: "Computer Science" },
  ],
  "7th": [
    { value: "English", label: "English" },
    { value: "Mathematics", label: "Mathematics" },
    { value: "Science", label: "Science" },
    { value: "Social Science", label: "Social Science" },
    { value: "Hindi", label: "Hindi" },
    { value: "Computer Science", label: "Computer Science" },
  ],
  "8th": [
    { value: "English", label: "English" },
    { value: "Mathematics", label: "Mathematics" },
    { value: "Science", label: "Science" },
    { value: "Social Science", label: "Social Science" },
    { value: "Hindi", label: "Hindi" },
    { value: "Computer Science", label: "Computer Science" },
  ],
  "9th": [
    { value: "English", label: "English" },
    { value: "Mathematics", label: "Mathematics" },
    { value: "Science", label: "Science" },
    { value: "Social Science", label: "Social Science" },
    { value: "Hindi", label: "Hindi" },
    { value: "Computer Applications", label: "Computer Applications" },
  ],
  "10th": [
    { value: "English", label: "English" },
    { value: "Mathematics", label: "Mathematics" },
    { value: "Science", label: "Science" },
    { value: "Social Science", label: "Social Science" },
    { value: "Hindi", label: "Hindi" },
    { value: "Computer Applications", label: "Computer Applications" },
  ],
  "11th": [
    { value: "English", label: "English" },
    { value: "Mathematics", label: "Mathematics" },
    { value: "Physics", label: "Physics" },
    { value: "Chemistry", label: "Chemistry" },
    { value: "Biology", label: "Biology" },
    { value: "Accountancy", label: "Accountancy" },
    { value: "Business Studies", label: "Business Studies" },
    { value: "Economics", label: "Economics" },
    { value: "Computer Science", label: "Computer Science" },
  ],
  "12th": [
    { value: "English", label: "English" },
    { value: "Mathematics", label: "Mathematics" },
    { value: "Physics", label: "Physics" },
    { value: "Chemistry", label: "Chemistry" },
    { value: "Biology", label: "Biology" },
    { value: "Accountancy", label: "Accountancy" },
    { value: "Business Studies", label: "Business Studies" },
    { value: "Economics", label: "Economics" },
    { value: "Computer Science", label: "Computer Science" },
  ],
};

export function getSubjectOptions(classLevel: ClassLevel): SubjectOption[] {
  return SUBJECT_OPTIONS_BY_CLASS[classLevel] ?? [];
}

export function getDefaultSubject(classLevel: ClassLevel): string {
  return getSubjectOptions(classLevel)[0]?.value ?? "";
}

const defaultQuestionType = (): QuestionTypeConfig => ({
  type: "mcq",
  count: 5,
  marksPerQuestion: 2,
});

const initialForm: AssignmentFormState = {
  title: "",
  classLevel: "5th",
  subject: getDefaultSubject("5th"),
  dueDate: "",
  questionTypes: [defaultQuestionType()],
  totalQuestions: 5,
  totalMarks: 10,
  additionalInstructions: "",
  sourceFile: null,
};

interface AssignmentStore {
  form: AssignmentFormState;
  formErrors: Record<string, string>;
  currentAssignment: Assignment | null;
  paper: GeneratedPaper | null;
  generationProgress: number;
  generationMessage: string;
  generationStatus: AssignmentStatus | "idle";
  wsConnected: boolean;

  setField: <K extends keyof AssignmentFormState>(
    key: K,
    value: AssignmentFormState[K]
  ) => void;
  addQuestionType: () => void;
  removeQuestionType: (index: number) => void;
  updateQuestionType: (
    index: number,
    patch: Partial<QuestionTypeConfig>
  ) => void;
  recalculateTotals: () => void;
  validateForm: () => boolean;
  setCurrentAssignment: (assignment: Assignment | null) => void;
  setPaper: (paper: GeneratedPaper | null) => void;
  handleProgress: (event: JobProgressEvent) => void;
  setWsConnected: (connected: boolean) => void;
  resetForm: () => void;
}

function sumCounts(types: QuestionTypeConfig[]): number {
  return types.reduce((s, t) => s + t.count, 0);
}

function sumMarks(types: QuestionTypeConfig[]): number {
  return types.reduce((s, t) => s + t.count * t.marksPerQuestion, 0);
}

export const useAssignmentStore = create<AssignmentStore>((set, get) => ({
  form: { ...initialForm },
  formErrors: {},
  currentAssignment: null,
  paper: null,
  generationProgress: 0,
  generationMessage: "",
  generationStatus: "idle",
  wsConnected: false,

  setField: (key, value) => {
    set((state) => ({
      form: { ...state.form, [key]: value },
      formErrors: { ...state.formErrors, [key]: "" },
    }));
    if (key === "questionTypes") {
      get().recalculateTotals();
    }
  },

  addQuestionType: () => {
    set((state) => {
      const questionTypes = [...state.form.questionTypes, defaultQuestionType()];
      return {
        form: {
          ...state.form,
          questionTypes,
          totalQuestions: sumCounts(questionTypes),
          totalMarks: sumMarks(questionTypes),
        },
      };
    });
  },

  removeQuestionType: (index) => {
    set((state) => {
      if (state.form.questionTypes.length <= 1) return state;
      const questionTypes = state.form.questionTypes.filter(
        (_, i) => i !== index
      );
      return {
        form: {
          ...state.form,
          questionTypes,
          totalQuestions: sumCounts(questionTypes),
          totalMarks: sumMarks(questionTypes),
        },
      };
    });
  },

  updateQuestionType: (index, patch) => {
    set((state) => {
      const questionTypes = state.form.questionTypes.map((qt, i) =>
        i === index ? { ...qt, ...patch } : qt
      );
      return {
        form: {
          ...state.form,
          questionTypes,
          totalQuestions: sumCounts(questionTypes),
          totalMarks: sumMarks(questionTypes),
        },
      };
    });
  },

  recalculateTotals: () => {
    const { questionTypes } = get().form;
    set((state) => ({
      form: {
        ...state.form,
        totalQuestions: sumCounts(questionTypes),
        totalMarks: sumMarks(questionTypes),
      },
    }));
  },

  validateForm: () => {
    const { form } = get();
    const errors: Record<string, string> = {};

    if (!form.title.trim()) errors.title = "Title is required";
    if (!form.classLevel) errors.classLevel = "Class is required";
    if (!form.subject.trim()) errors.subject = "Subject is required";
    if (!form.dueDate) errors.dueDate = "Due date is required";
    else {
      // Compare date strings directly (YYYY-MM-DD) to avoid timezone issues
      const today = new Date().toISOString().split("T")[0];
      if (form.dueDate < today) {
        errors.dueDate = "Due date cannot be in the past";
      }
    }

    if (
      form.subject &&
      !getSubjectOptions(form.classLevel).some(
        (option) => option.value === form.subject
      )
    ) {
      errors.subject = "Choose a subject that matches the selected class";
    }

    if (form.totalQuestions <= 0) {
      errors.totalQuestions = "Must have at least 1 question";
    }
    if (form.totalMarks <= 0) {
      errors.totalMarks = "Total marks must be positive";
    }

    form.questionTypes.forEach((qt, i) => {
      if (qt.count <= 0) errors[`type_${i}_count`] = "Count must be positive";
      if (qt.marksPerQuestion <= 0) {
        errors[`type_${i}_marks`] = "Marks must be positive";
      }
    });

    const countSum = sumCounts(form.questionTypes);
    const marksSum = sumMarks(form.questionTypes);
    if (countSum !== form.totalQuestions) {
      errors.totalQuestions = `Question counts must sum to ${countSum}`;
    }
    if (marksSum !== form.totalMarks) {
      errors.totalMarks = `Marks must sum to ${marksSum}`;
    }

    set({ formErrors: errors });
    return Object.keys(errors).length === 0;
  },

  setCurrentAssignment: (assignment) => set({ currentAssignment: assignment }),
  setPaper: (paper) => set({ paper }),
  handleProgress: (event) => {
    set({
      generationProgress: event.progress,
      generationMessage: event.message,
      generationStatus: event.status,
      paper: event.paper ?? get().paper,
      currentAssignment: get().currentAssignment
        ? {
            ...get().currentAssignment!,
            status: event.status,
            progress: event.progress,
            statusMessage: event.message,
            paper: event.paper,
            error: event.error,
          }
        : null,
    });
  },
  setWsConnected: (connected) => set({ wsConnected: connected }),
  resetForm: () =>
    set({
      form: { ...initialForm, questionTypes: [defaultQuestionType()] },
      formErrors: {},
    }),
}));

export const QUESTION_TYPE_OPTIONS: { value: QuestionType; label: string }[] =
  [
    { value: "mcq", label: "Multiple Choice Questions" },
    { value: "short_answer", label: "Short Questions" },
    { value: "long_answer", label: "Long Answer Questions" },
    { value: "true_false", label: "True / False Questions" },
    { value: "fill_blank", label: "Numerical Problems" },
  ];
