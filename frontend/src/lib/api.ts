export type Trip = {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
  coverPhotoUrl: string | null;
  isPublic: boolean;
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
  }
) {
  return request<TripResponse>("/trips", {
    method: "POST",
    token,
    body: JSON.stringify(input),
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

export function formatActivityCost(cost: number | string) {
  const value = typeof cost === "string" ? Number(cost) : cost;
  if (Number.isNaN(value)) return "$0";
  if (value === 0) return "Free";
  return `$${value.toFixed(2)}`;
}

export function formatTripDateRange(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${formatter.format(start)} – ${formatter.format(end)}`;
}

export function toDateInputValue(isoDate: string) {
  return isoDate.slice(0, 10);
}
