import { Link } from "react-router-dom";
import { formatTripDateRange, type Trip } from "../lib/api";

type TripCardProps = {
  trip: Trip;
  showActions?: boolean;
  onDelete?: (trip: Trip) => void;
};

export function TripCard({
  trip,
  showActions = false,
  onDelete,
}: TripCardProps) {
  const stopLabel =
    trip.stopCount === 1 ? "1 stop" : `${trip.stopCount ?? 0} stops`;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-[0_10px_30px_rgba(19,34,56,0.06)]">
      <div
        className="h-36 bg-cover bg-center"
        style={{
          backgroundImage: trip.coverPhotoUrl
            ? `url(${trip.coverPhotoUrl})`
            : "linear-gradient(135deg, #1f6f8b 0%, #8fb8c7 55%, #f7f4ee 100%)",
        }}
      />

      <div className="flex flex-1 flex-col p-5">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-[var(--ink)]">{trip.name}</h3>
          {trip.description ? (
            <p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">
              {trip.description}
            </p>
          ) : null}
          <p className="mt-3 text-sm text-[var(--muted)]">
            {formatTripDateRange(trip.startDate, trip.endDate)}
          </p>
          <p className="mt-1 text-sm font-medium text-[var(--accent)]">
            {stopLabel}
          </p>
        </div>

        {showActions ? (
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              to={`/trips/${trip.id}/view`}
              className="rounded-lg bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-dark)]"
            >
              View
            </Link>
            <Link
              to={`/trips/${trip.id}/budget`}
              className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm font-semibold text-[var(--ink)] transition hover:bg-[#f4f7fa]"
            >
              Budget
            </Link>
            <Link
              to={`/trips/${trip.id}/itinerary`}
              className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm font-semibold text-[var(--ink)] transition hover:bg-[#f4f7fa]"
            >
              Edit
            </Link>
            <button
              type="button"
              onClick={() => onDelete?.(trip)}
              className="rounded-lg border border-[#fecdca] px-3 py-2 text-sm font-semibold text-[var(--danger)] transition hover:bg-[var(--danger-soft)]"
            >
              Delete
            </button>
          </div>
        ) : (
          <div className="mt-5 flex items-center justify-between text-sm font-semibold">
            <Link
              to={`/trips/${trip.id}/view`}
              className="text-[var(--accent)] underline-offset-2 hover:underline"
            >
              View trip
            </Link>
            <Link
              to={`/trips/${trip.id}/budget`}
              className="text-[var(--muted)] hover:text-[var(--ink)]"
            >
              Budget →
            </Link>
          </div>
        )}
      </div>
    </article>
  );
}
