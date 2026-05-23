"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { ExamPaper } from "@/components/paper/ExamPaper";
import { PaperActionBar } from "@/components/paper/PaperActionBar";
import { useGenerationSocket } from "@/hooks/useGenerationSocket";
import { useAssignmentStore } from "@/store/assignmentStore";
import { getAssignment, getPaper } from "@/lib/api";

export default function PaperPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { paper, setPaper, generationStatus } = useAssignmentStore();

  useGenerationSocket(id);

  useEffect(() => {
    async function load() {
      try {
        const assignment = await getAssignment(id);
        if (assignment.paper) {
          setPaper(assignment.paper);
          setLoading(false);
          return;
        }
        if (
          assignment.status === "generating" ||
          assignment.status === "queued"
        ) {
          router.replace(`/assignments/${id}/generating`);
          return;
        }
        const result = await getPaper(id);
        setPaper(result.paper);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load paper");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, router, setPaper]);

  const handleRegenerate = () => {
    router.push(`/assignments/${id}/generating`);
  };

  if (loading) {
    return (
      <AppShell showBack breadcrumb="Assignment Output">
        <div className="flex min-h-[50vh] items-center justify-center">
          <p className="text-secondary">Loading question paper...</p>
        </div>
      </AppShell>
    );
  }

  if (error || !paper) {
    return (
      <AppShell showBack breadcrumb="Assignment Output">
        <div className="mx-auto max-w-lg py-20 text-center">
          <p className="text-red-600">{error || "Paper not found"}</p>
          <Link href="/create" className="btn-dark mt-6 inline-flex">
            Create new assignment
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell showBack breadcrumb="Assignment Output">
      <div className="mx-auto max-w-content">
        <div className="flex flex-col gap-4 rounded-4xl bg-bg-dark p-3 md:gap-6 md:p-5">
          {/* Dark header banner */}
          <div className="flex flex-col items-center gap-4 rounded-4xl bg-[rgba(24,24,24,0.8)] px-4 py-5 text-center md:gap-6 md:px-8 md:py-6">
            <p className="text-p-3 font-bold leading-[140%] tracking-[-0.04em] text-white md:text-p-1">
              {paper.title}
              {paper.subject ? ` — ${paper.subject}` : ""}
            </p>
            <PaperActionBar
              assignmentId={id}
              onRegenerate={handleRegenerate}
            />
          </div>

          {(generationStatus === "generating" ||
            generationStatus === "queued") && (
            <div className="rounded-2xl bg-white/10 px-4 py-3 text-center text-p-4 text-white">
              Regeneration in progress — page will update when ready.
            </div>
          )}

          <ExamPaper paper={paper} />
        </div>
      </div>
    </AppShell>
  );
}
