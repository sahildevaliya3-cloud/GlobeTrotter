import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ActivityCard } from "../components/ActivityCard";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../auth/AuthContext";
import { useTripDetail } from "../hooks/useTripDetail";
import {
  ACTIVITY_CATEGORIES,
  addActivityToStop,
  ApiError,
  searchActivities,
  type Activity,
} from "../lib/api";

export function ActivitySearchPage() {
  const { id: tripId, stopId } = useParams();
  const { token } = useAuth();
  const { trip, loading: tripLoading, error: tripError } = useTripDetail(tripId);

  const stop = trip?.stops?.find((item) => item.id === stopId);

  const [category, setCategory] = useState("");
  const [maxCost, setMaxCost] = useState("");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [addingActivityId, setAddingActivityId] = useState<string | null>(null);
  const [addedActivityIds, setAddedActivityIds] = useState<Set<string>>(new Set());

  const loadActivities = useCallback(async () => {
    if (!token || !stop?.cityId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await searchActivities(token, {
        city_id: stop.cityId,
        category: category || undefined,
        maxCost: maxCost || undefined,
      });
      setActivities(result.activities);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Unable to load activities. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [token, stop?.cityId, category, maxCost]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadActivities();
    }, 250);

    return () => window.clearTimeout(timer);
  }, [loadActivities]);

  const resultSummary = useMemo(() => {
    if (loading) return "Searching activities…";
    return `${activities.length} ${activities.length === 1 ? "activity" : "activities"} found`;
  }, [activities.length, loading]);

  async function handleAddActivity(activity: Activity) {
    if (!token || !stopId) return;

    setAddingActivityId(activity.id);
    setActionError(null);

    try {
      await addActivityToStop(token, stopId, {
        activity_id: activity.id,
        scheduled_date: stop?.startDate.slice(0, 10),
        scheduled_time: "10:00",
      });
      setAddedActivityIds((current) => new Set(current).add(activity.id));
    } catch (err) {
      setActionError(
        err instanceof ApiError
          ? err.message
          : "Unable to add this activity. Please try again."
      );
    } finally {
      setAddingActivityId(null);
    }
  }

  if (!tripId || !stopId) {
    return (
      <AppLayout>
        <p className="text-[var(--danger)]">Stop not found.</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold tracking-[0.18em] text-[var(--accent)] uppercase">
            Activity Search
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--ink)]">
            {stop?.city?.name ?? "Find activities"}
          </h1>
          <p className="mt-2 text-[var(--muted)]">
            Browse activities for this stop and add them to your itinerary.
          </p>
        </div>
        <Link
          to={`/trips/${tripId}/itinerary`}
          className="inline-flex rounded-xl border border-[var(--line)] px-5 py-2.5 text-sm font-semibold text-[var(--ink)] transition hover:bg-[#f4f7fa]"
        >
          Back to Itinerary
        </Link>
      </section>

      {tripLoading ? (
        <p className="mt-6 text-sm text-[var(--muted)]">Loading stop details…</p>
      ) : tripError ? (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-[#fecdca] bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]"
        >
          {tripError}
        </div>
      ) : !stop ? (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-[#fecdca] bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]"
        >
          This stop could not be found on the trip.
        </div>
      ) : (
        <>
          <section className="mt-8 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_10px_30px_rgba(19,34,56,0.06)]">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-[var(--ink)]">Category</span>
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="w-full rounded-xl border border-[var(--line)] bg-white px-3.5 py-2.5 text-[var(--ink)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(31,111,139,0.18)]"
                >
                  <option value="">All categories</option>
                  {ACTIVITY_CATEGORIES.map((option) => (
                    <option key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-[var(--ink)]">Max cost</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={maxCost}
                  onChange={(event) => setMaxCost(event.target.value)}
                  placeholder="No limit"
                  className="w-full rounded-xl border border-[var(--line)] bg-white px-3.5 py-2.5 text-[var(--ink)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(31,111,139,0.18)]"
                />
              </label>
            </div>

            <p className="mt-4 text-sm text-[var(--muted)]">{resultSummary}</p>
          </section>

          {actionError ? (
            <div
              role="alert"
              className="mt-6 rounded-xl border border-[#fecdca] bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]"
            >
              {actionError}
            </div>
          ) : null}

          <section className="mt-8">
            {error ? (
              <div
                role="alert"
                className="rounded-xl border border-[#fecdca] bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]"
              >
                {error}
              </div>
            ) : loading ? (
              <p className="text-sm text-[var(--muted)]">Loading activities…</p>
            ) : activities.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--line)] bg-white/60 p-10 text-center">
                <p className="text-[var(--muted)]">
                  No activities match your filters for this city.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {activities.map((activity) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    adding={addingActivityId === activity.id}
                    added={addedActivityIds.has(activity.id)}
                    onAdd={handleAddActivity}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </AppLayout>
  );
}
