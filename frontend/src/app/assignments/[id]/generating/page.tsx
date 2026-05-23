"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { useGenerationSocket } from "@/hooks/useGenerationSocket";
import { useAssignmentStore } from "@/store/assignmentStore";
import { getAssignment } from "@/lib/api";
import clsx from "clsx";

export default function GeneratingPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const {
    generationProgress,
    generationMessage,
    generationStatus,
    wsConnected,
    setCurrentAssignment,
    handleProgress,
  } = useAssignmentStore();

  useGenerationSocket(id);

  useEffect(() => {
    getAssignment(id)
      .then((assignment) => {
        setCurrentAssignment(assignment);
        if (assignment.status === "completed" && assignment.paper) {
          handleProgress({
            assignmentId: id,
            status: "completed",
            progress: 100,
            message: assignment.statusMessage,
            paper: assignment.paper,
          });
          router.push(`/assignments/${id}/paper`);
        }
      })
      .catch(() => {});
  }, [id, setCurrentAssignment, handleProgress, router]);

  return (
    <AppShell showBack breadcrumb="Generating">
      <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center">
        <div className="relative mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-bg-off-white">
          <span className="text-3xl">✨</span>
          <span className="absolute inset-0 animate-ping rounded-full bg-success/20" />
        </div>

        <h1 className="text-p-1 font-bold text-primary">
          Generating your question paper
        </h1>
        <p className="mt-2 text-p-3 text-secondary">
          {generationMessage || "Queued for processing..."}
        </p>

        <div className="mt-8 w-full">
          <div className="h-2 overflow-hidden rounded-full bg-border-muted">
            <div
              className="h-full rounded-full bg-btn-primary transition-all duration-500"
              style={{ width: `${Math.max(generationProgress, 5)}%` }}
            />
          </div>
          <p className="mt-2 text-p-4 font-medium text-primary">
            {generationProgress}%
          </p>
        </div>

        <p
          className={clsx(
            "mt-6 text-p-4",
            wsConnected ? "text-success" : "text-accent"
          )}
        >
          WebSocket: {wsConnected ? "Connected" : "Connecting..."}
        </p>

        {generationStatus === "failed" && (
          <button
            className="btn-dark mt-6"
            onClick={() => router.push("/create")}
          >
            Back to form
          </button>
        )}
      </div>
    </AppShell>
  );
}
