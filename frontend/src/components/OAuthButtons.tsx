/**
 * OAuthButtons — Official-branded Google and Apple sign-in buttons.
 *
 * Google: White button, Google G logo SVG, dark text — matches Google Identity guidelines.
 * Apple:  Black button, Apple logo SVG, white text — matches Apple HIG.
 *
 * Clicking redirects the whole page to the backend OAuth route so the browser
 * goes through the provider's consent screen directly (no popup, no CORS issues).
 */

const API_BASE = (import.meta.env.VITE_API_URL as string) || "http://localhost:3001";
const APPLE_ENABLED = import.meta.env.VITE_APPLE_ENABLED === "true";

// ── Google "G" logo SVG (official coloured mark) ─────────────────────────────
function GoogleLogo() {
  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g>
        <path
          d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
          fill="#4285F4"
        />
        <path
          d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
          fill="#34A853"
        />
        <path
          d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
          fill="#FBBC05"
        />
        <path
          d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58Z"
          fill="#EA4335"
        />
      </g>
    </svg>
  );
}

// ── Apple logo SVG (white, for use on dark background) ────────────────────────
function AppleLogo() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="20"
      viewBox="0 0 814 1000"
      xmlns="http://www.w3.org/2000/svg"
      fill="white"
    >
      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105.3-57.8-155.5-127.4C46 376.7 0 246.7 0 121.2 0 54 44.5-34 131.7-67.3c46.3-17.2 95.8-29.5 143-29.5 52.5 0 113.7 20.2 157.7 51.6 38.1 28.3 77.8 51.6 130.3 51.6s90.5-20.2 131-51.6c39.5-29.5 79.1-49 138.5-49 6.4 0 128.3 4.5 128.3 128 0 .1 0 .2-.1.3L788.1 340.9z" />
      <path d="M533.3 53.9c29.5-33 64.3-56.9 117.7-56.9 6.4 0 12.8.6 19.1 1.9-7.1 62.5-35.4 107.3-71.3 141.2-32.5 30.2-73.1 52.5-124.3 52.5-5.7 0-11.5-.3-17.2-1-2.3-60.3 27.9-111.5 76-137.7z" />
    </svg>
  );
}

type OAuthButtonsProps = {
  /** "login" or "signup" — shown in accessibility labels only */
  mode?: "login" | "signup";
};

export function OAuthButtons({ mode = "login" }: OAuthButtonsProps) {
  const actionLabel = mode === "signup" ? "up" : "in";

  function handleGoogle() {
    window.location.href = `${API_BASE}/auth/google`;
  }

  function handleApple() {
    if (!APPLE_ENABLED) {
      alert(
        "Apple Sign In requires Apple Developer credentials.\n\nSet VITE_APPLE_ENABLED=true and configure APPLE_* environment variables on the server to enable this button."
      );
      return;
    }
    window.location.href = `${API_BASE}/auth/apple`;
  }

  return (
    <div className="mt-5 space-y-3">
      {/* "or" divider */}
      <div className="relative flex items-center gap-3">
        <div className="h-px flex-1 bg-[var(--line)]" />
        <span className="text-xs font-semibold text-[var(--muted)]">or</span>
        <div className="h-px flex-1 bg-[var(--line)]" />
      </div>

      {/* Google button — white bg, border, Google G logo, dark text */}
      <button
        type="button"
        onClick={handleGoogle}
        aria-label={`Sign ${actionLabel} with Google`}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#dadce0] bg-white px-4 py-2.5 text-sm font-medium text-[#3c4043] shadow-sm transition-all duration-200 hover:bg-[#f8f9fa] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#4285F4]/40 min-h-[44px]"
      >
        <GoogleLogo />
        <span>Continue with Google</span>
      </button>

      {/* Apple button — black bg, Apple logo, white text */}
      <button
        type="button"
        onClick={handleApple}
        aria-label={`Sign ${actionLabel} with Apple`}
        title={
          APPLE_ENABLED
            ? undefined
            : "Requires Apple Developer credentials — see README for setup"
        }
        className={[
          "flex w-full items-center justify-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black/30 min-h-[44px]",
          APPLE_ENABLED
            ? "bg-black hover:bg-[#1a1a1a] hover:shadow-md cursor-pointer"
            : "bg-[#333] cursor-not-allowed opacity-60",
        ].join(" ")}
      >
        <AppleLogo />
        <span>
          Continue with Apple
          {!APPLE_ENABLED ? " (setup required)" : ""}
        </span>
      </button>
    </div>
  );
}
