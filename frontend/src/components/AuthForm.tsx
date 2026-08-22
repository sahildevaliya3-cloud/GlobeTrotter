import type { FormEvent, ReactNode } from "react";
import { Link } from "react-router-dom";

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-8 shadow-[0_18px_50px_rgba(19,34,56,0.08)]">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold tracking-[0.18em] text-[var(--accent)] uppercase">
            GlobeTrotter
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--ink)]">
            {title}
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">{subtitle}</p>
        </div>
        {children}
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
        className="w-full rounded-xl border border-[var(--line)] bg-white px-3.5 py-2.5 text-[var(--ink)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(31,111,139,0.18)]"
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
    <form className="space-y-4" onSubmit={onSubmit} noValidate>
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
        className="w-full rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--accent-dark)] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting ? "Please wait…" : submitLabel}
      </button>

      <div className="pt-1 text-center text-sm text-[var(--muted)]">{footer}</div>
    </form>
  );
}

export function AuthLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="font-medium text-[var(--accent)] underline-offset-2 hover:underline"
    >
      {children}
    </Link>
  );
}
