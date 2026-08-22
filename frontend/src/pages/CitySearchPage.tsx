import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Search, ArrowLeft, MapPin } from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import { CityCard } from "../components/CityCard";
import { EmptyState } from "../components/EmptyState";
import { SkeletonGrid } from "../components/Skeleton";
import { useAuth } from "../auth/AuthContext";
import { addStopToTrip, ApiError, searchCities, type City } from "../lib/api";

export function CitySearchPage() {
  const { id: tripId } = useParams();
  const { token } = useAuth();
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("");
  const [cities, setCities] = useState<City[]>([]);
  const [allCountries, setAllCountries] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingCityId, setAddingCityId] = useState<string | null>(null);
  const [addedCityIds, setAddedCityIds] = useState<Set<string>>(new Set());
  const [actionError, setActionError] = useState<string | null>(null);

  const loadCities = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const result = await searchCities(token, { search, country });
      setCities(result.cities);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Unable to load cities. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [token, search, country]);

  useEffect(() => {
    if (!token) return;

    searchCities(token)
      .then((result) => {
        const countries = [...new Set(result.cities.map((city) => city.country))].sort();
        setAllCountries(countries);
      })
      .catch(() => {
        setAllCountries([]);
      });
  }, [token]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadCities();
    }, 250);

    return () => window.clearTimeout(timer);
  }, [loadCities]);

  const resultSummary = useMemo(() => {
    if (loading) return "Searching cities…";
    return `${cities.length} ${cities.length === 1 ? "city" : "cities"} found`;
  }, [cities.length, loading]);

  async function handleAddCity(city: City) {
    if (!token || !tripId) return;

    setAddingCityId(city.id);
    setActionError(null);

    try {
      await addStopToTrip(token, tripId, city.id);
      setAddedCityIds((current) => new Set(current).add(city.id));
    } catch (err) {
      setActionError(
        err instanceof ApiError
          ? err.message
          : "Unable to add this city. Please try again."
      );
    } finally {
      setAddingCityId(null);
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
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold tracking-[0.18em] text-[var(--accent)] uppercase">
            City Search
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--ink)]">
            Find destinations
          </h1>
          <p className="mt-2 text-[var(--muted)]">
            Search the catalog and add cities to your itinerary.
          </p>
        </div>
        <Link
          to={`/trips/${tripId}/itinerary`}
          className="inline-flex items-center gap-2 rounded-xl border border-[var(--line)] px-5 py-2.5 text-sm font-semibold text-[var(--ink)] transition-all duration-200 hover:bg-slate-50 hover:shadow-sm"
        >
          <ArrowLeft size={16} /> Back to Itinerary
        </Link>
      </section>

      <section className="mt-8 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[var(--shadow-card)]">
        <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-[var(--ink)]">Search</span>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by city name…"
                className="input-base !pl-9"
              />
            </div>
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-[var(--ink)]">Country</span>
            <select
              value={country}
              onChange={(event) => setCountry(event.target.value)}
              className="input-base"
            >
              <option value="">All countries</option>
              {allCountries.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        <p className="mt-4 text-sm text-[var(--muted)]">{resultSummary}</p>
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
        {error ? (
          <div
            role="alert"
            className="rounded-xl border border-[#fecdca] bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]"
          >
            {error}
          </div>
        ) : loading ? (
          <SkeletonGrid count={6} />
        ) : cities.length === 0 ? (
          <EmptyState
            icon={MapPin}
            title="No cities found"
            description="No cities match your filters. Try a different search."
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {cities.map((city) => (
              <CityCard
                key={city.id}
                city={city}
                adding={addingCityId === city.id}
                added={addedCityIds.has(city.id)}
                onAdd={handleAddCity}
              />
            ))}
          </div>
        )}
      </section>
    </AppLayout>
  );
}
