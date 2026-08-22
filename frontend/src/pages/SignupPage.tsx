import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { AuthForm, AuthLayout, AuthLink, Field } from "../components/AuthForm";
import { ApiError } from "../lib/api";
import { validateSignup } from "../lib/validation";

export function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = validateSignup({ name, email, password });
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await signup(name.trim(), email.trim(), password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Unable to create your account. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Create account"
      subtitle="Join GlobeTrotter and start building your itinerary."
    >
      <AuthForm
        onSubmit={handleSubmit}
        error={error}
        submitLabel="Sign up"
        submitting={submitting}
        footer={
          <>
            Already have an account? <AuthLink to="/login">Log in</AuthLink>
          </>
        }
      >
        <Field
          id="name"
          label="Name"
          value={name}
          onChange={setName}
          autoComplete="name"
          placeholder="Alex Traveler"
        />
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
          autoComplete="new-password"
          placeholder="At least 6 characters"
        />
      </AuthForm>
    </AuthLayout>
  );
}
