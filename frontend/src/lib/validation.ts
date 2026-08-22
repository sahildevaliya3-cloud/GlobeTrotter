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

export function validateCreateTrip(values: {
  name: string;
  startDate: string;
  endDate: string;
}): string | null {
  if (!values.name.trim()) return "Trip name is required.";
  if (!values.startDate) return "Start date is required.";
  if (!values.endDate) return "End date is required.";

  const start = new Date(values.startDate);
  const end = new Date(values.endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "Please enter valid dates.";
  }

  if (end <= start) {
    return "End date must be after start date.";
  }

  return null;
}
