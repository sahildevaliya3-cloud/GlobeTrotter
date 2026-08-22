import type { FormEvent, ReactNode } from "react";
import { Link } from "react-router-dom";
import { Globe, Loader2 } from "lucide-react";

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-modal)]">
        {/* Decorative travel header strip */}
        <div className="relative h-28 overflow-hidden bg-gradient-to-br from-[var(--accent)] via-teal-500 to-cyan-400">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                <Globe size={24} className="text-white" />
              </div>
              <span className="text-xl font-extrabold tracking-wider text-white uppercase">
                GlobeTrotter
              </span>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--ink)]">
              {title}
            </h1>
            <p className="mt-2 text-sm text-[var(--muted)]">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

type FieldProps = {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  placeholder?: string;
};

export function Field({
  id,
  label,
  type = "text",
  value,
  onChange,
  autoComplete,
  placeholder,
}: FieldProps) {
  return (
    <label className="block space-y-1.5" htmlFor={id}>
      <span className="text-sm font-medium text-[var(--ink)]">{label}</span>
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="input-base"
      />
    </label>
  );
}

type AuthFormProps = {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  error: string | null;
  submitLabel: string;
  submitting: boolean;
  children: ReactNode;
  footer: ReactNode;
};

export function AuthForm({
  onSubmit,
  error,
  submitLabel,
  submitting,
  children,
  footer,
}: AuthFormProps) {
  return (
    <form className="space-y-5" onSubmit={onSubmit} noValidate>
      {children}

      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-[#fecdca] bg-[var(--danger-soft)] px-3.5 py-3 text-sm text-[var(--danger)]"
        >
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[var(--accent-dark)] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Please wait…
          </>
        ) : (
          submitLabel
        )}
      </button>

      <div className="pt-1 text-center text-sm text-[var(--muted)]">{footer}</div>
    </form>
  );
}

export function AuthLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="font-medium text-[var(--accent)] underline-offset-2 transition-colors hover:text-[var(--accent-dark)] hover:underline"
    >
      {children}
    </Link>
  );
}
