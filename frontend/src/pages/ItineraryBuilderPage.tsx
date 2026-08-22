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
          Add cities to your trip, then schedule activities for each stop.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          {id ? (
            <Link
              to={`/trips/${id}/cities`}
              className="inline-flex rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--accent-dark)]"
            >
              Search &amp; Add Cities
            </Link>
          ) : null}
          <Link
            to="/trips"
            className="inline-flex rounded-xl border border-[var(--line)] px-5 py-2.5 text-sm font-semibold text-[var(--ink)] transition hover:bg-[#f4f7fa]"
          >
            Back to My Trips
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
