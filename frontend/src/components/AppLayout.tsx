import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

type AppLayoutProps = {
  children: ReactNode;
};

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "rounded-lg px-3 py-2 text-sm font-medium transition",
    isActive
      ? "bg-[var(--accent)] text-white"
      : "text-[var(--muted)] hover:bg-white/70 hover:text-[var(--ink)]",
  ].join(" ");

export function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--line)] bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link
            to="/dashboard"
            className="text-sm font-semibold tracking-[0.18em] text-[var(--accent)] uppercase"
          >
            GlobeTrotter
          </Link>

          <nav className="flex items-center gap-1">
            <NavLink to="/dashboard" className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/trips" className={navLinkClass}>
              My Trips
            </NavLink>
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-[var(--muted)] sm:inline">
              {user?.name}
            </span>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm font-medium text-[var(--ink)] transition hover:bg-[#f4f7fa]"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
