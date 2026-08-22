export function ItineraryCalendarView() {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--line)] bg-white/60 p-10 text-center">
      <p className="text-lg font-semibold text-[var(--ink)]">Calendar view</p>
      <p className="mt-2 text-[var(--muted)]">
        Calendar mode will be available in a later update. Use list view to see
        your full itinerary grouped by stop and day.
      </p>
    </div>
  );
}
