import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronUp, ChevronDown, Trash2, Plus, Calendar } from "lucide-react";
import {
  formatTripDateRange,
  toDateInputValue,
  type Stop,
} from "../lib/api";

type StopCardProps = {
  stop: Stop;
  tripId: string;
  index: number;
  total: number;
  saving?: boolean;
  onSaveDates: (stopId: string, startDate: string, endDate: string) => Promise<void>;
  onMoveUp: (stop: Stop) => void;
  onMoveDown: (stop: Stop) => void;
  onRemove: (stop: Stop) => void;
};

export function StopCard({
  stop,
  tripId,
  index,
  total,
  saving = false,
  onSaveDates,
  onMoveUp,
  onMoveDown,
  onRemove,
}: StopCardProps) {
  const [startDate, setStartDate] = useState(toDateInputValue(stop.startDate));
  const [endDate, setEndDate] = useState(toDateInputValue(stop.endDate));
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    setStartDate(toDateInputValue(stop.startDate));
    setEndDate(toDateInputValue(stop.endDate));
    setLocalError(null);
  }, [stop.id, stop.startDate, stop.endDate]);

  const datesDirty =
    startDate !== toDateInputValue(stop.startDate) ||
    endDate !== toDateInputValue(stop.endDate);

  async function handleSaveDates() {
    if (endDate <= startDate) {
      setLocalError("End date must be after start date.");
      return;
    }

    setLocalError(null);
    await onSaveDates(stop.id, startDate, endDate);
  }

  return (
    <article className="card-hover rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent-light)] text-sm font-bold text-[var(--accent)]">
            {index + 1}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[var(--ink)]">
              {stop.city?.name ?? "Unknown city"}
            </h3>
            <p className="text-sm font-medium text-[var(--accent)]">
              {stop.city?.country ?? "—"}
            </p>
            <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-[var(--muted)]">
              <Calendar size={14} />
              {formatTripDateRange(stop.startDate, stop.endDate)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-2">
          <Link
            to={`/trips/${tripId}/stops/${stop.id}/activities`}
            className="flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl bg-[var(--accent)] px-3 py-2 text-xs font-bold text-white shadow-sm transition-all duration-200 hover:bg-[var(--accent-dark)] hover:shadow-md"
          >
            <Plus size={14} /> Activities
          </Link>
          <button
            type="button"
            onClick={() => onMoveUp(stop)}
            disabled={index === 0 || saving}
            className="flex min-h-[40px] items-center justify-center gap-1 rounded-xl border border-[var(--line)] px-3 py-2 text-xs font-bold text-[var(--ink)] transition-all duration-200 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronUp size={14} /> Up
          </button>
          <button
            type="button"
            onClick={() => onMoveDown(stop)}
            disabled={index === total - 1 || saving}
            className="flex min-h-[40px] items-center justify-center gap-1 rounded-xl border border-[var(--line)] px-3 py-2 text-xs font-bold text-[var(--ink)] transition-all duration-200 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronDown size={14} /> Down
          </button>
          <button
            type="button"
            onClick={() => onRemove(stop)}
            disabled={saving}
            className="flex min-h-[40px] items-center justify-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 transition-all duration-200 hover:bg-red-100 disabled:opacity-50"
          >
            <Trash2 size={14} /> Remove
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 border-t border-[var(--line)] pt-5 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[var(--ink)]">Start date</span>
          <input
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            className="input-base"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[var(--ink)]">End date</span>
          <input
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            className="input-base"
          />
        </label>
      </div>

      {localError ? (
        <p className="mt-3 text-sm text-[var(--danger)]">{localError}</p>
      ) : null}

      {datesDirty ? (
        <button
          type="button"
          onClick={handleSaveDates}
          disabled={saving}
          className="mt-4 rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-[var(--accent-dark)] disabled:opacity-70"
        >
          {saving ? "Saving…" : "Save dates"}
        </button>
      ) : null}
    </article>
  );
}
