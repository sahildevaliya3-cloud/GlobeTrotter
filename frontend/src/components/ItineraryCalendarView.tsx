import { useMemo, useState, type FormEvent } from "react";
import { useAuth } from "../auth/AuthContext";
import {
  deleteTripActivity,
  formatActivityCost,
  formatDisplayDate,
  formatScheduledTime,
  getTripActivityCost,
  getTripActivityDuration,
  type Stop,
  type TripActivityDetail,
  updateTripActivity,
} from "../lib/api";

const CITY_PALETTES = [
  { bg: "bg-teal-50", border: "border-teal-300", text: "text-teal-900", badge: "bg-teal-600", dot: "#0d9488" },
  { bg: "bg-indigo-50", border: "border-indigo-300", text: "text-indigo-900", badge: "bg-indigo-600", dot: "#4f46e5" },
  { bg: "bg-amber-50", border: "border-amber-300", text: "text-amber-900", badge: "bg-amber-600", dot: "#d97706" },
  { bg: "bg-rose-50", border: "border-rose-300", text: "text-rose-900", badge: "bg-rose-600", dot: "#e11d48" },
  { bg: "bg-emerald-50", border: "border-emerald-300", text: "text-emerald-900", badge: "bg-emerald-600", dot: "#059669" },
  { bg: "bg-purple-50", border: "border-purple-300", text: "text-purple-900", badge: "bg-purple-600", dot: "#9333ea" },
];

function getCityPalette(stopIndex: number) {
  return CITY_PALETTES[stopIndex % CITY_PALETTES.length];
}

type ItineraryCalendarViewProps = {
  stops: Stop[];
  startDate?: string;
  endDate?: string;
  onRefresh?: () => void;
};

export function ItineraryCalendarView({
  stops,
  startDate,
  endDate,
  onRefresh,
}: ItineraryCalendarViewProps) {
  const { token } = useAuth();
  const [selectedActivity, setSelectedActivity] = useState<TripActivityDetail | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editCustomCost, setEditCustomCost] = useState("");
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Map stop by ID for quick lookup
  const stopMap = useMemo(() => {
    const map = new Map<string, { stop: Stop; palette: typeof CITY_PALETTES[0]; index: number }>();
    stops.forEach((stop, idx) => {
      map.set(stop.id, {
        stop,
        palette: getCityPalette(idx),
        index: idx,
      });
    });
    return map;
  }, [stops]);

  // Generate list of days across trip
  const tripDays = useMemo(() => {
    let start: Date | null = null;
    let end: Date | null = null;

    if (startDate && endDate) {
      start = new Date(startDate.slice(0, 10) + "T00:00:00.000Z");
      end = new Date(endDate.slice(0, 10) + "T00:00:00.000Z");
    } else if (stops.length > 0) {
      const dates = stops
        .flatMap((s) => [s.startDate, s.endDate])
        .filter(Boolean)
        .map((d) => new Date(d.slice(0, 10) + "T00:00:00.000Z"));
      if (dates.length > 0) {
        start = new Date(Math.min(...dates.map((d) => d.getTime())));
        end = new Date(Math.max(...dates.map((d) => d.getTime())));
      }
    }

    if (!start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return [];
    }

    const days: string[] = [];
    const current = new Date(start);
    while (current <= end) {
      days.push(current.toISOString().slice(0, 10));
      current.setUTCDate(current.getUTCDate() + 1);
    }
    return days;
  }, [startDate, endDate, stops]);

  // Group trip activities by dateKey (YYYY-MM-DD)
  const activitiesByDay = useMemo(() => {
    const map = new Map<string, { tripActivity: TripActivityDetail; stop: Stop; palette: typeof CITY_PALETTES[0] }[]>();

    for (const stop of stops) {
      const stopInfo = stopMap.get(stop.id);
      if (!stopInfo) continue;

      for (const tripActivity of stop.tripActivities ?? []) {
        const dateKey = tripActivity.scheduledDate.slice(0, 10);
        const existing = map.get(dateKey) ?? [];
        existing.push({
          tripActivity,
          stop,
          palette: stopInfo.palette,
        });
        map.set(dateKey, existing);
      }
    }

    // Sort activities within each day by scheduledTime
    map.forEach((list) => {
      list.sort((a, b) => a.tripActivity.scheduledTime.localeCompare(b.tripActivity.scheduledTime));
    });

    return map;
  }, [stops, stopMap]);

  function handleOpenQuickEdit(tripActivity: TripActivityDetail) {
    setSelectedActivity(tripActivity);
    setEditDate(tripActivity.scheduledDate.slice(0, 10));

    // Convert scheduledTime ISO or HH:MM string to HH:MM format for input
    const timeMatch = /^(\d{1,2}):(\d{2})/.exec(tripActivity.scheduledTime);
    if (timeMatch) {
      setEditTime(`${String(timeMatch[1]).padStart(2, "0")}:${timeMatch[2]}`);
    } else {
      const d = new Date(tripActivity.scheduledTime);
      if (!Number.isNaN(d.getTime())) {
        const h = String(d.getUTCHours()).padStart(2, "0");
        const m = String(d.getUTCMinutes()).padStart(2, "0");
        setEditTime(`${h}:${m}`);
      } else {
        setEditTime("10:00");
      }
    }

    setEditCustomCost(
      tripActivity.customCost != null && tripActivity.customCost !== ""
        ? String(tripActivity.customCost)
        : ""
    );
    setError(null);
  }

  async function handleSaveQuickEdit(e: FormEvent) {
    e.preventDefault();
    if (!token || !selectedActivity) return;

    setSaving(true);
    setError(null);

    try {
      await updateTripActivity(token, selectedActivity.id, {
        scheduled_date: editDate,
        scheduled_time: editTime,
        custom_cost: editCustomCost.trim() ? Number(editCustomCost) : null,
      });

      setSuccessMsg("Activity rescheduled successfully!");
      setTimeout(() => setSuccessMsg(null), 3000);
      setSelectedActivity(null);
      onRefresh?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update activity.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteActivity() {
    if (!token || !selectedActivity) return;
    if (!window.confirm("Are you sure you want to remove this activity from your itinerary?")) return;

    setSaving(true);
    setError(null);

    try {
      await deleteTripActivity(token, selectedActivity.id);
      setSuccessMsg("Activity removed from itinerary.");
      setTimeout(() => setSuccessMsg(null), 3000);
      setSelectedActivity(null);
      onRefresh?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete activity.");
    } finally {
      setSaving(false);
    }
  }

  if (tripDays.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--line)] bg-white/60 p-12 text-center">
        <p className="text-base font-semibold text-[var(--ink)]">No trip schedule dates found</p>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Add stops to your trip to see the interactive day-by-day calendar timeline.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Bar / City Legend */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
            Stops Legend:
          </span>
          {stops.map((stop, idx) => {
            const palette = getCityPalette(idx);
            return (
              <span
                key={stop.id}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${palette.bg} ${palette.border} ${palette.text}`}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: palette.dot }}
                />
                Stop {idx + 1}: {stop.city?.name ?? "City"}
              </span>
            );
          })}
        </div>
        <p className="text-xs font-medium text-[var(--muted)]">
          💡 Click any activity to quick-edit date, time, or cost override
        </p>
      </div>

      {successMsg ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          ✓ {successMsg}
        </div>
      ) : null}

      {/* Calendar Day Grid Timeline */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tripDays.map((dayKey, dayIdx) => {
          const dayItems = activitiesByDay.get(dayKey) ?? [];
          const isExpanded = expandedDay === dayKey;

          // Check if day falls within any stop's date range
          const activeStops = stops.filter((stop) => {
            const s = stop.startDate.slice(0, 10);
            const e = stop.endDate.slice(0, 10);
            return dayKey >= s && dayKey <= e;
          });

          return (
            <div
              key={dayKey}
              className="flex flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-xs transition hover:shadow-md"
            >
              {/* Day Header */}
              <div className="border-b border-[var(--line)] bg-[#f8fafc] px-5 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-[var(--accent)]">
                    Day {dayIdx + 1}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {activeStops.map((stop) => {
                      const info = stopMap.get(stop.id);
                      if (!info) return null;
                      return (
                        <span
                          key={stop.id}
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${info.palette.badge} text-white`}
                          title={`${stop.city?.name ?? "City"} stop`}
                        >
                          {stop.city?.name ?? "City"}
                        </span>
                      );
                    })}
                  </div>
                </div>
                <h3 className="mt-1 text-base font-bold text-[var(--ink)]">
                  {formatDisplayDate(dayKey)}
                </h3>
              </div>

              {/* Day Content / Activities list */}
              <div className="flex flex-1 flex-col p-4">
                {dayItems.length === 0 ? (
                  <div className="flex flex-1 items-center justify-center p-6 text-center text-xs text-[var(--muted)]">
                    No activities scheduled
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {dayItems.map(({ tripActivity, palette }) => {
                      const duration = getTripActivityDuration(tripActivity);
                      const costText = getTripActivityCost(tripActivity);

                      return (
                        <button
                          key={tripActivity.id}
                          type="button"
                          onClick={() => handleOpenQuickEdit(tripActivity)}
                          className={`w-full rounded-xl border ${palette.border} ${palette.bg} p-3 text-left transition hover:scale-[1.01] hover:shadow-sm`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className={`font-bold text-sm ${palette.text}`}>
                              {tripActivity.activity?.name ?? "Activity"}
                            </span>
                            <span className="shrink-0 font-bold text-xs text-[var(--ink)]">
                              {costText}
                            </span>
                          </div>

                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-medium text-[var(--muted)]">
                            <span className="inline-flex items-center gap-1 rounded-md bg-white/80 px-2 py-0.5 text-[11px] font-semibold text-[var(--ink)] shadow-2xs">
                              ⏰ {formatScheduledTime(tripActivity.scheduledTime)}
                            </span>
                            {duration ? (
                              <span className="text-[11px]">⏱ {duration}</span>
                            ) : null}
                            {tripActivity.activity?.category ? (
                              <span className="capitalize text-[10px] font-semibold text-[var(--accent)]">
                                {tripActivity.activity.category}
                              </span>
                            ) : null}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Day Footer / Expand toggle */}
              {dayItems.length > 0 ? (
                <div className="border-t border-[var(--line)] bg-[#fafcfd] px-4 py-2 text-right">
                  <button
                    type="button"
                    onClick={() => setExpandedDay(isExpanded ? null : dayKey)}
                    className="text-xs font-semibold text-[var(--accent)] hover:underline"
                  >
                    {isExpanded ? "Hide details ↑" : `View ${dayItems.length} activities ↓`}
                  </button>
                </div>
              ) : null}

              {/* Expanded Day Details Panel */}
              {isExpanded ? (
                <div className="border-t border-[var(--line)] bg-slate-50/80 p-4 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                    Full Day Timeline Details
                  </p>
                  {dayItems.map(({ tripActivity }) => (
                    <div
                      key={tripActivity.id}
                      className="rounded-xl border border-[var(--line)] bg-white p-3 text-xs"
                    >
                      <div className="flex justify-between font-bold text-[var(--ink)]">
                        <span>{tripActivity.activity?.name}</span>
                        <span>{getTripActivityCost(tripActivity)}</span>
                      </div>
                      {tripActivity.activity?.description ? (
                        <p className="mt-1 text-[var(--muted)]">
                          {tripActivity.activity.description}
                        </p>
                      ) : null}
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[11px] text-[var(--accent)]">
                          Time: {formatScheduledTime(tripActivity.scheduledTime)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOpenQuickEdit(tripActivity)}
                          className="font-bold text-[var(--accent)] hover:underline"
                        >
                          Quick edit →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Quick-Edit Modal */}
      {selectedActivity ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <header className="flex items-center justify-between border-b border-[var(--line)] bg-[#f7fafb] px-6 py-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
                  Quick Edit Activity
                </span>
                <h3 className="text-lg font-bold text-[var(--ink)]">
                  {selectedActivity.activity?.name ?? "Activity"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedActivity(null)}
                className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-[#e2e8f0] hover:text-[var(--ink)]"
              >
                ✕
              </button>
            </header>

            <form onSubmit={handleSaveQuickEdit} className="p-6 space-y-4">
              {selectedActivity.activity?.description ? (
                <p className="text-xs text-[var(--muted)] bg-[#f8fafc] p-3 rounded-xl border border-[var(--line)]">
                  {selectedActivity.activity.description}
                </p>
              ) : null}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                  Scheduled Date
                </label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  min={startDate ? startDate.slice(0, 10) : undefined}
                  max={endDate ? endDate.slice(0, 10) : undefined}
                  className="mt-1 w-full rounded-xl border border-[var(--line)] bg-white px-3.5 py-2 text-sm font-medium text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                    Scheduled Time
                  </label>
                  <input
                    type="time"
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[var(--line)] bg-white px-3.5 py-2 text-sm font-medium text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                    Custom Cost ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder={`Base: ${formatActivityCost(selectedActivity.activity?.cost ?? 0)}`}
                    value={editCustomCost}
                    onChange={(e) => setEditCustomCost(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[var(--line)] bg-white px-3.5 py-2 text-sm font-medium text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
                  />
                </div>
              </div>

              {error ? (
                <div role="alert" className="rounded-xl border border-[#fecdca] bg-[var(--danger-soft)] p-3 text-xs text-[var(--danger)]">
                  {error}
                </div>
              ) : null}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--line)]">
                <button
                  type="button"
                  onClick={handleDeleteActivity}
                  disabled={saving}
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                >
                  Remove activity
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedActivity(null)}
                    className="rounded-xl border border-[var(--line)] px-4 py-2 text-xs font-bold text-[var(--ink)] transition hover:bg-[#f4f7fa]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-[var(--accent)] px-5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[var(--accent-dark)] disabled:opacity-50"
                  >
                    {saving ? "Saving…" : "Save changes"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
