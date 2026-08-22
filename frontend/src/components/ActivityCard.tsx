import { DollarSign, Clock } from "lucide-react";
import type { Activity } from "../lib/api";
import { formatActivityCost } from "../lib/api";

type ActivityCardProps = {
  activity: Activity;
  adding?: boolean;
  added?: boolean;
  onAdd: (activity: Activity) => void;
};

const CATEGORY_BADGE: Record<string, string> = {
  sightseeing: "badge-sightseeing",
  food: "badge-food",
  adventure: "badge-adventure",
  culture: "badge-culture",
  relaxation: "badge-relaxation",
};

export function ActivityCard({
  activity,
  adding,
  added,
  onAdd,
}: ActivityCardProps) {
  const badgeClass =
    CATEGORY_BADGE[activity.category] ?? "bg-slate-100 text-slate-600";

  return (
    <article className="card-hover flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
      {/* Activity image */}
      <div className="relative h-36 overflow-hidden">
        <img
          src={
            activity.image_url ??
            "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=250&fit=crop"
          }
          alt={activity.name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        {/* Category badge */}
        <span
          className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${badgeClass}`}
        >
          {activity.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex-1">
          <h3 className="text-base font-semibold text-[var(--ink)]">
            {activity.name}
          </h3>

          {activity.description ? (
            <p className="mt-2 line-clamp-3 text-sm text-[var(--muted)]">
              {activity.description}
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
            <span className="inline-flex items-center gap-1">
              <DollarSign size={14} className="text-[var(--accent)]" />
              {formatActivityCost(activity.cost)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock size={14} className="text-[var(--accent)]" />
              {activity.duration_hours}h
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onAdd(activity)}
          disabled={adding || added}
          className="mt-5 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-[var(--accent-dark)] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
        >
          {added ? "✓ Added" : adding ? "Adding…" : "Add to Stop"}
        </button>
      </div>
    </article>
  );
}
