import { Link } from "react-router-dom";
import { Plus, MapPin, Compass } from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import { TripCard } from "../components/TripCard";
import { EmptyState } from "../components/EmptyState";
import { SkeletonGrid } from "../components/Skeleton";
import { useAuth } from "../auth/AuthContext";
import { useTrips } from "../hooks/useTrips";

const recommendedDestinations = [
  {
    name: "Paris",
    country: "France",
    blurb: "Art, cuisine, and iconic landmarks",
    img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=220&fit=crop",
  },
  {
    name: "Tokyo",
    country: "Japan",
    blurb: "Neon streets and timeless temples",
    img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=220&fit=crop",
  },
  {
    name: "Barcelona",
    country: "Spain",
    blurb: "Gaudí architecture and Mediterranean beaches",
    img: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400&h=220&fit=crop",
  },
  {
    name: "Bali",
    country: "Indonesia",
    blurb: "Rice terraces, surf, and wellness retreats",
    img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=220&fit=crop",
  },
];

export function DashboardPage() {
  const { user } = useAuth();
  const { trips, loading, error } = useTrips();
  const recentTrips = trips.slice(0, 3);

  return (
    <AppLayout>
      {/* Welcome hero */}
      <section className="relative overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-8 shadow-[var(--shadow-card)] sm:p-10">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[var(--accent)]/10 blur-3xl" />
        <p className="text-sm font-semibold tracking-[0.18em] text-[var(--accent)] uppercase">
          Dashboard
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--ink)]">
          Welcome back, {user?.name ?? "traveler"}
        </h1>
        <p className="mt-2 max-w-2xl text-[var(--muted)]">
          Plan your next adventure or pick up where you left off with your
          recent trips.
        </p>
        <Link
          to="/trips/new"
          className="mt-6 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-[var(--accent-dark)] hover:shadow-md"
        >
          <Plus size={16} /> Plan New Trip
        </Link>
      </section>

      {/* Recent trips */}
      <section className="mt-10">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-[var(--ink)]">Recent trips</h2>
          {trips.length > 3 ? (
            <Link
              to="/trips"
              className="text-sm font-semibold text-[var(--accent)] underline-offset-2 transition-colors hover:text-[var(--accent-dark)] hover:underline"
            >
              View all
            </Link>
          ) : null}
        </div>

        {loading ? (
          <SkeletonGrid count={3} />
        ) : error ? (
          <div
            role="alert"
            className="rounded-xl border border-[#fecdca] bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]"
          >
            {error}
          </div>
        ) : recentTrips.length === 0 ? (
          <EmptyState
            icon={Compass}
            title="No trips yet"
            description="You haven't planned any trips yet. Start your first adventure!"
            ctaLabel="Plan your first trip"
            ctaHref="/trips/new"
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recentTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </section>

      {/* Recommended destinations */}
      <section className="mt-10">
        <h2 className="text-xl font-bold text-[var(--ink)]">
          Recommended destinations
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Popular picks to inspire your next itinerary.
        </p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {recommendedDestinations.map((dest) => (
            <div
              key={dest.name}
              className="card-hover overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-card)]"
            >
              <div className="relative h-32 overflow-hidden">
                <img
                  src={dest.img}
                  alt={dest.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-3">
                  <p className="text-sm font-bold text-white drop-shadow-sm">
                    {dest.name}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-white/90">
                    <MapPin size={11} /> {dest.country}
                  </p>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-[var(--muted)]">{dest.blurb}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </AppLayout>
  );
}
