import {
  formatDisplayDate,
  formatScheduledTime,
  formatTripDateRange,
  getTripActivityCost,
  getTripActivityDuration,
  type Stop,
} from "../lib/api";
import { groupActivitiesByDate } from "../lib/itinerary";

type ItineraryListViewProps = {
  stops: Stop[];
};

export function ItineraryListView({ stops }: ItineraryListViewProps) {
  if (stops.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--line)] bg-white/60 p-12 text-center">
        <p className="text-base font-medium text-[var(--ink)]">No stops added yet</p>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Add cities and schedule activities in the itinerary builder to see them here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {stops.map((stop, stopIndex) => {
        const dayGroups = groupActivitiesByDate(stop.tripActivities);
        const cityImage = stop.city?.imageUrl;

        return (
          <section
            key={stop.id}
            className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-[0_10px_30px_rgba(19,34,56,0.06)] transition hover:shadow-[0_15px_35px_rgba(19,34,56,0.09)]"
          >
            {/* Section Header */}
            <header className="relative border-b border-[var(--line)] bg-[#f7fafb] p-6 sm:p-8">
              {cityImage ? (
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-multiply"
                  style={{ backgroundImage: `url(${cityImage})` }}
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex items-center rounded-full bg-[var(--accent)]/10 px-3 py-1 text-xs font-semibold text-[var(--accent)]">
                      Stop {stopIndex + 1}
                    </span>
                    {stop.city?.country ? (
                      <span className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
                        {stop.city.country}
                      </span>
                    ) : null}
                  </div>
                  <h2 className="mt-2 text-2xl font-bold text-[var(--ink)] sm:text-3xl">
                    {stop.city?.name ?? "Unknown city"}
                  </h2>
                </div>

                <div className="inline-flex items-center gap-2 rounded-xl border border-[var(--line)] bg-white/80 px-4 py-2 text-sm font-semibold text-[var(--ink)] backdrop-blur-sm shadow-sm">
                  <svg
                    className="h-4 w-4 text-[var(--accent)]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span>{formatTripDateRange(stop.startDate, stop.endDate)}</span>
                </div>
              </div>
            </header>

            {/* Activities grouped day-wise */}
            <div className="p-6 sm:p-8">
              {dayGroups.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[var(--line)] p-6 text-center text-sm text-[var(--muted)]">
                  No activities scheduled for this stop yet.
                </div>
              ) : (
                <div className="space-y-8">
                  {dayGroups.map(([dateKey, activities]) => (
                    <div key={dateKey} className="relative">
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full bg-[var(--accent)]" />
                        <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--accent)]">
                          {formatDisplayDate(dateKey)}
                        </h3>
                        <div className="h-px flex-1 bg-[var(--line)]" />
                      </div>

                      <ul className="mt-4 space-y-3 pl-1 sm:pl-4">
                        {activities.map((tripActivity) => {
                          const duration = getTripActivityDuration(tripActivity);
                          const costText = getTripActivityCost(tripActivity);
                          const isCustomCost =
                            tripActivity.customCost != null &&
                            tripActivity.customCost !== "";

                          return (
                            <li
                              key={tripActivity.id}
                              className="group flex flex-col justify-between gap-3 rounded-xl border border-[var(--line)] bg-white p-4 transition-all hover:border-[var(--accent)]/40 hover:shadow-md sm:flex-row sm:items-center"
                            >
                              <div className="flex items-start gap-3.5">
                                {tripActivity.activity?.imageUrl ? (
                                  <img
                                    src={tripActivity.activity.imageUrl}
                                    alt={tripActivity.activity.name}
                                    className="h-12 w-12 rounded-lg object-cover shadow-sm"
                                  />
                                ) : null}
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-semibold text-[var(--ink)]">
                                      {tripActivity.activity?.name ?? "Activity"}
                                    </span>
                                    {tripActivity.activity?.category ? (
                                      <span className="inline-flex items-center rounded-md bg-[#f0f4f8] px-2 py-0.5 text-[11px] font-medium capitalize text-[var(--accent)]">
                                        {tripActivity.activity.category}
                                      </span>
                                    ) : null}
                                  </div>
                                  {tripActivity.activity?.description ? (
                                    <p className="mt-1 line-clamp-1 text-xs text-[var(--muted)]">
                                      {tripActivity.activity.description}
                                    </p>
                                  ) : null}
                                </div>
                              </div>

                              <div className="flex items-center justify-between gap-4 border-t border-[var(--line)] pt-2.5 sm:border-t-0 sm:pt-0 sm:justify-end">
                                <div className="flex items-center gap-3 text-xs font-medium text-[var(--muted)]">
                                  <span className="inline-flex items-center gap-1 rounded-md bg-[#f4f7fa] px-2.5 py-1 text-[var(--ink)]">
                                    <svg
                                      className="h-3.5 w-3.5 text-[var(--accent)]"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                    {formatScheduledTime(tripActivity.scheduledTime)}
                                  </span>

                                  {duration ? (
                                    <span className="inline-flex items-center gap-1 text-[var(--muted)]">
                                      ⏱ {duration}
                                    </span>
                                  ) : null}
                                </div>

                                <div className="text-right">
                                  <span className="text-sm font-bold text-[var(--ink)]">
                                    {costText}
                                  </span>
                                  {isCustomCost ? (
                                    <span className="ml-1 text-[10px] text-[var(--muted)]">
                                      (custom)
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}

