import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute, PublicOnlyRoute } from "./auth/ProtectedRoute";
import { DashboardPage } from "./pages/DashboardPage";
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
        <Route path="/trips/new" element={<TripPlaceholderPage mode="new" />} />
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
