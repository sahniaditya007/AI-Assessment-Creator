import Link from "next/link";
import { EmptyStateIllustration } from "@/components/illustrations/EmptyStateIllustration";

export function EmptyState() {
  return (
    <div className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center gap-8 px-4">
      <div className="flex max-w-[486px] flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3">
          <EmptyStateIllustration />
          <div className="flex flex-col items-center gap-0.5 text-center">
            <h2 className="text-p-1 font-bold text-primary">No assignments yet</h2>
            <p className="text-p-3 text-secondary">
              Create your first assignment to start collecting and grading student
              submissions. You can set up rubrics, define marking criteria, and let
              AI assist with grading.
            </p>
          </div>
        </div>
        <Link href="/create" className="btn-dark gap-1">
          <PlusIcon />
          Create Your First Assignment
        </Link>
      </div>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="white">
      <path d="M10 4V16M4 10H16" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
