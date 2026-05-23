"use client";

import { useState } from "react";
import { getPdfDownloadUrl, triggerRegeneration } from "@/lib/api";

interface PaperActionBarProps {
  assignmentId: string;
  onRegenerate?: () => void;
}

export function PaperActionBar({
  assignmentId,
  onRegenerate,
}: PaperActionBarProps) {
  const [loading, setLoading] = useState(false);

  const handleRegenerate = async () => {
    setLoading(true);
    try {
      await triggerRegeneration(assignmentId);
      onRegenerate?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <button
        type="button"
        onClick={handleRegenerate}
        disabled={loading}
        className="btn-white text-p-3"
      >
        {loading ? "Regenerating..." : "Regenerate Paper"}
      </button>
      <a
        href={getPdfDownloadUrl(assignmentId)}
        className="inline-flex items-center gap-2 rounded-pill bg-white px-6 py-2.5 text-p-3 font-medium text-primary shadow-sm"
        download
      >
        <DownloadIcon />
        Download as PDF
      </a>
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#303030">
      <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 19h16" stroke="#303030" strokeWidth="2" fill="none" />
    </svg>
  );
}
