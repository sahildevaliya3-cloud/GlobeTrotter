import type { Activity } from "../lib/api";
import { formatActivityCost } from "../lib/api";

type ActivityCardProps = {
  activity: Activity;
  adding?: boolean;
  added?: boolean;
  onAdd: (activity: Activity) => void;
};

export function ActivityCard({
  activity,
  adding,
  added,
  onAdd,
}: ActivityCardProps) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-[0_10px_30px_rgba(19,34,56,0.06)]">
      <div
        className="h-32 bg-cover bg-center"
        style={{
          backgroundImage: activity.image_url
            ? `url(${activity.image_url})`
            : "linear-gradient(135deg, #15556a 0%, #8fb8c7 55%, #f7f4ee 100%)",
        }}
      />

      <div className="flex flex-1 flex-col p-5">
        <div className="flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-semibold text-[var(--ink)]">
              {activity.name}
            </h3>
            <span className="rounded-full bg-[#eef4f7] px-2.5 py-1 text-xs font-medium capitalize text-[var(--accent)]">
              {activity.category}
            </span>
          </div>

          {activity.description ? (
            <p className="mt-2 line-clamp-3 text-sm text-[var(--muted)]">
              {activity.description}
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-3 text-sm text-[var(--muted)]">
            <span>{formatActivityCost(activity.cost)}</span>
            <span>{activity.duration_hours}h</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onAdd(activity)}
          disabled={adding || added}
          className="mt-5 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--accent-dark)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {added ? "Added" : adding ? "Adding…" : "Add"}
        </button>
      </div>
    </article>
  );
}
