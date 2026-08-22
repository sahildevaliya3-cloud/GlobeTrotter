import { Link, useParams } from "react-router-dom";
import { AppLayout } from "../components/AppLayout";

export function TripPlaceholderPage({ mode }: { mode: "view" | "edit" | "new" }) {
  const { id } = useParams();

  const titles = {
    view: "Trip details",
    edit: "Edit trip",
    new: "Plan new trip",
  };

  const messages = {
    view: "The full trip detail view will be built in a later step.",
    edit: "Trip editing will be available soon.",
    new: "The trip creation flow will be available soon.",
  };

  return (
    <AppLayout>
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-8 shadow-[0_10px_30px_rgba(19,34,56,0.06)]">
        <p className="text-sm font-semibold tracking-[0.18em] text-[var(--accent)] uppercase">
          {titles[mode]}
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-[var(--ink)]">
          {mode === "view" && id ? `Trip ${id}` : titles[mode]}
        </h1>
        <p className="mt-2 text-[var(--muted)]">{messages[mode]}</p>
        <Link
          to="/trips"
          className="mt-6 inline-flex text-sm font-semibold text-[var(--accent)] underline-offset-2 hover:underline"
        >
          Back to My Trips
        </Link>
      </div>
    </AppLayout>
  );
}
