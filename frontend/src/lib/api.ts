export type Trip = {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
  coverPhotoUrl: string | null;
  targetBudget?: number | null;
  target_budget?: number | null;
  isPublic: boolean;
  shareSlug?: string | null;
  ownerName?: string;
  createdAt: string;
  stopCount?: number;
  stops?: Stop[];
};

export type StopCity = {
  id: string;
  name: string;
  country: string;
  costIndex: number;
  popularityScore: number;
  imageUrl: string | null;
};

export type Stop = {
  id: string;
  tripId: string;
  cityId: string;
  startDate: string;
  endDate: string;
  orderIndex: number;
  city?: StopCity;
  tripActivities?: TripActivityDetail[];
};

export type TripActivityActivity = {
  id: string;
  cityId: string;
  name: string;
  category: string;
  cost: number | string;
  durationHours?: number;
  duration_hours?: number;
  description: string | null;
  imageUrl?: string | null;
  image_url?: string | null;
};

export type TripActivityDetail = {
  id: string;
  stopId: string;
  activityId: string;
  scheduledDate: string;
  scheduledTime: string;
  customCost: number | string | null;
  activity?: TripActivityActivity;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  photoUrl: string | null;
  createdAt: string;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

export type TripsResponse = {
  trips: Trip[];
};

export type TripResponse = {
  trip: Trip;
};

export type CategoryBreakdownItem = {
  category: string;
  cost: number;
  percentage: number;
};

export type TripBudget = {
  tripId: string;
  totalCost: number;
  targetBudget: number | null;
  isOverBudget: boolean;
  remainingBudget: number | null;
  numberOfDays: number;
  averageCostPerDay: number;
  categoryBreakdown: CategoryBreakdownItem[];
};

export type TripBudgetResponse = {
  budget: TripBudget;
};

export type City = {
  id: string;
  name: string;
  country: string;
  cost_index: number;
  popularity_score: number;
  image_url: string | null;
};

export type CitiesResponse = {
  cities: City[];
};

export type StopResponse = {
  stop: Stop & { city?: StopCity };
};

export type Activity = {
  id: string;
  name: string;
  category: string;
  cost: number | string;
  duration_hours: number;
  description: string | null;
  image_url: string | null;
};

export type ActivitiesResponse = {
  activities: Activity[];
};

export type TripActivityResponse = {
  tripActivity: {
    id: string;
    stopId: string;
    activityId: string;
    scheduledDate: string;
    scheduledTime: string;
    customCost: number | string | null;
    activity?: Activity;
  };
};

export const ACTIVITY_CATEGORIES = [
  "sightseeing",
  "food",
  "adventure",
  "culture",
  "relaxation",
] as const;

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

async function request<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;

  const response = await fetch(`${API_URL}${path}`, {
    ...fetchOptions,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(fetchOptions.headers || {}),
    },
  });

  if (response.status === 204) {
    return undefined as T;
  }

  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      data &&
      typeof data === "object" &&
      "error" in data &&
      typeof (data as { error: unknown }).error === "string"
        ? (data as { error: string }).error
        : "Something went wrong. Please try again.";
    throw new ApiError(message, response.status);
  }

  return data as T;
}

export function signup(input: {
  name: string;
  email: string;
  password: string;
}) {
  return request<AuthResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function login(input: { email: string; password: string }) {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getTrips(token: string) {
  return request<TripsResponse>("/trips", { token });
}

export function getTrip(token: string, tripId: string) {
  return request<TripResponse>(`/trips/${tripId}`, { token });
}

export function updateStop(
  token: string,
  stopId: string,
  input: {
    start_date?: string;
    end_date?: string;
    order_index?: number;
  }
) {
  return request<StopResponse>(`/stops/${stopId}`, {
    method: "PUT",
    token,
    body: JSON.stringify(input),
  });
}

export function deleteStop(token: string, stopId: string) {
  return request<void>(`/stops/${stopId}`, {
    method: "DELETE",
    token,
  });
}

export function deleteTrip(token: string, tripId: string) {
  return request<void>(`/trips/${tripId}`, {
    method: "DELETE",
    token,
  });
}

export function createTrip(
  token: string,
  input: {
    name: string;
    description?: string;
    start_date: string;
    end_date: string;
    cover_photo_url?: string;
    target_budget?: number | null;
  }
) {
  return request<TripResponse>("/trips", {
    method: "POST",
    token,
    body: JSON.stringify(input),
  });
}

export function updateTrip(
  token: string,
  tripId: string,
  input: {
    name?: string;
    description?: string;
    start_date?: string;
    end_date?: string;
    cover_photo_url?: string;
    target_budget?: number | null;
  }
) {
  return request<TripResponse>(`/trips/${tripId}`, {
    method: "PUT",
    token,
    body: JSON.stringify(input),
  });
}

export function getTripBudget(token: string, tripId: string) {
  return request<TripBudgetResponse>(`/trips/${tripId}/budget`, { token });
}

export function toggleTripShare(
  token: string,
  tripId: string,
  isPublic?: boolean
) {
  return request<{ trip: Trip; shareSlug: string; isPublic: boolean }>(
    `/trips/${tripId}/share`,
    {
      method: "PUT",
      token,
      body: JSON.stringify({ is_public: isPublic }),
    }
  );
}

export function getPublicTrip(shareSlug: string) {
  return request<TripResponse>(`/public/${shareSlug}`);
}

export function cloneTrip(token: string, shareSlug: string) {
  return request<TripResponse>(`/trips/clone/${shareSlug}`, {
    method: "POST",
    token,
  });
}

export function searchCities(
  token: string,
  params: { search?: string; country?: string } = {}
) {
  const query = new URLSearchParams();
  if (params.search?.trim()) query.set("search", params.search.trim());
  if (params.country?.trim()) query.set("country", params.country.trim());

  const suffix = query.toString() ? `?${query.toString()}` : "";
  return request<CitiesResponse>(`/cities${suffix}`, { token });
}

export function addStopToTrip(
  token: string,
  tripId: string,
  cityId: string
) {
  return request<StopResponse>(`/trips/${tripId}/stops`, {
    method: "POST",
    token,
    body: JSON.stringify({ city_id: cityId }),
  });
}

export function searchActivities(
  token: string,
  params: { city_id: string; category?: string; maxCost?: string | number }
) {
  const query = new URLSearchParams();
  query.set("city_id", params.city_id);
  if (params.category?.trim()) query.set("category", params.category.trim());
  if (params.maxCost !== undefined && params.maxCost !== "") {
    query.set("maxCost", String(params.maxCost));
  }

  return request<ActivitiesResponse>(`/activities?${query.toString()}`, { token });
}

export function addActivityToStop(
  token: string,
  stopId: string,
  input: {
    activity_id: string;
    scheduled_date?: string;
    scheduled_time?: string;
  }
) {
  return request<TripActivityResponse>(`/stops/${stopId}/activities`, {
    method: "POST",
    token,
    body: JSON.stringify(input),
  });
}

export function updateTripActivity(
  token: string,
  tripActivityId: string,
  input: {
    scheduled_date?: string;
    scheduled_time?: string;
    custom_cost?: number | string | null;
  }
) {
  return request<TripActivityResponse>(`/trip-activities/${tripActivityId}`, {
    method: "PUT",
    token,
    body: JSON.stringify(input),
  });
}

export function deleteTripActivity(token: string, tripActivityId: string) {
  return request<void>(`/trip-activities/${tripActivityId}`, {
    method: "DELETE",
    token,
  });
}

export function formatActivityCost(cost: number | string) {
  const value = typeof cost === "string" ? Number(cost) : cost;
  if (Number.isNaN(value)) return "$0";
  if (value === 0) return "Free";
  return `$${value.toFixed(2)}`;
}

export function formatScheduledTime(scheduledTime: string) {
  if (!scheduledTime) return "—";

  const timeMatch = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(scheduledTime.trim());
  if (timeMatch) {
    const hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);
    const period = hours >= 12 ? "PM" : "AM";
    const hour12 = hours % 12 || 12;
    return `${hour12}:${String(minutes).padStart(2, "0")} ${period}`;
  }

  const date = new Date(scheduledTime);
  if (Number.isNaN(date.getTime())) return scheduledTime;

  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${String(minutes).padStart(2, "0")} ${period}`;
}

export function formatDisplayDate(isoDate: string) {
  if (!isoDate) return "";
  const dateStr = isoDate.slice(0, 10);
  const parts = dateStr.split("-").map(Number);
  if (parts.length === 3 && !parts.some(Number.isNaN)) {
    const [year, month, day] = parts;
    const utcDate = new Date(Date.UTC(year, month - 1, day));
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    }).format(utcDate);
  }

  const fallback = new Date(isoDate);
  return Number.isNaN(fallback.getTime()) ? isoDate : fallback.toDateString();
}

export function getTripActivityCost(tripActivity: TripActivityDetail) {
  if (tripActivity.customCost != null && tripActivity.customCost !== "") {
    return formatActivityCost(tripActivity.customCost);
  }
  if (tripActivity.activity?.cost != null) {
    return formatActivityCost(tripActivity.activity.cost);
  }
  return "—";
}

export function getTripActivityDuration(tripActivity: TripActivityDetail) {
  const hours =
    tripActivity.activity?.durationHours ?? tripActivity.activity?.duration_hours;
  if (hours == null) return null;
  return hours === 1 ? "1 hr" : `${hours} hrs`;
}

export function formatTripDateRange(startDate: string, endDate: string) {
  if (!startDate || !endDate) return "";

  const parseUtc = (str: string) => {
    const parts = str.slice(0, 10).split("-").map(Number);
    if (parts.length === 3 && !parts.some(Number.isNaN)) {
      return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
    }
    return new Date(str);
  };

  const start = parseUtc(startDate);
  const end = parseUtc(endDate);

  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  return `${formatter.format(start)} – ${formatter.format(end)}`;
}

export function toDateInputValue(isoDate: string) {
  return isoDate.slice(0, 10);
}
