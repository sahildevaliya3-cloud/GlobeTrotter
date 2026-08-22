import { Link } from "react-router-dom";
import { AppLayout } from "../components/AppLayout";
import { TripCard } from "../components/TripCard";
import { useAuth } from "../auth/AuthContext";
import { useTrips } from "../hooks/useTrips";

const recommendedDestinations = [
  { name: "Paris", country: "France", blurb: "Art, cuisine, and iconic landmarks" },
  { name: "Tokyo", country: "Japan", blurb: "Neon streets and timeless temples" },
  { name: "Barcelona", country: "Spain", blurb: "Gaudi architecture and Mediterranean beaches" },
  { name: "Bali", country: "Indonesia", blurb: "Rice terraces, surf, and wellness retreats" },
];

export function DashboardPage() {
  const { user } = useAuth();
  const { trips, loading, error } = useTrips();
  const recentTrips = trips.slice(0, 3);

  return (
    <AppLayout>
      <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_10px_30px_rgba(19,34,56,0.06)] sm:p-8">
        <p className="text-sm font-semibold tracking-[0.18em] text-[var(--accent)] uppercase">
          Dashboard
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--ink)]">
          Welcome back, {user?.name ?? "traveler"}
        </h1>
        <p className="mt-2 max-w-2xl text-[var(--muted)]">
          Plan your next adventure or pick up where you left off with your
          recent trips.
        </p>
        <Link
          to="/trips/new"
          className="mt-6 inline-flex rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--accent-dark)]"
        >
          Plan New Trip
        </Link>
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-[var(--ink)]">Recent trips</h2>
          {trips.length > 3 ? (
            <Link
              to="/trips"
              className="text-sm font-semibold text-[var(--accent)] underline-offset-2 hover:underline"
            >
              View all
            </Link>
          ) : null}
        </div>

        {loading ? (
          <p className="text-sm text-[var(--muted)]">Loading your trips…</p>
        ) : error ? (
          <div
            role="alert"
            className="rounded-xl border border-[#fecdca] bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]"
          >
            {error}
          </div>
        ) : recentTrips.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--line)] bg-white/60 p-8 text-center">
            <p className="text-[var(--muted)]">
              You haven&apos;t planned any trips yet.
            </p>
            <Link
              to="/trips/new"
              className="mt-4 inline-flex text-sm font-semibold text-[var(--accent)] underline-offset-2 hover:underline"
            >
              Create your first trip
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recentTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-[var(--ink)]">
          Recommended destinations
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Popular picks to inspire your next itinerary.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {recommendedDestinations.map((destination) => (
            <div
              key={destination.name}
              className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_8px_24px_rgba(19,34,56,0.05)]"
            >
              <p className="text-lg font-semibold text-[var(--ink)]">
                {destination.name}
              </p>
              <p className="text-sm text-[var(--accent)]">{destination.country}</p>
              <p className="mt-2 text-sm text-[var(--muted)]">{destination.blurb}</p>
              <span className="mt-4 inline-block rounded-full bg-[#eef4f7] px-3 py-1 text-xs font-medium text-[var(--accent)]">
                Coming soon
              </span>
            </div>
          ))}
        </div>
      </section>
    </AppLayout>
  );
}
