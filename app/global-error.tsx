"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global application error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50 text-slate-900 font-sans">
        <div className="max-w-md w-full bg-white border border-slate-200 p-6 shadow-sm text-center space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Something went wrong!</h2>
          <p className="text-xs text-slate-600">
            {error?.message || "An unexpected error occurred."}
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => reset()}
              className="h-9 px-4 text-xs font-semibold bg-[#16a34a] hover:bg-[#15803d] text-white rounded-none transition-colors cursor-pointer"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={() => window.location.assign("/")}
              className="h-9 px-4 text-xs font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-none transition-colors cursor-pointer"
            >
              Back to Home
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
