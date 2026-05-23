"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface TopBarProps {
  showBack?: boolean;
  breadcrumb?: string;
}

export function TopBar({ showBack, breadcrumb }: TopBarProps) {
  const router = useRouter();

  return (
    <header className="flex h-14 items-center gap-3 rounded-2xl bg-white/75 px-3 md:px-6">
      {showBack ? (
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white"
          aria-label="Go back"
        >
          <ArrowLeft />
        </button>
      ) : (
        /* Logo — only visible on mobile where sidebar is hidden */
        <Link href="/" className="flex items-center gap-2 lg:hidden">
          <div className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-primary">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
              <path d="M3 6L10 3L17 6V14L10 17L3 14V6Z" fill="white" />
            </svg>
          </div>
          <span className="text-[20px] font-bold leading-5 tracking-[-0.06em] text-primary">
            VedaAI
          </span>
        </Link>
      )}

      <div className="flex flex-1 items-center gap-2 text-base">
        {breadcrumb && (
          <>
            <SparkMuted />
            <span className="font-semibold text-disabled">{breadcrumb}</span>
          </>
        )}
      </div>

      <button
        type="button"
        className="relative flex h-9 w-9 items-center justify-center rounded-full bg-bg-off-white"
        aria-label="Notifications"
      >
        <BellIcon />
        <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-accent" />
      </button>

      <div className="flex items-center gap-2 rounded-xl px-2 py-1.5 md:px-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-off-white text-sm font-semibold">
          JD
        </div>
        <span className="hidden text-base font-semibold text-primary sm:inline">
          John Doe
        </span>
        <ChevronDown />
      </div>
    </header>
  );
}

function ArrowLeft() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M15 6L9 12L15 18"
        stroke="#303030"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SparkMuted() {
  return (
    <svg width="18" height="17" viewBox="0 0 18 17" fill="#A9A9A9">
      <path d="M9 0L10.5 6.5L17 8L10.5 9.5L9 16L7.5 9.5L1 8L7.5 6.5L9 0Z" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#303030" strokeWidth="2">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#303030" strokeWidth="1.5">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
