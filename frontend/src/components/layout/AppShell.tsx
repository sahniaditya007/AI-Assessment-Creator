import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { MobileNav } from "./MobileNav";

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  breadcrumb?: string;
}

export function AppShell({
  children,
  title,
  subtitle,
  showBack,
  breadcrumb,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-canvas p-3">
      <div className="mx-auto flex min-h-[calc(100vh-24px)] max-w-[1440px] gap-3">
        {/* Desktop sidebar — hidden on mobile */}
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <TopBar showBack={showBack} breadcrumb={breadcrumb} />

          <main className="flex-1 overflow-auto pb-24 lg:pb-0">
            {(title || subtitle) && (
              <div className="mb-6 flex items-center gap-3 px-2 md:px-0">
                <span className="relative flex h-3 w-3 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/40 opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full border-4 border-success/40 bg-success" />
                </span>
                <div>
                  {title && (
                    <h1 className="text-p-1 font-bold text-primary">{title}</h1>
                  )}
                  {subtitle && (
                    <p className="text-p-4 text-secondary-muted">{subtitle}</p>
                  )}
                </div>
              </div>
            )}
            {children}
          </main>
        </div>
      </div>

      {/* Mobile bottom nav — hidden on desktop */}
      <MobileNav />
    </div>
  );
}
