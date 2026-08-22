import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuth } from "../auth/AuthContext";
import { AppLayout } from "../components/AppLayout";
import { getAdminStats, type AdminStats } from "../lib/api";

const CITY_BAR_COLORS = [
  "#1f6f8b",
  "#28809e",
  "#3393b3",
  "#41a6c7",
  "#54b9d9",
  "#6bcbeb",
  "#85dbf7",
  "#a0e7fd",
  "#bfefff",
  "#dbf6ff",
];

const CATEGORY_COLORS: Record<string, string> = {
  sightseeing: "#1f6f8b",
  food: "#f59e0b",
  adventure: "#10b981",
  culture: "#8b5cf6",
  relaxation: "#ec4899",
  general: "#64748b",
};

export function AdminDashboardPage() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = Boolean(user?.isAdmin || user?.is_admin);

  useEffect(() => {
    if (!token || !isAdmin) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    getAdminStats(token)
      .then((res) => {
        if (isMounted) {
          setStats(res.stats);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load admin analytics statistics."
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
  }, [token, isAdmin]);

  if (!isAdmin) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-2xl py-12 text-center">
          <div className="rounded-3xl border border-red-200 bg-red-50/70 p-8 sm:p-12 shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-3xl">
              🚫
            </div>
            <h1 className="mt-4 text-2xl font-extrabold text-red-900">
              Access Restricted
            </h1>
            <p className="mt-2 text-sm text-red-700">
              You do not have administrator permissions to view the GlobeTrotter
              analytics dashboard.
            </p>
            <div className="mt-6">
              <Link
                to="/dashboard"
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[var(--accent)] px-6 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[var(--accent-dark)]"
              >
                Return to Home Dashboard
              </Link>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  const topCityName = stats?.topCities[0]
    ? `${stats.topCities[0].name} (${stats.topCities[0].count})`
    : "None yet";
  const topActivityName = stats?.topActivities[0]
    ? `${stats.topActivities[0].name} (${stats.topActivities[0].count})`
    : "None yet";

  return (
    <AppLayout>
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-amber-800 border border-amber-200">
            👑 Administrator Portal
          </span>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[var(--ink)] sm:text-4xl">
            System Analytics & Metrics
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Real-time system insights, top destinations, activity popularity, and user growth trends.
          </p>
        </div>

        <Link
          to="/dashboard"
          className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 text-xs font-bold text-[var(--ink)] shadow-sm transition hover:bg-[#f4f7fa]"
        >
          ← User View
        </Link>
      </section>

      {loading ? (
        <div className="mt-10 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-12 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--accent)] border-r-transparent align-[-0.125em]" />
          <p className="mt-4 text-sm font-medium text-[var(--muted)]">
            Computing admin analytics & dataset metrics…
          </p>
        </div>
      ) : error ? (
        <div
          role="alert"
          className="mt-8 rounded-xl border border-[#fecdca] bg-[var(--danger-soft)] p-6 text-sm text-[var(--danger)]"
        >
          <p className="font-bold">Failed to load admin analytics</p>
          <p className="mt-1">{error}</p>
        </div>
      ) : stats ? (
        <>
          {/* Top KPI Cards Grid */}
          <section className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm">
              <span className="text-2xl">🗺</span>
              <p className="mt-2 text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                Total Trips Created
              </p>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-[var(--accent)]">
                {stats.totalTrips}
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">Across all active accounts</p>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm">
              <span className="text-2xl">👥</span>
              <p className="mt-2 text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                Registered Users
              </p>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-[var(--ink)]">
                {stats.totalUsers}
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">Total registered accounts</p>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm">
              <span className="text-2xl">🏙</span>
              <p className="mt-2 text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                Top Destination City
              </p>
              <p className="mt-2 text-lg font-bold text-[var(--ink)] truncate">
                {topCityName}
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">Most added to trip stops</p>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm">
              <span className="text-2xl">🎯</span>
              <p className="mt-2 text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                Most Popular Activity
              </p>
              <p className="mt-2 text-lg font-bold text-[var(--ink)] truncate">
                {topActivityName}
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">Highest scheduled activity</p>
            </div>
          </section>

          {/* User Signups Over Time Line Chart */}
          <section className="mt-8 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-[var(--ink)]">
                  📈 User Registration Trends
                </h2>
                <p className="text-xs text-[var(--muted)]">
                  Daily timeline of new user account signups
                </p>
              </div>
            </div>

            <div className="mt-6 h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.signupsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderRadius: "12px",
                      borderColor: "#cbd5e1",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    }}
                    formatter={(val) => [`${val} signups`, "Registrations"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#1f6f8b"
                    strokeWidth={3}
                    dot={{ r: 5, fill: "#1f6f8b" }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Top 10 Cities & Top 10 Activities Bar Charts */}
          <section className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Top Cities Bar Chart */}
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm">
              <h2 className="text-lg font-bold text-[var(--ink)]">
                🏙 Top 10 Most-Added Cities
              </h2>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Number of times each city was added as a stop in user itineraries
              </p>

              {stats.topCities.length === 0 ? (
                <div className="mt-12 text-center text-sm text-[var(--muted)]">
                  No cities added to trips yet.
                </div>
              ) : (
                <div className="mt-6 h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.topCities}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          borderRadius: "12px",
                          borderColor: "#cbd5e1",
                        }}
                        formatter={(val) => [`${val} stops`, "Trips Added"]}
                      />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                        {stats.topCities.map((entry, index) => (
                          <Cell
                            key={entry.id}
                            fill={CITY_BAR_COLORS[index % CITY_BAR_COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Top Activities Bar Chart */}
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm">
              <h2 className="text-lg font-bold text-[var(--ink)]">
                🎯 Top 10 Most-Scheduled Activities
              </h2>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Most popular activities added across all itineraries
              </p>

              {stats.topActivities.length === 0 ? (
                <div className="mt-12 text-center text-sm text-[var(--muted)]">
                  No activities scheduled yet.
                </div>
              ) : (
                <div className="mt-6 h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.topActivities} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" stroke="#64748b" fontSize={12} allowDecimals={false} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        stroke="#64748b"
                        fontSize={11}
                        width={130}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          borderRadius: "12px",
                          borderColor: "#cbd5e1",
                        }}
                        formatter={(val) => [`${val} times scheduled`, "Scheduled Count"]}
                      />
                      <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                        {stats.topActivities.map((entry) => (
                          <Cell
                            key={entry.id}
                            fill={CATEGORY_COLORS[entry.category] || "#1f6f8b"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </section>

          {/* Detailed Data Tables */}
          <section className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Top Cities Table */}
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm">
              <h2 className="text-base font-bold text-[var(--ink)]">
                City Popularity Rankings
              </h2>
              <div className="mt-4 overflow-x-auto rounded-xl border border-[var(--line)]">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#f7fafb] text-xs uppercase font-semibold text-[var(--muted)] border-b border-[var(--line)]">
                    <tr>
                      <th className="px-4 py-3">Rank</th>
                      <th className="px-4 py-3">City</th>
                      <th className="px-4 py-3">Country</th>
                      <th className="px-4 py-3 text-right">Stops Added</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--line)]">
                    {stats.topCities.map((city, idx) => (
                      <tr key={city.id} className="hover:bg-[#fcfdfe]">
                        <td className="px-4 py-3 text-xs font-extrabold text-[var(--accent)]">
                          #{idx + 1}
                        </td>
                        <td className="px-4 py-3 font-bold text-[var(--ink)]">
                          {city.name}
                        </td>
                        <td className="px-4 py-3 text-xs text-[var(--muted)]">
                          {city.country}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="inline-flex items-center rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-bold text-sky-800">
                            {city.count}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Activities Table */}
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm">
              <h2 className="text-base font-bold text-[var(--ink)]">
                Activity Popularity Rankings
              </h2>
              <div className="mt-4 overflow-x-auto rounded-xl border border-[var(--line)]">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#f7fafb] text-xs uppercase font-semibold text-[var(--muted)] border-b border-[var(--line)]">
                    <tr>
                      <th className="px-4 py-3">Rank</th>
                      <th className="px-4 py-3">Activity</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3 text-right">Times Scheduled</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--line)]">
                    {stats.topActivities.map((act, idx) => (
                      <tr key={act.id} className="hover:bg-[#fcfdfe]">
                        <td className="px-4 py-3 text-xs font-extrabold text-[var(--accent)]">
                          #{idx + 1}
                        </td>
                        <td className="px-4 py-3 font-bold text-[var(--ink)]">
                          {act.name}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex rounded-full bg-[#eef4f7] px-2 py-0.5 text-[10px] font-bold uppercase text-[var(--accent)]">
                            {act.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                            {act.count}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </>
      ) : null}
    </AppLayout>
  );
}
