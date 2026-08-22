import type { Stop, TripActivityDetail } from "./api";

export function sortStops(stops: Stop[]) {
  return [...stops].sort((a, b) => a.orderIndex - b.orderIndex);
}

export function groupActivitiesByDate(tripActivities: TripActivityDetail[] = []) {
  const sorted = [...tripActivities].sort((a, b) => {
    const dateCompare = a.scheduledDate.localeCompare(b.scheduledDate);
    if (dateCompare !== 0) return dateCompare;
    return a.scheduledTime.localeCompare(b.scheduledTime);
  });

  const groups = new Map<string, TripActivityDetail[]>();

  for (const tripActivity of sorted) {
    const dateKey = tripActivity.scheduledDate.slice(0, 10);
    const existing = groups.get(dateKey) ?? [];
    existing.push(tripActivity);
    groups.set(dateKey, existing);
  }

  return Array.from(groups.entries());
}
