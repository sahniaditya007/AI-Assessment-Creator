"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  QUESTION_TYPE_OPTIONS,
  useAssignmentStore,
} from "@/store/assignmentStore";
import { createAssignment, triggerGeneration } from "@/lib/api";
import { CounterInput } from "@/components/ui/CounterInput";
import clsx from "clsx";

export function AssignmentForm() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const {
    form,
    formErrors,
    setField,
    addQuestionType,
    removeQuestionType,
    updateQuestionType,
    validateForm,
    setCurrentAssignment,
  } = useAssignmentStore();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const assignment = await createAssignment(form);
      setCurrentAssignment(assignment);
      await triggerGeneration(assignment._id);
      router.push(`/assignments/${assignment._id}/generating`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFile = (file: File | null) => {
    setField("sourceFile", file);
  };

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-form">
      {/* Step progress */}
      <div className="mb-8 flex gap-3">
        <div className="h-[5px] flex-1 rounded-full bg-bg-dark" />
        <div className="h-[5px] flex-1 rounded-full bg-border-muted" />
      </div>

      <div className="form-panel flex flex-col gap-8">
        <div>
          <h2 className="section-heading">Assignment Details</h2>
          <p className="section-sub">Basic information about your assignment</p>
        </div>

        <div className="flex flex-col gap-4">
          {/* Title */}
          <div className="flex flex-col gap-2">
            <label className="text-p-3 font-bold text-primary">
              Assignment Title
            </label>
            <input
              className="pill-input bg-white"
              placeholder="e.g. Mid-Term Science Assessment"
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
            />
            {formErrors.title && (
              <span className="text-p-4 text-red-600">{formErrors.title}</span>
            )}
          </div>

          {/* Upload zone */}
          <div
            className={clsx(
              "upload-zone cursor-pointer transition",
              dragOver && "border-primary bg-bg-off-white/50"
            )}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              handleFile(e.dataTransfer.files[0] ?? null);
            }}
            onClick={() => fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              accept=".pdf,.txt,.md,text/plain,application/pdf"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            />
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
              <UploadCloudIcon />
            </div>
            <div className="text-center">
              <p className="text-p-3 font-medium text-primary">
                {form.sourceFile
                  ? form.sourceFile.name
                  : "Choose a file or drag & drop it here"}
              </p>
              <p className="text-p-4 text-disabled">PDF or text, up to 5MB</p>
            </div>
            <button
              type="button"
              className="btn-grey-pill"
              onClick={(e) => {
                e.stopPropagation();
                fileRef.current?.click();
              }}
            >
              Browse File
            </button>
          </div>

          <p className="text-p-3 font-medium text-text-faded">
            Upload reference document for AI (optional)
          </p>

          {/* Due date */}
          <div className="flex flex-col gap-2">
            <label className="text-p-3 font-bold text-primary" htmlFor="due-date">Due Date</label>
            <div
              className="pill-input bg-transparent cursor-pointer"
              onClick={() => document.getElementById("due-date")?.showPicker?.()}
            >
              <input
                id="due-date"
                type="date"
                className="flex-1 bg-transparent text-p-3 font-medium text-primary outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                value={form.dueDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setField("dueDate", e.target.value)}
              />
              <CalendarIcon />
            </div>
            {formErrors.dueDate && (
              <span className="text-p-4 text-red-600">{formErrors.dueDate}</span>
            )}
          </div>

          {/* Question types */}
          <div className="flex flex-col gap-4 lg:flex-row lg:gap-16">
            <div className="flex flex-1 flex-col gap-4">
              <label className="text-p-3 font-bold text-primary">
                Question Type
              </label>

              {form.questionTypes.map((qt, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="pill-input-white flex flex-1 justify-between">
                    <select
                      className="flex-1 appearance-none bg-transparent text-p-3 font-medium outline-none"
                      value={qt.type}
                      onChange={(e) =>
                        updateQuestionType(index, {
                          type: e.target.value as typeof qt.type,
                        })
                      }
                    >
                      {QUESTION_TYPE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown />
                  </div>
                  {form.questionTypes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestionType(index)}
                      className="flex h-4 w-4 shrink-0 items-center justify-center text-primary"
                      aria-label="Remove question type"
                    >
                      <CloseIcon />
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={addQuestionType}
                className="flex items-center gap-2"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-btn-dark-grey text-white">
                  <PlusSmall />
                </span>
                <span className="text-p-4 font-bold text-primary">
                  Add Question Type
                </span>
              </button>
            </div>

            <div className="flex gap-4 lg:gap-4">
              <div className="flex flex-col items-center gap-4">
                <span className="text-p-3 font-medium text-primary">
                  No. of Questions
                </span>
                {form.questionTypes.map((qt, index) => (
                  <CounterInput
                    key={index}
                    value={qt.count}
                    onChange={(count) => updateQuestionType(index, { count })}
                  />
                ))}
              </div>
              <div className="flex flex-col items-center gap-4">
                <span className="text-p-3 font-medium text-primary">Marks</span>
                {form.questionTypes.map((qt, index) => (
                  <CounterInput
                    key={index}
                    value={qt.marksPerQuestion}
                    onChange={(marksPerQuestion) =>
                      updateQuestionType(index, { marksPerQuestion })
                    }
                  />
                ))}
              </div>
              <div className="flex flex-col justify-end gap-1 pb-1 text-right">
                <p className="text-p-3 font-medium text-primary">
                  Total Questions : {form.totalQuestions}
                </p>
                <p className="text-p-3 font-medium text-primary">
                  Total Marks : {form.totalMarks}
                </p>
                {(formErrors.totalQuestions || formErrors.totalMarks) && (
                  <p className="text-p-4 text-red-600">
                    {formErrors.totalQuestions || formErrors.totalMarks}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Additional instructions */}
          <div className="flex flex-col gap-2">
            <label className="text-p-3 font-bold text-primary">
              Additional Information (For better output)
            </label>
            <div className="instructions-box">
              <textarea
                className="min-h-[50px] w-full resize-none bg-transparent text-p-4 font-medium text-text-faded outline-none placeholder:text-text-faded"
                placeholder="e.g Generate a question paper for 3 hour exam duration..."
                value={form.additionalInstructions}
                onChange={(e) =>
                  setField("additionalInstructions", e.target.value)
                }
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-bg-off-white-20"
                  aria-label="Voice input"
                >
                  <MicIcon />
                </button>
              </div>
            </div>
          </div>
        </div>

        {submitError && (
          <p className="rounded-2xl bg-red-50 px-4 py-3 text-p-4 text-red-700">
            {submitError}
          </p>
        )}

        <div className="flex items-center justify-between pt-2">
          <Link href="/" className="btn-white gap-1">
            <ArrowLeftSmall />
            Previous
          </Link>
          <button type="submit" className="btn-dark" disabled={submitting}>
            {submitting ? "Generating..." : "Continue"}
            {!submitting && <ArrowRightSmall />}
          </button>
        </div>
      </div>
    </form>
  );
}

function UploadCloudIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1E1E1E" strokeWidth="2.5">
      <path d="M12 16V8M8 12l4-4 4 4" />
      <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2B2B2B" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#303030" strokeWidth="1.5">
      <path d="M4 6l4 4 4-4" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" stroke="#303030" strokeWidth="1.5">
      <path d="M4 4l8 8M12 4l-8 8" />
    </svg>
  );
}

function PlusSmall() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" stroke="white" strokeWidth="2">
      <path d="M10 5v10M5 10h10" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="#303030">
      <rect x="6" y="2" width="4" height="8" rx="2" />
      <path d="M3 8a5 5 0 0010 0M8 13v2" stroke="#303030" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

function ArrowLeftSmall() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#303030" strokeWidth="2">
      <path d="M12 5l-5 5 5 5" />
    </svg>
  );
}

function ArrowRightSmall() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="2">
      <path d="M8 5l5 5-5 5" />
    </svg>
  );
}
