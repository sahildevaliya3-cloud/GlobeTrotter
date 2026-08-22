import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import type { AuthUser } from "../lib/api";

const API_BASE = (import.meta.env.VITE_API_URL as string) || "http://localhost:3001";

/**
 * OAuthCallbackPage — Handles the redirect from the backend after OAuth consent.
 *
 * URL pattern: /auth/callback?code=<one-time-code>
 *              /auth/callback?error=oauth_failed
 *
 * 1. Reads `?code` from the URL
 * 2. POSTs to POST /auth/exchange to swap it for a real JWT
 * 3. Calls loginWithToken() to hydrate AuthContext
 * 4. Navigates to /dashboard
 *
 * On any error, redirects to /login?error=oauth_failed so LoginPage can
 * show a friendly toast.
 */
export function OAuthCallbackPage() {
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();
  const ran = useRef(false); // StrictMode guard — run exchange only once

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const error = params.get("error");

    if (error || !code) {
      navigate("/login?error=oauth_failed", { replace: true });
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/exchange`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });

        if (!res.ok) {
          throw new Error("Exchange failed");
        }

        const data = (await res.json()) as { token: string; user: AuthUser };
        loginWithToken(data.token, data.user);
        navigate("/dashboard", { replace: true });
      } catch {
        navigate("/login?error=oauth_failed", { replace: true });
      }
    })();
  }, [loginWithToken, navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--page)]">
      <Loader2 size={40} className="animate-spin text-[var(--accent)]" />
      <p className="text-sm font-medium text-[var(--muted)]">
        Completing sign-in&hellip;
      </p>
    </div>
  );
}
