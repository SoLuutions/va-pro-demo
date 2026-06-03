import React, { useState } from "react";
import { UserPlus } from "lucide-react";
import AuthAlert from "./AuthAlert";
import { formatValidationError } from "../../utils/authErrors";
import { validateField } from "../../utils/sanitize";

export default function Register({ onRegister, onSwitchToLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!name || !email || !password || !confirmPassword) {
      setError(formatValidationError("required"));
      return;
    }

    if (password !== confirmPassword) {
      setError(formatValidationError("password_mismatch"));
      return;
    }

    if (password.length < 6) {
      setError(formatValidationError("password_short"));
      return;
    }

    // Validate and sanitize inputs
    const nameValidation = validateField("name", name);
    if (!nameValidation.valid) {
      setError({ title: "Invalid name", message: nameValidation.error });
      return;
    }

    const emailValidation = validateField("email", email);
    if (!emailValidation.valid) {
      setError({ title: "Invalid email", message: emailValidation.error });
      return;
    }

    const passwordValidation = validateField("password", password);
    if (!passwordValidation.valid) {
      setError({ title: "Invalid password", message: passwordValidation.error });
      return;
    }

    setLoading(true);
    try {
      const result = await onRegister(nameValidation.value, emailValidation.value, password);
      if (!result.success) {
        setError(
          typeof result.error === "string"
            ? { title: "Couldn't create account", message: result.error }
            : result.error
        );
      } else if (result.message) {
        setInfo({ title: "Almost there", message: result.message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="va-bg" aria-hidden="true" />
      <div className="relative z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-2xl shadow-xl p-8 w-full max-w-md border border-white/20">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/40 rounded-full mb-4">
            <UserPlus className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="va-logo" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">VA Pro</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <AuthAlert
              type="error"
              title={error.title}
              message={error.message}
              action={
                error.hint === "login" ? (
                  <button
                    type="button"
                    onClick={onSwitchToLogin}
                    className="text-sm font-medium text-red-700 dark:text-red-300 underline underline-offset-2 hover:opacity-80"
                  >
                    Go to sign in →
                  </button>
                ) : null
              }
            />
          )}
          {info && (
            <AuthAlert type="info" title={info.title} message={info.message} />
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
              placeholder="Your Name"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
              placeholder="your@email.com"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Already have an account?{" "}
            <button
              onClick={onSwitchToLogin}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
