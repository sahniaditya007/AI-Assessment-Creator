import type { Assignment, GeneratedPaper } from "@/types/assessment";
import type { AssignmentFormState } from "@/types/assessment";

function getApiUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL;
  if (configured) {
    return configured.replace(/\/+$/, "");
  }

  if (typeof window !== "undefined") {
    const isLocalHost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    if (isLocalHost) {
      return "http://localhost:4000";
    }
  }

  throw new Error(
    "NEXT_PUBLIC_API_URL is not set. Configure it in Vercel to point to your Railway backend."
  );
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const apiUrl = getApiUrl();
  const requestUrl = `${apiUrl}${path}`;
  const res = await fetch(requestUrl, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message =
      typeof body.error === "string"
        ? body.error
        : body.error?.formErrors?.[0] ?? `Request failed (${res.status})`;
    throw new Error(`${message} [${requestUrl}]`);
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
  return `${getApiUrl()}/api/assignments/${id}/pdf`;
}

export async function queuePdfGeneration(id: string): Promise<void> {
  await request(`/api/assignments/${id}/pdf`, { method: "POST" });
}
