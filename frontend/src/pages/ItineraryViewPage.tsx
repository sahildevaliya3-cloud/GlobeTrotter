import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AppLayout } from "../components/AppLayout";
import { ItineraryCalendarView } from "../components/ItineraryCalendarView";
import { ItineraryListView } from "../components/ItineraryListView";
import { useTripDetail } from "../hooks/useTripDetail";
import { formatActivityCost, formatTripDateRange } from "../lib/api";
import { sortStops } from "../lib/itinerary";

type ViewMode = "list" | "calendar";

export function ItineraryViewPage() {
  const { id: tripId } = useParams();
  const { trip, loading, error, reload } = useTripDetail(tripId);
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const stops = sortStops(trip?.stops ?? []);

  const totalActivities = stops.reduce(
    (acc, stop) => acc + (stop.tripActivities?.length ?? 0),
    0
  );

  const totalCost = stops.reduce((acc, stop) => {
    return (
      acc +
      (stop.tripActivities?.reduce((subAcc, ta) => {
        const val =
          ta.customCost != null && ta.customCost !== ""
            ? Number(ta.customCost)
            : Number(ta.activity?.cost ?? 0);
        return subAcc + (Number.isNaN(val) ? 0 : val);
      }, 0) ?? 0)
    );
  }, 0);

  return (
    <AppLayout>
      <section className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-[var(--accent)] uppercase">
            Itinerary Overview
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--ink)] sm:text-4xl">
            {trip?.name ?? "Trip plan"}
          </h1>
          {trip ? (
            <p className="mt-2 text-base text-[var(--muted)]">
              {formatTripDateRange(trip.startDate, trip.endDate)}
              {trip.description ? ` · ${trip.description}` : ""}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {tripId ? (
            <>
              <Link
                to={`/trips/${tripId}/budget`}
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-5 py-2.5 text-sm font-semibold text-[var(--ink)] shadow-xs transition hover:bg-[#f4f7fa]"
              >
                📊 Budget Breakdown
              </Link>
              <Link
                to={`/trips/${tripId}/itinerary`}
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-5 py-2.5 text-sm font-semibold text-[var(--ink)] shadow-xs transition hover:bg-[#f4f7fa]"
              >
                <svg
                  className="h-4 w-4 text-[var(--accent)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit itinerary
              </Link>
            </>
          ) : null}
          <Link
            to="/trips"
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-5 py-2.5 text-sm font-semibold text-[var(--ink)] shadow-xs transition hover:bg-[#f4f7fa]"
          >
            ← Back to My Trips
          </Link>
        </div>
      </section>

      {/* Summary Cards */}
      {trip && !loading && !error ? (
        <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-xs">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Total Cities / Stops
            </p>
            <p className="mt-2 text-2xl font-bold text-[var(--ink)]">
              {stops.length} {stops.length === 1 ? "Stop" : "Stops"}
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-xs">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Scheduled Activities
            </p>
            <p className="mt-2 text-2xl font-bold text-[var(--ink)]">
              {totalActivities} {totalActivities === 1 ? "Activity" : "Activities"}
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-xs">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Est. Activity Cost
            </p>
            <p className="mt-2 text-2xl font-bold text-[var(--accent)]">
              {formatActivityCost(totalCost)}
            </p>
          </div>
        </section>
      ) : null}

      {/* Toggle View Mode */}
      <section className="mt-8 flex items-center justify-between">
        <div className="inline-flex rounded-xl border border-[var(--line)] bg-[var(--surface)] p-1 shadow-xs">
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={[
              "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition",
              viewMode === "list"
                ? "bg-[var(--accent)] text-white shadow-xs"
                : "text-[var(--muted)] hover:text-[var(--ink)]",
            ].join(" ")}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              />
            </svg>
            List view
          </button>
          <button
            type="button"
            onClick={() => setViewMode("calendar")}
            className={[
              "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition",
              viewMode === "calendar"
                ? "bg-[var(--accent)] text-white shadow-xs"
                : "text-[var(--muted)] hover:text-[var(--ink)]",
            ].join(" ")}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Calendar view
          </button>
        </div>
      </section>

      {/* Main View Content */}
      <section className="mt-8">
        {loading ? (
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--accent)] border-r-transparent align-[-0.125em]" />
            <p className="mt-4 text-sm font-medium text-[var(--muted)]">Loading itinerary details…</p>
          </div>
        ) : error ? (
          <div
            role="alert"
            className="rounded-xl border border-[#fecdca] bg-[var(--danger-soft)] p-6 text-sm text-[var(--danger)]"
          >
            <p className="font-semibold">Unable to load itinerary</p>
            <p className="mt-1">{error}</p>
          </div>
        ) : viewMode === "list" ? (
          <ItineraryListView stops={stops} />
        ) : (
          <ItineraryCalendarView
            stops={stops}
            startDate={trip?.startDate}
            endDate={trip?.endDate}
            onRefresh={reload}
          />
        )}
      </section>
    </AppLayout>
  );
}
