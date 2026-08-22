import { useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { AuthForm, AuthLayout, AuthLink, Field } from "../components/AuthForm";
import { OAuthButtons } from "../components/OAuthButtons";
import { ApiError } from "../lib/api";
import { validateLogin } from "../lib/validation";

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    // Show error from OAuth redirect (e.g. user cancelled consent)
    searchParams.get("error") === "oauth_failed"
      ? "Sign-in was cancelled or failed. Please try again."
      : null
  );
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = validateLogin({ email, password });
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await login(email.trim(), password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Unable to sign in. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue planning your trips."
    >
      <AuthForm
        onSubmit={handleSubmit}
        error={error}
        submitLabel="Log in"
        submitting={submitting}
        footer={
          <>
            Don&apos;t have an account? <AuthLink to="/signup">Sign up</AuthLink>
          </>
        }
      >
        <Field
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
          placeholder="you@example.com"
        />
        <Field
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          placeholder="••••••••"
        />
        <div className="text-right">
          <button
            type="button"
            className="text-sm font-medium text-[var(--accent)] underline-offset-2 hover:underline"
            onClick={() =>
              setError("Password reset is not available yet.")
            }
          >
            Forgot Password
          </button>
        </div>
      </AuthForm>

      {/* Social sign-in — below the form, separated by "or" divider */}
      <OAuthButtons mode="login" />
    </AuthLayout>
  );
}
