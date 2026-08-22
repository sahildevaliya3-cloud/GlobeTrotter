import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { ApiError, deleteTrip, getTrips, type Trip } from "../lib/api";

export function useTrips() {
  const { token } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTrips = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const result = await getTrips(token);
      setTrips(result.trips);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Unable to load trips. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  async function removeTrip(tripId: string) {
    if (!token) return;

    await deleteTrip(token, tripId);
    setTrips((current) => current.filter((trip) => trip.id !== tripId));
  }

  return {
    trips,
    loading,
    error,
    reload: loadTrips,
    removeTrip,
  };
}
