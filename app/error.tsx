"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App router error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white border border-slate-200 p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900">Something went wrong!</h2>
        <p className="text-xs text-slate-600">
          {error?.message || "An unexpected error occurred while loading this page."}
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
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
}
