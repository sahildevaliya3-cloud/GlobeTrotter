import type { City } from "../lib/api";

type CityCardProps = {
  city: City;
  adding?: boolean;
  added?: boolean;
  onAdd: (city: City) => void;
};

export function CityCard({ city, adding, added, onAdd }: CityCardProps) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-[0_10px_30px_rgba(19,34,56,0.06)]">
      <div
        className="h-36 bg-cover bg-center"
        style={{
          backgroundImage: city.image_url
            ? `url(${city.image_url})`
            : "linear-gradient(135deg, #1f6f8b 0%, #8fb8c7 55%, #f7f4ee 100%)",
        }}
      />

      <div className="flex flex-1 flex-col p-5">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-[var(--ink)]">{city.name}</h3>
          <p className="mt-1 text-sm text-[var(--accent)]">{city.country}</p>
          <div className="mt-4 space-y-1 text-sm text-[var(--muted)]">
            <p>Cost index: {city.cost_index.toFixed(2)}</p>
            <p>Popularity: {city.popularity_score}/100</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onAdd(city)}
          disabled={adding || added}
          className="mt-5 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--accent-dark)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {added ? "Added to trip" : adding ? "Adding…" : "Add to Trip"}
        </button>
      </div>
    </article>
  );
}
