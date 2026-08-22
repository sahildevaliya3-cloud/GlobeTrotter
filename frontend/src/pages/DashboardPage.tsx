import { useAuth } from "../auth/AuthContext";

export function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-4 py-10">
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-8 shadow-[0_18px_50px_rgba(19,34,56,0.08)]">
        <p className="text-sm font-semibold tracking-[0.18em] text-[var(--accent)] uppercase">
          Dashboard
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--ink)]">
          Hello, {user?.name ?? "traveler"}
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          You&apos;re signed in as {user?.email}. Trip planning tools will live
          here next.
        </p>
        <button
          type="button"
          onClick={logout}
          className="mt-6 rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm font-semibold text-[var(--ink)] transition hover:bg-[#f4f7fa]"
        >
          Log out
        </button>
      </div>
    </div>
  );
}
