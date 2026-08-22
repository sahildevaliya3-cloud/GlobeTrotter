import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute, PublicOnlyRoute } from "./auth/ProtectedRoute";
import { ActivitySearchPage } from "./pages/ActivitySearchPage";
import { CitySearchPage } from "./pages/CitySearchPage";
import { CreateTripPage } from "./pages/CreateTripPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ItineraryBuilderPage } from "./pages/ItineraryBuilderPage";
import { ItineraryViewPage } from "./pages/ItineraryViewPage";
import { LoginPage } from "./pages/LoginPage";
import { MyTripsPage } from "./pages/MyTripsPage";
import { SignupPage } from "./pages/SignupPage";
import { TripPlaceholderPage } from "./pages/TripPlaceholderPage";

export default function App() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/trips" element={<MyTripsPage />} />
        <Route path="/trips/new" element={<CreateTripPage />} />
        <Route
          path="/trips/:id/itinerary"
          element={<ItineraryBuilderPage />}
        />
        <Route path="/trips/:id/cities" element={<CitySearchPage />} />
        <Route
          path="/trips/:id/stops/:stopId/activities"
          element={<ActivitySearchPage />}
        />
        <Route path="/trips/:id/view" element={<ItineraryViewPage />} />
        <Route path="/trips/:id" element={<TripPlaceholderPage mode="view" />} />
        <Route
          path="/trips/:id/edit"
          element={<TripPlaceholderPage mode="edit" />}
        />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
