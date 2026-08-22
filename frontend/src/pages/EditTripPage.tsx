import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { AppLayout } from "../components/AppLayout";
import { CoverPreview, TextArea, TextInput } from "../components/FormFields";
import { useTripDetail } from "../hooks/useTripDetail";
import { ApiError, toDateInputValue, updateTrip } from "../lib/api";
import { validateCreateTrip } from "../lib/validation";

export function EditTripPage() {
  const { id: tripId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { trip, loading: loadingTrip, error: loadError } = useTripDetail(tripId);

  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [coverPhotoUrl, setCoverPhotoUrl] = useState("");
  const [targetBudget, setTargetBudget] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (trip) {
      setName(trip.name ?? "");
      setStartDate(trip.startDate ? toDateInputValue(trip.startDate) : "");
      setEndDate(trip.endDate ? toDateInputValue(trip.endDate) : "");
      setDescription(trip.description ?? "");
      setCoverPhotoUrl(trip.coverPhotoUrl ?? "");
      setTargetBudget(
        trip.targetBudget != null
          ? String(trip.targetBudget)
          : trip.target_budget != null
          ? String(trip.target_budget)
          : ""
      );
    }
  }, [trip]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validateCreateTrip({ name, startDate, endDate });
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!token || !tripId) {
      setError("Unable to update trip.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await updateTrip(token, tripId, {
        name: name.trim(),
        description: description.trim() || undefined,
        start_date: startDate,
        end_date: endDate,
        cover_photo_url: coverPhotoUrl.trim() || undefined,
        target_budget: targetBudget.trim() ? Number(targetBudget) : null,
      });

      navigate(`/trips/${tripId}/budget`);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Unable to update trip. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingTrip) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm text-[var(--muted)]">Loading trip details…</p>
        </div>
      </AppLayout>
    );
  }

  if (loadError || !trip) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-2xl rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-8 text-center">
          <h1 className="text-xl font-semibold text-[var(--ink)]">Trip not found</h1>
          <p className="mt-2 text-sm text-[var(--danger)]">{loadError ?? "Trip does not exist."}</p>
          <Link
            to="/trips"
            className="mt-6 inline-flex rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
          >
            Back to My Trips
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <section className="mx-auto max-w-2xl">
        <p className="text-xs font-bold tracking-[0.2em] text-[var(--accent)] uppercase">
          Edit Trip
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--ink)]">
          {trip.name}
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Update trip basic details and target budget.
        </p>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-8 space-y-5 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_10px_30px_rgba(19,34,56,0.06)] sm:p-8"
        >
          <TextInput
            id="name"
            label="Trip name"
            value={name}
            onChange={setName}
            placeholder="European Summer 2026"
            required
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <TextInput
              id="startDate"
              label="Start date"
              type="date"
              value={startDate}
              onChange={setStartDate}
              required
            />
            <TextInput
              id="endDate"
              label="End date"
              type="date"
              value={endDate}
              onChange={setEndDate}
              required
            />
          </div>

          <TextArea
            id="description"
            label="Description"
            value={description}
            onChange={setDescription}
            placeholder="What kind of trip is this? Cities, vibes, must-sees..."
          />

          <TextInput
            id="targetBudget"
            label="Target budget ($)"
            hint="Set or update your budget limit for this trip."
            value={targetBudget}
            onChange={setTargetBudget}
            placeholder="e.g. 1500"
            type="number"
          />

          <TextInput
            id="coverPhotoUrl"
            label="Cover photo URL"
            value={coverPhotoUrl}
            onChange={setCoverPhotoUrl}
            placeholder="https://images.unsplash.com/photo-..."
            type="url"
          />

          <CoverPreview url={coverPhotoUrl} />

          {error ? (
            <div
              role="alert"
              className="rounded-xl border border-[#fecdca] bg-[var(--danger-soft)] px-3.5 py-3 text-sm text-[var(--danger)]"
            >
              {error}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--accent-dark)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? "Saving…" : "Save changes"}
            </button>
            <Link
              to={`/trips/${tripId}/budget`}
              className="rounded-xl border border-[var(--line)] px-5 py-2.5 text-sm font-semibold text-[var(--ink)] transition hover:bg-[#f4f7fa]"
            >
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </AppLayout>
  );
}
