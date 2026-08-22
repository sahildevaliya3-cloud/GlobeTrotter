import { Link, useParams } from "react-router-dom";
import { AppLayout } from "../components/AppLayout";

export function ItineraryBuilderPage() {
  const { id } = useParams();

  return (
    <AppLayout>
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-8 shadow-[0_10px_30px_rgba(19,34,56,0.06)]">
        <p className="text-sm font-semibold tracking-[0.18em] text-[var(--accent)] uppercase">
          Itinerary Builder
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-[var(--ink)]">
          Build your itinerary
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          Your trip was created successfully. Add stops, cities, and activities
          here in the next step.
        </p>
        {id ? (
          <p className="mt-4 text-sm text-[var(--muted)]">Trip ID: {id}</p>
        ) : null}
        <Link
          to="/trips"
          className="mt-6 inline-flex text-sm font-semibold text-[var(--accent)] underline-offset-2 hover:underline"
        >
          Back to My Trips
        </Link>
      </div>
    </AppLayout>
  );
}
