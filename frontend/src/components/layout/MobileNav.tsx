"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const navItems = [
  {
    href: "/",
    label: "Home",
    icon: HomeIcon,
    activeIcon: HomeIconFilled,
    exact: true,
  },
  {
    href: "/create",
    label: "Assignments",
    icon: CalendarIcon,
    activeIcon: CalendarIconFilled,
    exact: false,
  },
  {
    href: "/create",
    label: "Library",
    icon: LibraryIcon,
    activeIcon: LibraryIconFilled,
    exact: false,
  },
  {
    href: "/create",
    label: "AI Toolkit",
    icon: SparkIcon,
    activeIcon: SparkIconFilled,
    exact: false,
  },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
      aria-label="Mobile navigation"
    >
      {/* Blur backdrop */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-md" />

      <div className="relative mx-auto max-w-[393px] px-3 pb-safe pt-2">
        {/* Dark pill nav bar — matches Figma */}
        <div className="flex items-center justify-between rounded-3xl bg-btn-primary px-6 py-3 shadow-realistic">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href) && item.href !== "/";
            const Icon = isActive ? item.activeIcon : item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex flex-col items-center gap-1"
                aria-label={item.label}
              >
                <span
                  className={clsx(
                    "flex h-[52px] w-[52px] items-center justify-center rounded-full transition-colors",
                    isActive ? "bg-white/15" : "bg-transparent"
                  )}
                >
                  <Icon />
                </span>
                <span
                  className={clsx(
                    "text-[12px] font-semibold leading-[140%] tracking-[-0.04em]",
                    isActive ? "text-white" : "text-white/25"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Home indicator line */}
        <div className="mt-2 flex justify-center">
          <div className="h-[5px] w-32 rounded-full bg-primary/50" />
        </div>
      </div>
    </nav>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="2" width="7" height="7" rx="1.5" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
      <rect x="11" y="2" width="7" height="7" rx="1.5" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
      <rect x="2" y="11" width="7" height="7" rx="1.5" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
      <rect x="11" y="11" width="7" height="7" rx="1.5" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
    </svg>
  );
}

function HomeIconFilled() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="2" width="7" height="7" rx="1.5" fill="white" fillOpacity="0.25" />
      <rect x="11" y="2" width="7" height="7" rx="1.5" fill="white" fillOpacity="0.25" />
      <rect x="2" y="11" width="7" height="7" rx="1.5" fill="white" fillOpacity="0.25" />
      <rect x="11" y="11" width="7" height="7" rx="1.5" fill="white" fillOpacity="0.25" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="4" width="16" height="14" rx="2" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
      <path d="M14 2v4M6 2v4M2 9h16" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CalendarIconFilled() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="4" width="16" height="14" rx="2" fill="white" />
      <path d="M14 2v4M6 2v4M2 9h16" stroke="#181818" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function LibraryIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M4 3h3v14H4zM9 3h3v14H9zM14 3l3 1v12l-3 1V3z" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function LibraryIconFilled() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M4 3h3v14H4zM9 3h3v14H9zM14 3l3 1v12l-3 1V3z" fill="rgba(255,255,255,0.25)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="rgba(255,255,255,0.25)">
      <path d="M10 1L11.8 7.8L18 10L11.8 12.2L10 19L8.2 12.2L2 10L8.2 7.8L10 1Z" />
    </svg>
  );
}

function SparkIconFilled() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="white">
      <path d="M10 1L11.8 7.8L18 10L11.8 12.2L10 19L8.2 12.2L2 10L8.2 7.8L10 1Z" />
    </svg>
  );
}
