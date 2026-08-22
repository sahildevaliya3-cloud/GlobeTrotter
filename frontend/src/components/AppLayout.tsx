import { useState, type ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  Home,
  Map,
  Settings,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Globe,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";

type AppLayoutProps = {
  children: ReactNode;
};

const navItems = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/trips", label: "My Trips", icon: Map },
  { to: "/settings", label: "Settings", icon: Settings },
];

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "rounded-xl px-3.5 py-2 text-sm font-semibold transition-all duration-200 flex items-center gap-2 min-h-[44px] sm:min-h-[36px]",
    isActive
      ? "bg-[var(--accent)] text-white shadow-sm"
      : "text-[var(--muted)] hover:bg-white/80 hover:text-[var(--ink)] hover:shadow-sm",
  ].join(" ");

export function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAdmin = user?.isAdmin || user?.is_admin;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-white/90 backdrop-blur-lg shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          {/* Brand Logo */}
          <Link
            to="/dashboard"
            className="flex items-center gap-2.5 text-sm font-extrabold tracking-[0.18em] text-[var(--accent)] uppercase"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent)] text-white shadow-sm">
              <Globe size={18} />
            </span>
            <span className="hidden sm:inline">GlobeTrotter</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={navLinkClass}>
                <Icon size={16} /> {label}
              </NavLink>
            ))}
            {isAdmin ? (
              <NavLink to="/admin" className={navLinkClass}>
                <ShieldCheck size={16} /> Admin
              </NavLink>
            ) : null}
          </nav>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <Link
                to="/settings"
                className="flex items-center gap-2 rounded-xl p-1.5 transition-all duration-200 hover:bg-slate-100/80"
                title="Profile & Settings"
              >
                {user.photoUrl || user.photo_url ? (
                  <img
                    src={user.photoUrl || user.photo_url || ""}
                    alt={user.name}
                    className="h-8 w-8 rounded-full border-2 border-[var(--accent-light)] object-cover shadow-sm"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-bold text-white shadow-sm">
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
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-[var(--line)] px-3.5 py-2 text-xs font-bold text-[var(--ink)] transition-all duration-200 hover:bg-slate-50 hover:shadow-sm"
              >
                <LogOut size={14} /> Log out
              </button>
            ) : null}

            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-[var(--line)] bg-white p-2 text-[var(--ink)] transition-all duration-200 hover:bg-slate-50 md:hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen ? (
          <div className="border-t border-[var(--line)] bg-white px-4 py-3 space-y-2 md:hidden">
            <nav className="flex flex-col gap-1">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={navLinkClass}
                >
                  <Icon size={16} /> {label}
                </NavLink>
              ))}
              {isAdmin ? (
                <NavLink
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={navLinkClass}
                >
                  <ShieldCheck size={16} /> Admin
                </NavLink>
              ) : null}
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
                  className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-bold text-red-600 transition-all duration-200 hover:bg-red-100"
                >
                  <LogOut size={14} /> Log out
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {children}
      </main>
    </div>
  );
}
