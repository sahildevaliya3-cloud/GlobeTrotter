import { Link } from "react-router-dom";
import { Eye, Pencil, DollarSign, Trash2 } from "lucide-react";
import { formatTripDateRange, type Trip } from "../lib/api";

type TripCardProps = {
  trip: Trip;
  showActions?: boolean;
  onDelete?: (trip: Trip) => void;
};

const FALLBACK_COVERS = [
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=300&fit=crop",
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&h=300&fit=crop",
  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&h=300&fit=crop",
  "https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=600&h=300&fit=crop",
];

function getCover(trip: Trip) {
  if (trip.coverPhotoUrl) return trip.coverPhotoUrl;
  // Stable per-trip fallback based on id hash
  const idx =
    trip.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) %
    FALLBACK_COVERS.length;
  return FALLBACK_COVERS[idx];
}

export function TripCard({
  trip,
  showActions = false,
  onDelete,
}: TripCardProps) {
  const stopLabel =
    trip.stopCount === 1 ? "1 stop" : `${trip.stopCount ?? 0} stops`;

  return (
    <article className="card-hover flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
      {/* Hero image with gradient overlay */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={getCover(trip)}
          alt={trip.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="text-lg font-bold text-white drop-shadow-sm">
            {trip.name}
          </h3>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex-1">
          {trip.description ? (
            <p className="line-clamp-2 text-sm text-[var(--muted)]">
              {trip.description}
            </p>
          ) : null}
          <p className="mt-3 text-sm text-[var(--muted)]">
            {formatTripDateRange(trip.startDate, trip.endDate)}
          </p>
          <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-[var(--accent-light)] px-2.5 py-0.5 text-xs font-semibold text-[var(--accent)]">
            {stopLabel}
          </span>
        </div>

        {showActions ? (
          <div className="mt-5 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <Link
              to={`/trips/${trip.id}/view`}
              className="flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl bg-[var(--accent)] px-3 py-2 text-xs font-bold text-white shadow-sm transition-all duration-200 hover:bg-[var(--accent-dark)] hover:shadow-md"
            >
              <Eye size={14} /> View
            </Link>
            <Link
              to={`/trips/${trip.id}/budget`}
              className="flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl border border-[var(--line)] px-3 py-2 text-xs font-bold text-[var(--ink)] transition-all duration-200 hover:bg-slate-50 hover:shadow-sm"
            >
              <DollarSign size={14} /> Budget
            </Link>
            <Link
              to={`/trips/${trip.id}/itinerary`}
              className="flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl border border-[var(--line)] px-3 py-2 text-xs font-bold text-[var(--ink)] transition-all duration-200 hover:bg-slate-50 hover:shadow-sm"
            >
              <Pencil size={14} /> Edit
            </Link>
            <button
              type="button"
              onClick={() => onDelete?.(trip)}
              className="flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 transition-all duration-200 hover:bg-red-100"
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        ) : (
          <div className="mt-5 flex items-center justify-between text-sm font-semibold">
            <Link
              to={`/trips/${trip.id}/view`}
              className="inline-flex items-center gap-1 text-[var(--accent)] underline-offset-2 transition-colors hover:text-[var(--accent-dark)] hover:underline"
            >
              <Eye size={14} /> View trip
            </Link>
            <Link
              to={`/trips/${trip.id}/budget`}
              className="inline-flex items-center gap-1 text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
            >
              <DollarSign size={14} /> Budget
            </Link>
          </div>
        )}
      </div>
    </article>
  );
}
