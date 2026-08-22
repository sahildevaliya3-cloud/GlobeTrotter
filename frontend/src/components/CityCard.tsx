import { MapPin, Star } from "lucide-react";
import type { City } from "../lib/api";

type CityCardProps = {
  city: City;
  adding?: boolean;
  added?: boolean;
  onAdd: (city: City) => void;
};

const CITY_FALLBACKS = [
  "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&h=300&fit=crop",
  "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&h=300&fit=crop",
  "https://images.unsplash.com/photo-1543785734-4b6e564642f8?w=600&h=300&fit=crop",
  "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=600&h=300&fit=crop",
];

function getCityImage(city: City) {
  if (city.image_url) return city.image_url;
  const idx =
    city.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) %
    CITY_FALLBACKS.length;
  return CITY_FALLBACKS[idx];
}

export function CityCard({ city, adding, added, onAdd }: CityCardProps) {
  return (
    <article className="card-hover flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
      {/* City image */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={getCityImage(city)}
          alt={city.name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="text-lg font-bold text-white drop-shadow-sm">
            {city.name}
          </h3>
          <p className="flex items-center gap-1 text-sm text-white/90">
            <MapPin size={13} /> {city.country}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex-1">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent-light)] px-2.5 py-1 text-xs font-semibold text-[var(--accent)]">
              Cost: {city.cost_index.toFixed(1)}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-[var(--amber)]">
              <Star size={12} fill="currentColor" /> {city.popularity_score}/100
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onAdd(city)}
          disabled={adding || added}
          className="mt-5 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[var(--accent-dark)] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
        >
          {added ? "✓ Added to trip" : adding ? "Adding…" : "Add to Trip"}
        </button>
      </div>
    </article>
  );
}
