import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Plus, Eye, ArrowLeft, MapPin } from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { StopCard } from "../components/StopCard";
import { EmptyState } from "../components/EmptyState";
import { SkeletonList } from "../components/Skeleton";
import { useAuth } from "../auth/AuthContext";
import { useTripDetail } from "../hooks/useTripDetail";
import {
  ApiError,
  deleteStop,
  formatTripDateRange,
  updateStop,
  type Stop,
} from "../lib/api";

export function ItineraryBuilderPage() {
  const { id: tripId } = useParams();
  const { token } = useAuth();
  const { trip, loading, error, reload } = useTripDetail(tripId);
  const [actionError, setActionError] = useState<string | null>(null);
  const [savingStopId, setSavingStopId] = useState<string | null>(null);
  const [stopToDelete, setStopToDelete] = useState<Stop | null>(null);
  const [deleting, setDeleting] = useState(false);

  const stops = [...(trip?.stops ?? [])].sort(
    (a, b) => a.orderIndex - b.orderIndex
  );

  async function handleSaveDates(
    stopId: string,
    startDate: string,
    endDate: string
  ) {
    if (!token) return;

    setSavingStopId(stopId);
    setActionError(null);

    try {
      await updateStop(token, stopId, {
        start_date: startDate,
        end_date: endDate,
      });
      await reload();
    } catch (err) {
      setActionError(
        err instanceof ApiError
          ? err.message
          : "Unable to update stop dates. Please try again."
      );
    } finally {
      setSavingStopId(null);
    }
  }

  async function swapStopOrder(current: Stop, neighbor: Stop) {
    if (!token) return;

    setSavingStopId(current.id);
    setActionError(null);

    try {
      await updateStop(token, current.id, {
        order_index: neighbor.orderIndex,
      });
      await updateStop(token, neighbor.id, {
        order_index: current.orderIndex,
      });
      await reload();
    } catch (err) {
      setActionError(
        err instanceof ApiError
          ? err.message
          : "Unable to reorder stops. Please try again."
      );
    } finally {
      setSavingStopId(null);
    }
  }

  function handleMoveUp(stop: Stop) {
    const index = stops.findIndex((item) => item.id === stop.id);
    if (index <= 0) return;
    swapStopOrder(stop, stops[index - 1]);
  }

  function handleMoveDown(stop: Stop) {
    const index = stops.findIndex((item) => item.id === stop.id);
    if (index < 0 || index >= stops.length - 1) return;
    swapStopOrder(stop, stops[index + 1]);
  }

  async function handleConfirmDelete() {
    if (!token || !stopToDelete) return;

    setDeleting(true);
    setActionError(null);

    try {
      await deleteStop(token, stopToDelete.id);
      setStopToDelete(null);
      await reload();
    } catch (err) {
      setActionError(
        err instanceof ApiError
          ? err.message
          : "Unable to remove this stop. Please try again."
      );
    } finally {
      setDeleting(false);
    }
  }

  if (!tripId) {
    return (
      <AppLayout>
        <p className="text-[var(--danger)]">Trip not found.</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold tracking-[0.18em] text-[var(--accent)] uppercase">
            Itinerary Builder
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--ink)]">
            {trip?.name ?? "Loading trip…"}
          </h1>
          {trip ? (
            <p className="mt-2 text-[var(--muted)]">
              {formatTripDateRange(trip.startDate, trip.endDate)}
              {trip.description ? ` · ${trip.description}` : ""}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to={`/trips/${tripId}/cities`}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[var(--accent-dark)] hover:shadow-md"
          >
            <Plus size={16} /> Add Stop
          </Link>
          <Link
            to={`/trips/${tripId}/view`}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--line)] px-5 py-2.5 text-sm font-semibold text-[var(--ink)] transition-all duration-200 hover:bg-slate-50 hover:shadow-sm"
          >
            <Eye size={16} /> View plan
          </Link>
          <Link
            to="/trips"
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--line)] px-5 py-2.5 text-sm font-semibold text-[var(--ink)] transition-all duration-200 hover:bg-slate-50 hover:shadow-sm"
          >
            <ArrowLeft size={16} /> My Trips
          </Link>
        </div>
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
        {loading ? (
          <SkeletonList count={2} />
        ) : error ? (
          <div
            role="alert"
            className="rounded-xl border border-[#fecdca] bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]"
          >
            {error}
          </div>
        ) : stops.length === 0 ? (
          <EmptyState
            icon={MapPin}
            title="No stops yet"
            description="Add your first city to begin building the itinerary."
            ctaLabel="Add your first stop"
            ctaHref={`/trips/${tripId}/cities`}
          />
        ) : (
          <div className="space-y-5">
            {stops.map((stop, index) => (
              <StopCard
                key={stop.id}
                stop={stop}
                tripId={tripId}
                index={index}
                total={stops.length}
                saving={savingStopId === stop.id}
                onSaveDates={handleSaveDates}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                onRemove={setStopToDelete}
              />
            ))}
          </div>
        )}
      </section>

      <ConfirmDialog
        open={Boolean(stopToDelete)}
        title="Remove stop?"
        message={
          stopToDelete
            ? `Remove ${stopToDelete.city?.name ?? "this city"} from your itinerary? Scheduled activities for this stop will also be deleted.`
            : ""
        }
        confirmLabel="Remove stop"
        loading={deleting}
        onCancel={() => {
          if (!deleting) setStopToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </AppLayout>
  );
}
