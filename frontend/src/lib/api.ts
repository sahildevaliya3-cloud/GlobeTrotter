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

export function deleteTrip(token: string, tripId: string) {
  return request<void>(`/trips/${tripId}`, {
    method: "DELETE",
    token,
  });
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
