"use client";

import { RefreshCw } from "lucide-react";
import type { DashboardRefreshMode } from "@/lib/dashboard/refresh";
import { cn } from "@/lib/utils";

export default function DashboardRefreshControls({
  mode,
  onModeChange,
  onRefresh,
  isRefreshing,
}: {
  mode: DashboardRefreshMode;
  onModeChange: (mode: DashboardRefreshMode) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div role="group" aria-label="Dashboard refresh mode" className="inline-flex rounded-lg border border-line bg-surface-2 p-1">
        {(["manual", "auto"] as const).map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={mode === value}
            onClick={() => onModeChange(value)}
            className={cn(
              "min-h-8 rounded-md px-2.5 text-xs font-semibold capitalize transition-colors",
              mode === value ? "bg-surface text-brand-strong shadow-card" : "text-ink-soft hover:text-ink",
            )}
          >
            {value}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onRefresh}
        disabled={isRefreshing}
        className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-brand-strong px-3 text-sm font-semibold text-white transition-colors hover:bg-brand disabled:cursor-wait disabled:opacity-70"
      >
        <RefreshCw aria-hidden="true" className={cn("size-4", isRefreshing && "animate-spin")} />
        <span>{isRefreshing ? "Refreshing" : "Refresh"}</span>
      </button>
    </div>
  );
}
