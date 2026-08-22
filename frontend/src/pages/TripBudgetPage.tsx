import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useAuth } from "../auth/AuthContext";
import { AppLayout } from "../components/AppLayout";
import { useTripDetail } from "../hooks/useTripDetail";
import {
  formatActivityCost,
  formatTripDateRange,
  getTripBudget,
  type TripBudget,
} from "../lib/api";

const CATEGORY_COLORS: Record<string, string> = {
  sightseeing: "#0284c7",
  food: "#f59e0b",
  adventure: "#10b981",
  culture: "#8b5cf6",
  relaxation: "#ec4899",
  other: "#64748b",
};

const DEFAULT_COLOR = "#3b82f6";

function getCategoryColor(category: string, index: number) {
  const normalized = category.toLowerCase().trim();
  if (CATEGORY_COLORS[normalized]) {
    return CATEGORY_COLORS[normalized];
  }
  const fallbackColors = ["#06b6d4", "#f97316", "#a855f7", "#14b8a6", "#6366f1"];
  return fallbackColors[index % fallbackColors.length] || DEFAULT_COLOR;
}

export function TripBudgetPage() {
  const { id: tripId } = useParams();
  const { token } = useAuth();
  const { trip } = useTripDetail(tripId);

  const [budgetData, setBudgetData] = useState<TripBudget | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !tripId) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    getTripBudget(token, tripId)
      .then((res) => {
        if (isMounted) {
          setBudgetData(res.budget);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Failed to load budget breakdown."
          );
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token, tripId]);

  const pieChartData =
    budgetData?.categoryBreakdown.map((item, idx) => ({
      name: item.category.charAt(0).toUpperCase() + item.category.slice(1),
      value: item.cost,
      percentage: item.percentage,
      color: getCategoryColor(item.category, idx),
    })) ?? [];

  const targetBudget = budgetData?.targetBudget ?? null;
  const totalCost = budgetData?.totalCost ?? 0;
  const isOverBudget = budgetData?.isOverBudget ?? false;
  const budgetRatio =
    targetBudget && targetBudget > 0
      ? Math.min(100, Math.round((totalCost / targetBudget) * 100))
      : 0;

  return (
    <AppLayout>
      {/* Header section */}
      <section className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-[0.2em] text-[var(--accent)] uppercase">
              Budget & Cost Breakdown
            </span>
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--ink)] sm:text-4xl">
            {trip?.name ?? "Trip Budget"}
          </h1>
          {trip ? (
            <p className="mt-2 text-base text-[var(--muted)]">
              {formatTripDateRange(trip.startDate, trip.endDate)}
              {trip.description ? ` · ${trip.description}` : ""}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {tripId ? (
            <>
              <Link
                to={`/trips/${tripId}/view`}
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold text-[var(--ink)] shadow-xs transition hover:bg-[#f4f7fa]"
              >
                👁 Itinerary View
              </Link>
              <Link
                to={`/trips/${tripId}/edit`}
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold text-[var(--ink)] shadow-xs transition hover:bg-[#f4f7fa]"
              >
                ✏️ Edit Budget / Trip
              </Link>
            </>
          ) : null}
          <Link
            to="/trips"
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold text-[var(--ink)] shadow-xs transition hover:bg-[#f4f7fa]"
          >
            ← My Trips
          </Link>
        </div>
      </section>

      {loading ? (
        <div className="mt-8 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-12 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--accent)] border-r-transparent align-[-0.125em]" />
          <p className="mt-4 text-sm font-medium text-[var(--muted)]">Calculating budget & costs…</p>
        </div>
      ) : error ? (
        <div
          role="alert"
          className="mt-8 rounded-xl border border-[#fecdca] bg-[var(--danger-soft)] p-6 text-sm text-[var(--danger)]"
        >
          <p className="font-semibold">Unable to calculate budget</p>
          <p className="mt-1">{error}</p>
        </div>
      ) : (
        <>
          {/* Over budget Banner / Status indicator */}
          {targetBudget != null ? (
            <section className="mt-6">
              {isOverBudget ? (
                <div
                  role="alert"
                  className="flex flex-col gap-4 rounded-2xl border border-red-200 bg-red-50 p-6 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-2xl">
                      ⚠️
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-red-900">
                        Over Budget Notice
                      </h2>
                      <p className="mt-1 text-sm text-red-700">
                        Total estimated activity cost (
                        <strong className="font-semibold">
                          {formatActivityCost(totalCost)}
                        </strong>
                        ) exceeds your target budget of{" "}
                        <strong className="font-semibold">
                          {formatActivityCost(targetBudget)}
                        </strong>{" "}
                        by{" "}
                        <strong className="font-bold text-red-800">
                          {formatActivityCost(totalCost - targetBudget)}
                        </strong>
                        .
                      </p>
                    </div>
                  </div>
                  {tripId ? (
                    <Link
                      to={`/trips/${tripId}/edit`}
                      className="inline-flex shrink-0 items-center justify-center rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-red-700"
                    >
                      Adjust target budget
                    </Link>
                  ) : null}
                </div>
              ) : (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-xl text-emerald-800">
                        ✓
                      </span>
                      <div>
                        <p className="text-base font-bold text-emerald-900">
                          Within Target Budget
                        </p>
                        <p className="text-xs font-medium text-emerald-700">
                          {formatActivityCost(totalCost)} spent of{" "}
                          {formatActivityCost(targetBudget)} target budget (
                          {formatActivityCost(targetBudget - totalCost)} remaining)
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-emerald-200/80 px-3 py-1 text-xs font-bold text-emerald-800">
                      {budgetRatio}% of budget used
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-emerald-200/60">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${budgetRatio}%` }}
                    />
                  </div>
                </div>
              )}
            </section>
          ) : (
            <section className="mt-6 rounded-2xl border border-dashed border-[var(--line)] bg-[var(--surface)] p-6 text-center sm:p-8">
              <p className="text-base font-semibold text-[var(--ink)]">
                No target budget set for this trip
              </p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Set a target budget to track expenses and receive over-budget warnings.
              </p>
              {tripId ? (
                <Link
                  to={`/trips/${tripId}/edit`}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-dark)]"
                >
                  Set Target Budget
                </Link>
              ) : null}
            </section>
          )}

          {/* Top Metric Cards */}
          <section className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="relative overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-xs">
              <p className="text-xs font-bold tracking-wider text-[var(--muted)] uppercase">
                Total Estimated Cost
              </p>
              <p className="mt-3 text-4xl font-extrabold tracking-tight text-[var(--accent)]">
                {formatActivityCost(totalCost)}
              </p>
              <p className="mt-2 text-xs text-[var(--muted)]">
                Across all scheduled activities
              </p>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-xs">
              <p className="text-xs font-bold tracking-wider text-[var(--muted)] uppercase">
                Average Cost Per Day
              </p>
              <p className="mt-3 text-3xl font-bold tracking-tight text-[var(--ink)]">
                {formatActivityCost(budgetData?.averageCostPerDay ?? 0)}
              </p>
              <p className="mt-2 text-xs text-[var(--muted)]">
                Over {budgetData?.numberOfDays ?? 1}{" "}
                {budgetData?.numberOfDays === 1 ? "day" : "days"} in trip
              </p>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-xs">
              <p className="text-xs font-bold tracking-wider text-[var(--muted)] uppercase">
                Target Budget Status
              </p>
              <p className="mt-3 text-3xl font-bold tracking-tight text-[var(--ink)]">
                {targetBudget != null ? formatActivityCost(targetBudget) : "Not set"}
              </p>
              <p className="mt-2 text-xs font-semibold">
                {targetBudget == null ? (
                  <span className="text-[var(--muted)]">No limit configured</span>
                ) : isOverBudget ? (
                  <span className="text-red-600 font-bold">⚠️ Over budget</span>
                ) : (
                  <span className="text-emerald-600 font-bold">✓ On track</span>
                )}
              </p>
            </div>
          </section>

          {/* Breakdown Section: Pie Chart & Category Table */}
          <section className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Pie Chart Card */}
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-xs">
              <h2 className="text-lg font-bold text-[var(--ink)]">
                Cost Breakdown by Category
              </h2>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Distribution of expenses across activity categories
              </p>

              {pieChartData.length === 0 ? (
                <div className="mt-12 flex h-64 items-center justify-center rounded-xl border border-dashed border-[var(--line)] p-6 text-center text-sm text-[var(--muted)]">
                  No activities scheduled to display chart.
                </div>
              ) : (
                <div className="mt-6 h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={95}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pieChartData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [
                          formatActivityCost(Number(value) || 0),
                          "Cost",
                        ]}
                      />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Category Table */}
            <div className="flex flex-col justify-between rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-xs">
              <div>
                <h2 className="text-lg font-bold text-[var(--ink)]">
                  Category Breakdown Summary
                </h2>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Detailed category costs and share of total
                </p>

                {budgetData?.categoryBreakdown.length === 0 ? (
                  <div className="mt-12 text-center text-sm text-[var(--muted)]">
                    No activities assigned yet.
                  </div>
                ) : (
                  <div className="mt-6 overflow-hidden rounded-xl border border-[var(--line)]">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-[#f7fafb] text-xs uppercase font-semibold text-[var(--muted)] border-b border-[var(--line)]">
                        <tr>
                          <th className="px-4 py-3">Category</th>
                          <th className="px-4 py-3 text-right">Cost</th>
                          <th className="px-4 py-3 text-right">Share</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--line)]">
                        {budgetData?.categoryBreakdown.map((item, idx) => {
                          const color = getCategoryColor(item.category, idx);
                          return (
                            <tr key={item.category} className="hover:bg-[#fcfdfe]">
                              <td className="px-4 py-3.5 font-medium text-[var(--ink)] capitalize">
                                <span className="flex items-center gap-2">
                                  <span
                                    className="h-3 w-3 rounded-full"
                                    style={{ backgroundColor: color }}
                                  />
                                  {item.category}
                                </span>
                              </td>
                              <td className="px-4 py-3.5 text-right font-bold text-[var(--ink)]">
                                {formatActivityCost(item.cost)}
                              </td>
                              <td className="px-4 py-3.5 text-right font-medium text-[var(--muted)]">
                                {item.percentage}%
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                {tripId ? (
                  <Link
                    to={`/trips/${tripId}/itinerary`}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent)] underline-offset-2 hover:underline"
                  >
                    Manage activities in itinerary →
                  </Link>
                ) : null}
              </div>
            </div>
          </section>
        </>
      )}
    </AppLayout>
  );
}
