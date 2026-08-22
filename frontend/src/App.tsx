import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute, PublicOnlyRoute } from "./auth/ProtectedRoute";
import { ActivitySearchPage } from "./pages/ActivitySearchPage";
import { CitySearchPage } from "./pages/CitySearchPage";
import { CreateTripPage } from "./pages/CreateTripPage";
import { DashboardPage } from "./pages/DashboardPage";
import { EditTripPage } from "./pages/EditTripPage";
import { ItineraryBuilderPage } from "./pages/ItineraryBuilderPage";
import { ItineraryViewPage } from "./pages/ItineraryViewPage";
import { LoginPage } from "./pages/LoginPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { MyTripsPage } from "./pages/MyTripsPage";
import { ProfileSettingsPage } from "./pages/ProfileSettingsPage";
import { PublicItineraryPage } from "./pages/PublicItineraryPage";
import { SignupPage } from "./pages/SignupPage";
import { TripBudgetPage } from "./pages/TripBudgetPage";
import { TripPlaceholderPage } from "./pages/TripPlaceholderPage";

export default function App() {
  return (
    <Routes>
      <Route path="/share/:shareSlug" element={<PublicItineraryPage />} />

      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/settings" element={<ProfileSettingsPage />} />
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
        <Route path="/trips/:id/budget" element={<TripBudgetPage />} />
        <Route path="/trips/:id/edit" element={<EditTripPage />} />
        <Route path="/trips/:id" element={<TripPlaceholderPage mode="view" />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
