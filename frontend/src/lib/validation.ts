const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email.trim());
}

export function validateLogin(values: {
  email: string;
  password: string;
}): string | null {
  if (!values.email.trim()) return "Email is required.";
  if (!isValidEmail(values.email)) return "Please enter a valid email address.";
  if (!values.password) return "Password is required.";
  return null;
}

export function validateSignup(values: {
  name: string;
  email: string;
  password: string;
}): string | null {
  if (!values.name.trim()) return "Name is required.";
  if (!values.email.trim()) return "Email is required.";
  if (!isValidEmail(values.email)) return "Please enter a valid email address.";
  if (!values.password) return "Password is required.";
  if (values.password.length < 6) {
    return "Password must be at least 6 characters.";
  }
  return null;
}
