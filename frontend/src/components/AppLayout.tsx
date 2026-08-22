import { useState, type ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

type AppLayoutProps = {
  children: ReactNode;
};

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "rounded-xl px-3.5 py-2 text-sm font-semibold transition flex items-center gap-1.5 min-h-[44px] sm:min-h-[36px]",
    isActive
      ? "bg-[var(--accent)] text-white shadow-xs"
      : "text-[var(--muted)] hover:bg-white/80 hover:text-[var(--ink)]",
  ].join(" ");

export function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#fafbfc]">
      <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          {/* Brand Logo */}
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-sm font-extrabold tracking-[0.18em] text-[var(--accent)] uppercase"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--accent)] text-white shadow-xs">
              🌍
            </span>
            <span className="hidden sm:inline">GlobeTrotter</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/dashboard" className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/trips" className={navLinkClass}>
              My Trips
            </NavLink>
            <NavLink to="/settings" className={navLinkClass}>
              Settings
            </NavLink>
          </nav>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <Link
                to="/settings"
                className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-slate-100/80"
                title="Profile & Settings"
              >
                {user.photoUrl || user.photo_url ? (
                  <img
                    src={user.photoUrl || user.photo_url || ""}
                    alt={user.name}
                    className="h-8 w-8 rounded-full border border-[var(--line)] object-cover shadow-2xs"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-bold text-white shadow-2xs">
                    {(user.name || "U").charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="hidden text-sm font-bold text-[var(--ink)] sm:inline">
                  {user.name}
                </span>
              </Link>
            ) : null}

            {user ? (
              <button
                type="button"
                onClick={logout}
                className="hidden sm:inline-flex items-center rounded-xl border border-[var(--line)] px-3.5 py-2 text-xs font-bold text-[var(--ink)] transition hover:bg-[#f4f7fa]"
              >
                Log out
              </button>
            ) : null}

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-[var(--line)] bg-white p-2 text-[var(--ink)] transition hover:bg-slate-100 md:hidden"
              aria-label="Toggle navigation menu"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Collapsible Mobile Navigation Drawer */}
        {mobileMenuOpen ? (
          <div className="border-t border-[var(--line)] bg-white px-4 py-3 space-y-2 md:hidden animate-in slide-in-from-top-2 duration-150">
            <nav className="flex flex-col gap-1">
              <NavLink
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={navLinkClass}
              >
                🏠 Home Dashboard
              </NavLink>
              <NavLink
                to="/trips"
                onClick={() => setMobileMenuOpen(false)}
                className={navLinkClass}
              >
                🗺 My Trips
              </NavLink>
              <NavLink
                to="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className={navLinkClass}
              >
                ⚙ Profile & Settings
              </NavLink>
            </nav>

            {user ? (
              <div className="pt-2 border-t border-[var(--line)] flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--muted)]">
                  Signed in as <strong className="text-[var(--ink)]">{user.name}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100"
                >
                  Log out
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}
