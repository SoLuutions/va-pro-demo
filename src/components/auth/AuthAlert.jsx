import React from "react";
import { AlertCircle, Info } from "lucide-react";

export default function AuthAlert({ type = "error", title, message, action }) {
  const isError = type === "error";

  return (
    <div
      role="alert"
      className={`flex gap-3 rounded-xl border px-4 py-3 ${
        isError
          ? "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800/60"
          : "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/60"
      }`}
    >
      <div className="flex-shrink-0 mt-0.5">
        {isError ? (
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
        ) : (
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        {title && (
          <p
            className={`font-semibold text-sm ${
              isError
                ? "text-red-800 dark:text-red-200"
                : "text-blue-800 dark:text-blue-200"
            }`}
          >
            {title}
          </p>
        )}
        {message && (
          <p
            className={`text-sm mt-0.5 leading-relaxed ${
              isError
                ? "text-red-700 dark:text-red-300"
                : "text-blue-700 dark:text-blue-300"
            }`}
          >
            {message}
          </p>
        )}
        {action && <div className="mt-2">{action}</div>}
      </div>
    </div>
  );
}
