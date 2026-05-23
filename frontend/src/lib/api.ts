import type { Assignment, GeneratedPaper } from "@/types/assessment";
import type { AssignmentFormState } from "@/types/assessment";

function getDefaultApiUrl(): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/_/backend`;
  }
  return "http://localhost:4000";
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? getDefaultApiUrl();

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message =
      typeof body.error === "string"
        ? body.error
        : body.error?.formErrors?.[0] ?? `Request failed (${res.status})`;
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export async function createAssignment(
  form: AssignmentFormState
): Promise<Assignment> {
  const data = new FormData();
  data.append("title", form.title);
  if (form.subject) data.append("subject", form.subject);
  data.append("dueDate", form.dueDate);
  data.append("questionTypes", JSON.stringify(form.questionTypes));
  data.append("totalQuestions", String(form.totalQuestions));
  data.append("totalMarks", String(form.totalMarks));
  if (form.additionalInstructions) {
    data.append("additionalInstructions", form.additionalInstructions);
  }
  if (form.sourceFile) {
    data.append("sourceFile", form.sourceFile);
  }

  return request<Assignment>("/api/assignments", {
    method: "POST",
    body: data,
  });
}

export async function triggerGeneration(
  assignmentId: string
): Promise<{ message: string }> {
  return request(`/api/assignments/${assignmentId}/generate`, {
    method: "POST",
  });
}

export async function triggerRegeneration(
  assignmentId: string
): Promise<{ message: string }> {
  return request(`/api/assignments/${assignmentId}/regenerate`, {
    method: "POST",
  });
}

export async function getAssignment(id: string): Promise<Assignment> {
  return request(`/api/assignments/${id}`);
}

export async function getPaper(
  id: string
): Promise<{ assignmentId: string; paper: GeneratedPaper }> {
  return request(`/api/assignments/${id}/paper`);
}

export function getPdfDownloadUrl(id: string): string {
  return `${API_URL}/api/assignments/${id}/pdf`;
}

export async function queuePdfGeneration(id: string): Promise<void> {
  await request(`/api/assignments/${id}/pdf`, { method: "POST" });
}
