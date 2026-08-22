import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { AppLayout } from "../components/AppLayout";
import { ItineraryCalendarView } from "../components/ItineraryCalendarView";
import { ItineraryListView } from "../components/ItineraryListView";
import { useTripDetail } from "../hooks/useTripDetail";
import { formatActivityCost, formatTripDateRange, toggleTripShare } from "../lib/api";
import { sortStops } from "../lib/itinerary";

type ViewMode = "list" | "calendar";

export function ItineraryViewPage() {
  const { id: tripId } = useParams();
  const { token } = useAuth();
  const { trip, loading, error, reload, setTrip } = useTripDetail(tripId);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [togglingShare, setTogglingShare] = useState(false);

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

  const publicUrl = trip?.shareSlug
    ? `${window.location.origin}/share/${trip.shareSlug}`
    : "";

  async function handleToggleShare() {
    if (!token || !tripId) return;

    setTogglingShare(true);
    try {
      const res = await toggleTripShare(token, tripId, !trip?.isPublic);
      setTrip((prev) =>
        prev
          ? {
              ...prev,
              isPublic: res.isPublic,
              shareSlug: res.shareSlug,
            }
          : null
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to toggle trip share status.");
    } finally {
      setTogglingShare(false);
    }
  }

  function handleCopyUrl() {
    if (!publicUrl) return;
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

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

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
          {trip ? (
            <>
              <button
                type="button"
                onClick={() => setShowShareModal(true)}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 text-xs font-bold text-[var(--ink)] shadow-xs transition hover:bg-[#f4f7fa]"
              >
                <svg className="h-4 w-4 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 107.032-2.146M17 19a3 3 0 100-6 3 3 0 000 6z" />
                </svg>
                Share
                {trip.isPublic ? (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    Public
                  </span>
                ) : null}
              </button>

              <Link
                to={`/trips/${tripId}/budget`}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 text-xs font-bold text-[var(--ink)] shadow-xs transition hover:bg-[#f4f7fa]"
              >
                <svg className="h-4 w-4 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Budget
              </Link>
              <Link
                to={`/trips/${tripId}/itinerary`}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 text-xs font-bold text-[var(--ink)] shadow-xs transition hover:bg-[#f4f7fa]"
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
                Edit Trip
              </Link>
            </>
          ) : null}
          <Link
            to="/trips"
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 text-xs font-bold text-[var(--ink)] shadow-xs transition hover:bg-[#f4f7fa]"
          >
            ← My Trips
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

      {/* Share Modal */}
      {showShareModal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <header className="flex items-center justify-between border-b border-[var(--line)] bg-[#f7fafb] px-6 py-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
                  Share Trip Itinerary
                </span>
                <h3 className="text-lg font-bold text-[var(--ink)]">
                  {trip?.name ?? "Trip"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-[#e2e8f0] hover:text-[var(--ink)]"
              >
                ✕
              </button>
            </header>

            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--line)] bg-[#f8fafc] p-4">
                <div>
                  <p className="text-sm font-bold text-[var(--ink)]">
                    Public Link Access
                  </p>
                  <p className="text-xs text-[var(--muted)]">
                    {trip?.isPublic
                      ? "Anyone with the link can view a read-only version of this trip."
                      : "Only you can view this trip right now."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleToggleShare}
                  disabled={togglingShare}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    trip?.isPublic ? "bg-[var(--accent)]" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      trip?.isPublic ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {trip?.isPublic && publicUrl ? (
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                    Public Share URL
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={publicUrl}
                      className="w-full rounded-xl border border-[var(--line)] bg-[#f1f5f9] px-3.5 py-2 text-xs font-mono text-[var(--ink)] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleCopyUrl}
                      className="shrink-0 rounded-xl bg-[var(--accent)] px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[var(--accent-dark)]"
                    >
                      {copied ? "✓ Copied!" : "Copy Link"}
                    </button>
                  </div>
                  <p className="text-[11px] text-[var(--muted)]">
                    Tip: Viewers will see your itinerary and can optionally clone it to their account.
                  </p>
                </div>
              ) : null}
            </div>

            <footer className="border-t border-[var(--line)] bg-[#f8fafc] px-6 py-3.5 text-right">
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="rounded-xl border border-[var(--line)] px-4 py-2 text-xs font-bold text-[var(--ink)] transition hover:bg-[#e2e8f0]"
              >
                Close
              </button>
            </footer>
          </div>
        </div>
      ) : null}
    </AppLayout>
  );
}
