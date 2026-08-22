import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { AppLayout } from "../components/AppLayout";
import { ItineraryCalendarView } from "../components/ItineraryCalendarView";
import { ItineraryListView } from "../components/ItineraryListView";
import {
  cloneTrip,
  formatActivityCost,
  formatTripDateRange,
  getPublicTrip,
  getTripActivityCost,
  type Stop,
  type Trip,
  type TripActivityDetail,
} from "../lib/api";
import { sortStops } from "../lib/itinerary";

type ViewMode = "list" | "calendar";

export function PublicItineraryPage() {
  const { shareSlug } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cloning, setCloning] = useState(false);
  const [cloneMsg, setCloneMsg] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  useEffect(() => {
    if (!shareSlug) return;
    setLoading(true);
    setError(null);

    getPublicTrip(shareSlug)
      .then((res) => {
        setTrip(res.trip);
      })
      .catch((err) => {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load public itinerary. The link may be invalid or set to private."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [shareSlug]);

  const stops = sortStops(trip?.stops ?? []);

  const totalActivities = stops.reduce(
    (acc: number, stop: Stop) => acc + (stop.tripActivities?.length ?? 0),
    0
  );

  const totalCost = stops.reduce((acc: number, stop: Stop) => {
    return (
      acc +
      (stop.tripActivities?.reduce((actAcc: number, ta: TripActivityDetail) => {
        const valStr = getTripActivityCost(ta).replace("$", "");
        return actAcc + (Number(valStr) || 0);
      }, 0) ?? 0)
    );
  }, 0);

  async function handleCloneTrip() {
    if (!token) {
      if (
        window.confirm(
          "To copy this trip into your account, please log in or create an account. Proceed to login?"
        )
      ) {
        navigate("/login");
      }
      return;
    }

    if (!shareSlug) return;

    setCloning(true);
    setError(null);

    try {
      const res = await cloneTrip(token, shareSlug);
      setCloneMsg("Trip successfully copied to your account!");
      setTimeout(() => {
        navigate(`/trips/${res.trip.id}/itinerary`);
      }, 1200);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to copy trip to your account."
      );
      setCloning(false);
    }
  }

  return (
    <AppLayout>
      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-300 bg-sky-50 px-3 py-1 text-xs font-bold text-sky-800">
                🌐 Public Shared Itinerary
              </span>
              {trip?.ownerName ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-900">
                  👤 Shared by {trip.ownerName}
                </span>
              ) : null}
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-[var(--ink)] sm:text-4xl">
              {trip?.name ?? (loading ? "Loading trip…" : "Public Trip")}
            </h1>

            {trip ? (
              <p className="text-sm font-semibold text-[var(--accent)]">
                🗓 {formatTripDateRange(trip.startDate, trip.endDate)}
              </p>
            ) : null}

            {trip?.description ? (
              <p className="max-w-2xl text-sm text-[var(--muted)]">
                {trip.description}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleCloneTrip}
              disabled={cloning || loading || !trip}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-[var(--accent-dark)] disabled:opacity-50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {cloning ? "Copying trip…" : "Copy Trip to My Account"}
            </button>
            {user ? (
              <Link
                to="/trips"
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold text-[var(--ink)] shadow-xs transition hover:bg-[#f4f7fa]"
              >
                My Trips
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold text-[var(--ink)] shadow-xs transition hover:bg-[#f4f7fa]"
              >
                Log in
              </Link>
            )}
          </div>
        </div>

        {cloneMsg ? (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800 animate-in fade-in duration-200">
            ✓ {cloneMsg} Redirecting to your trip builder…
          </div>
        ) : null}
      </section>

      {/* Stats Section */}
      {trip && !loading && !error ? (
        <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-xs">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Destinations / Stops
            </p>
            <p className="mt-2 text-2xl font-bold text-[var(--ink)]">
              {stops.length} {stops.length === 1 ? "Stop" : "Stops"}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-xs">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Total Activities
            </p>
            <p className="mt-2 text-2xl font-bold text-[var(--ink)]">
              {totalActivities} {totalActivities === 1 ? "Activity" : "Activities"}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-xs">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Est. Total Cost
            </p>
            <p className="mt-2 text-2xl font-bold text-[var(--accent)]">
              {formatActivityCost(totalCost)}
            </p>
          </div>
        </section>
      ) : null}

      {/* Mode Toggle Controls */}
      {trip && !loading && !error ? (
        <section className="mt-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--ink)]">Trip Schedule & Itinerary</h2>
          <div className="flex items-center gap-1 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-1 shadow-xs">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                viewMode === "list"
                  ? "bg-[var(--accent)] text-white shadow-xs"
                  : "text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              List view
            </button>
            <button
              type="button"
              onClick={() => setViewMode("calendar")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                viewMode === "calendar"
                  ? "bg-[var(--accent)] text-white shadow-xs"
                  : "text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              Calendar view
            </button>
          </div>
        </section>
      ) : null}

      {/* Main Content */}
      <section className="mt-6">
        {loading ? (
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--accent)] border-r-transparent align-[-0.125em]" />
            <p className="mt-4 text-sm font-medium text-[var(--muted)]">
              Loading public itinerary…
            </p>
          </div>
        ) : error ? (
          <div
            role="alert"
            className="rounded-2xl border border-[#fecdca] bg-[var(--danger-soft)] p-8 text-center"
          >
            <p className="text-lg font-bold text-[var(--danger)]">Trip Unavailable</p>
            <p className="mt-2 text-sm text-[var(--ink)]">{error}</p>
            <div className="mt-6">
              <Link
                to="/trips"
                className="inline-flex items-center rounded-xl bg-[var(--accent)] px-5 py-2.5 text-xs font-bold text-white shadow-sm"
              >
                Go to Home
              </Link>
            </div>
          </div>
        ) : viewMode === "list" ? (
          <ItineraryListView stops={stops} />
        ) : (
          <ItineraryCalendarView
            stops={stops}
            startDate={trip?.startDate}
            endDate={trip?.endDate}
          />
        )}
      </section>
    </AppLayout>
  );
}
