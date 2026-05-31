/**
 * Maps raw Supabase / API auth errors to friendly copy for the UI.
 */
export function formatAuthError(raw) {
  if (!raw) {
    return {
      title: "Something went wrong",
      message: "Please try again in a moment.",
    };
  }

  const msg = (typeof raw === "string" ? raw : raw.message || String(raw)).trim();
  const lower = msg.toLowerCase();

  if (
    lower.includes("already been registered") ||
    lower.includes("already registered") ||
    lower.includes("user already exists") ||
    lower.includes("email address is already") ||
    lower.includes("duplicate")
  ) {
    return {
      title: "Email already in use",
      message: "An account with this email already exists. Sign in instead, or use a different email.",
      hint: "login",
    };
  }

  if (lower.includes("rate limit") || lower.includes("email rate")) {
    return {
      title: "Too many attempts",
      message: "Sign-up is temporarily limited. Wait about an hour, or try a different email address.",
      hint: "retry",
    };
  }

  if (
    lower.includes("invalid login credentials") ||
    lower.includes("invalid email or password")
  ) {
    return {
      title: "Incorrect sign-in details",
      message: "The email or password doesn't match our records. Double-check and try again.",
    };
  }

  if (lower.includes("email not confirmed") || lower.includes("not confirmed")) {
    return {
      title: "Email not confirmed",
      message: "Confirm your email using the link we sent you, then sign in here.",
    };
  }

  if (lower.includes("password") && (lower.includes("least") || lower.includes("short"))) {
    return {
      title: "Password too short",
      message: "Use at least 6 characters for your password.",
    };
  }

  if (
    lower.includes("invalid email") ||
    lower.includes("unable to validate email") ||
    lower.includes("malformed")
  ) {
    return {
      title: "Invalid email",
      message: "Enter a valid email address (for example, you@example.com).",
    };
  }

  if (lower.includes("network") || lower.includes("failed to fetch") || lower.includes("fetch")) {
    return {
      title: "Connection problem",
      message: "We couldn't reach the server. Check your internet connection and try again.",
      hint: "retry",
    };
  }

  if (lower.includes("signup disabled") || lower.includes("signups not allowed")) {
    return {
      title: "Registration closed",
      message: "New accounts aren't being accepted right now. Please try again later.",
    };
  }

  if (lower.includes("weak password") || lower.includes("password should")) {
    return {
      title: "Password too weak",
      message: "Choose a stronger password with at least 6 characters.",
    };
  }

  if (lower.includes("service role") || lower.includes("not configured")) {
    return {
      title: "Server setup issue",
      message: "Registration isn't fully configured on the server. Contact the app owner.",
    };
  }

  return {
    title: "Couldn't complete sign-up",
    message: msg.length > 120 ? "Something went wrong on our end. Please try again." : msg,
  };
}

/** Supabase may return a user with no identities when the email already exists (anti-enumeration). */
export function isDuplicateSignup(data) {
  return Boolean(
    data?.user &&
    Array.isArray(data.user.identities) &&
    data.user.identities.length === 0
  );
}

export function formatLoginError(raw) {
  const formatted = formatAuthError(raw);
  if (formatted.title === "Couldn't complete sign-up") {
    return {
      title: "Couldn't sign you in",
      message: formatted.message,
      hint: formatted.hint,
    };
  }
  return formatted;
}

export function formatValidationError(field) {
  switch (field) {
    case "required":
      return {
        title: "Missing information",
        message: "Please fill in all fields before continuing.",
      };
    case "password_mismatch":
      return {
        title: "Passwords don't match",
        message: "Make sure both password fields are exactly the same.",
      };
    case "password_short":
      return {
        title: "Password too short",
        message: "Use at least 6 characters for your password.",
      };
    default:
      return {
        title: "Check your details",
        message: "Please review the form and try again.",
      };
  }
}
