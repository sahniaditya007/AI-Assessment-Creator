"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const navItems = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/create", label: "Assignments", icon: FileIcon, badge: "32" },
  { href: "/create", label: "AI Teacher's Toolkit", icon: BookIcon },
  { href: "#", label: "My Library", icon: LibraryIcon },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-[304px] shrink-0 flex-col justify-between rounded-2xl bg-white p-6 shadow-realistic lg:flex">
      <div className="flex flex-col gap-14">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-primary">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 6L10 3L17 6V14L10 17L3 14V6Z" fill="white" />
            </svg>
          </div>
          <span className="text-[28px] font-bold leading-5 tracking-[-0.06em] text-primary">
            VedaAI
          </span>
        </Link>

        <Link
          href="/create"
          className="flex items-center justify-center gap-2 rounded-pill bg-[#272727] px-10 py-2 text-base font-medium text-white shadow-[inset_0px_-1px_3.5px_rgba(177,177,177,0.6),inset_0px_0px_34.5px_rgba(255,255,255,0.25)]"
        >
          <SparkIcon />
          AI Teacher&apos;s Toolkit
        </Link>

        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href) && item.href !== "/";
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={clsx(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-p-3 transition",
                  active
                    ? "bg-bg-off-white-20 font-medium text-primary"
                    : "text-secondary hover:bg-bg-off-white-20/60"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="rounded-pill bg-accent px-2.5 py-0.5 text-p-4 font-semibold text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col gap-2">
        <Link
          href="#"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-p-3 text-secondary"
        >
          <SettingsIcon className="h-5 w-5" />
          Settings
        </Link>
        <div className="flex items-center gap-2 rounded-2xl bg-bg-off-white-20 p-3">
          <div className="flex h-[60px] w-[59px] items-center justify-center rounded-lg bg-border-muted text-2xl">
            🏫
          </div>
          <div>
            <p className="text-p-3 font-bold text-primary">Delhi Public School</p>
            <p className="text-p-4 text-bg-dark">Bokaro Steel City</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="6" height="6" rx="1" />
      <rect x="11" y="3" width="6" height="6" rx="1" />
      <rect x="3" y="11" width="6" height="6" rx="1" />
      <rect x="11" y="11" width="6" height="6" rx="1" />
    </svg>
  );
}

function FileIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 2h8l4 4v12H6V2z" />
      <path d="M14 2v4h4" />
    </svg>
  );
}

function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 3h12v14H4z" />
      <path d="M4 7h12" />
    </svg>
  );
}

function LibraryIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="10" cy="10" r="7" />
      <path d="M10 6v8M6 10h8" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="10" cy="10" r="3" />
      <path d="M10 2v2M10 16v2M2 10h2M16 10h2" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg width="18" height="17" viewBox="0 0 18 17" fill="white">
      <path d="M9 0L10.5 6.5L17 8L10.5 9.5L9 16L7.5 9.5L1 8L7.5 6.5L9 0Z" />
    </svg>
  );
}
