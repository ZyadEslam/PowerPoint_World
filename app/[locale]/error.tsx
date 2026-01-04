"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error caught:", error);
  }, [error]);

  return (
    <div className="mx-auto mt-5 max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 text-center">
      {/* Error Icon */}
      <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
        <svg
          className="w-10 h-10 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>

      {/* Error Message */}
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Oops! Something went wrong
      </h1>

      <p className="text-gray-600 mb-6">
        We apologize for the inconvenience. Please try the following steps:
      </p>

      {/* (Visible only in development) */}
      {process.env.NODE_ENV === "development" && (
        <details className="mb-6 p-4 bg-gray-50 rounded-lg text-left">
          <summary className="cursor-pointer font-medium text-gray-700">
            Error Details (Development)
          </summary>
          <div className="mt-2 text-sm">
            <p className="text-red-600 font-mono">{error.message}</p>
            {error.digest && (
              <p className="text-gray-500 mt-2">Error Digest: {error.digest}</p>
            )}
            <pre className="mt-2 text-xs text-gray-500 overflow-auto">
              {error.stack}
            </pre>
          </div>
        </details>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={reset}
          className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Try Again
        </button>

        <Link
          href="/"
          className="flex-1 bg-gray-200 text-gray-900 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors text-center focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Go Home
        </Link>
      </div>

      {/* Additional Help */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-500 mb-2">
          If the problem persists, please contact support.
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            href="mailto:support@yourapp.com"
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Contact Support
          </Link>
          <Link href="/help" className="text-blue-600 hover:text-blue-800 text-sm">
            Help Center
          </Link>
        </div>
      </div>
    </div>
  );
}
