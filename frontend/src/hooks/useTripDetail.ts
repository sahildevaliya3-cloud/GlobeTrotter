import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { ApiError, getTrip, type Trip } from "../lib/api";

export function useTripDetail(tripId: string | undefined) {
  const { token } = useAuth();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!token || !tripId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await getTrip(token, tripId);
      setTrip(result.trip);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Unable to load trip. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [token, tripId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { trip, loading, error, reload, setTrip };
}
