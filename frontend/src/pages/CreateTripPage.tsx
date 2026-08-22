import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, ArrowLeft, Loader2 } from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import { CoverPreview, TextArea, TextInput } from "../components/FormFields";
import { useAuth } from "../auth/AuthContext";
import { ApiError, createTrip } from "../lib/api";
import { validateCreateTrip } from "../lib/validation";

export function CreateTripPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [coverPhotoUrl, setCoverPhotoUrl] = useState("");
  const [targetBudget, setTargetBudget] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validateCreateTrip({ name, startDate, endDate });
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!token) {
      setError("You must be signed in to create a trip.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const result = await createTrip(token, {
        name: name.trim(),
        description: description.trim() || undefined,
        start_date: startDate,
        end_date: endDate,
        cover_photo_url: coverPhotoUrl.trim() || undefined,
        target_budget: targetBudget.trim() ? Number(targetBudget) : undefined,
      });

      navigate(`/trips/${result.trip.id}/itinerary`, { replace: true });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Unable to create trip. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppLayout>
      <section className="mx-auto max-w-2xl">
        <p className="text-sm font-semibold tracking-[0.18em] text-[var(--accent)] uppercase">
          New trip
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--ink)]">
          Plan a new trip
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          Add the basics now — you&apos;ll build the full itinerary next.
        </p>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-8 space-y-5 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[var(--shadow-card)] sm:p-8"
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
            hint="Optional. Set a budget limit to track estimated activity costs."
            value={targetBudget}
            onChange={setTargetBudget}
            placeholder="e.g. 1500"
            type="number"
          />

          <TextInput
            id="coverPhotoUrl"
            label="Cover photo URL"
            hint="Optional. Paste an image URL for now — file upload coming later."
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
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[var(--accent-dark)] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Plus size={16} /> Save trip
                </>
              )}
            </button>
            <Link
              to="/trips"
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--line)] px-5 py-2.5 text-sm font-semibold text-[var(--ink)] transition-all duration-200 hover:bg-slate-50 hover:shadow-sm"
            >
              <ArrowLeft size={16} /> Cancel
            </Link>
          </div>
        </form>
      </section>
    </AppLayout>
  );
}
