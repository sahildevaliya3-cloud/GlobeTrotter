import { useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "../components/AppLayout";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { TripCard } from "../components/TripCard";
import { ApiError, type Trip } from "../lib/api";
import { useTrips } from "../hooks/useTrips";

export function MyTripsPage() {
  const { trips, loading, error, removeTrip } = useTrips();
  const [tripToDelete, setTripToDelete] = useState<Trip | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleConfirmDelete() {
    if (!tripToDelete) return;

    setDeleting(true);
    setDeleteError(null);

    try {
      await removeTrip(tripToDelete.id);
      setTripToDelete(null);
    } catch (err) {
      setDeleteError(
        err instanceof ApiError
          ? err.message
          : "Unable to delete this trip. Please try again."
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AppLayout>
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold tracking-[0.18em] text-[var(--accent)] uppercase">
            My Trips
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--ink)]">
            Your adventures
          </h1>
          <p className="mt-2 text-[var(--muted)]">
            Manage every trip you&apos;ve planned in one place.
          </p>
        </div>
        <Link
          to="/trips/new"
          className="inline-flex rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--accent-dark)]"
        >
          Plan New Trip
        </Link>
      </section>

      {deleteError ? (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-[#fecdca] bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]"
        >
          {deleteError}
        </div>
      ) : null}

      <section className="mt-8">
        {loading ? (
          <p className="text-sm text-[var(--muted)]">Loading your trips…</p>
        ) : error ? (
          <div
            role="alert"
            className="rounded-xl border border-[#fecdca] bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]"
          >
            {error}
          </div>
        ) : trips.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--line)] bg-white/60 p-10 text-center">
            <p className="text-[var(--muted)]">No trips yet. Start planning one.</p>
            <Link
              to="/trips/new"
              className="mt-4 inline-flex rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--accent-dark)]"
            >
              Plan New Trip
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {trips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                showActions
                onDelete={setTripToDelete}
              />
            ))}
          </div>
        )}
      </section>

      <ConfirmDialog
        open={Boolean(tripToDelete)}
        title="Delete trip?"
        message={
          tripToDelete
            ? `"${tripToDelete.name}" will be permanently deleted along with its stops and activities.`
            : ""
        }
        confirmLabel="Delete trip"
        loading={deleting}
        onCancel={() => {
          if (!deleting) setTripToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </AppLayout>
  );
}
