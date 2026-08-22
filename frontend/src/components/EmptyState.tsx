import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
  children?: ReactNode;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  ctaLabel,
  ctaHref,
  children,
}: EmptyStateProps) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-[var(--line)] bg-white/60 px-6 py-14 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-light)] text-[var(--accent)]">
        <Icon size={28} strokeWidth={1.8} />
      </div>
      <h3 className="text-lg font-semibold text-[var(--ink)]">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-[var(--muted)]">
        {description}
      </p>
      {ctaLabel && ctaHref ? (
        <Link
          to={ctaHref}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[var(--accent-dark)] hover:shadow-md"
        >
          {ctaLabel}
        </Link>
      ) : null}
      {children}
    </div>
  );
}
