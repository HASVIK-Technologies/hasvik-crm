"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export interface ColumnPoint {
  key: string;
  label: string;
  value: number;
  tone?: "brand" | "green" | "amber" | "red" | "orange" | "cyan" | "violet" | "slate";
}

const TONE_FILL = {
  brand: "bg-brand-strong group-hover:bg-brand",
  green: "bg-emerald-500 group-hover:bg-emerald-600",
  amber: "bg-amber-500 group-hover:bg-amber-600",
  red: "bg-red-500 group-hover:bg-red-600",
  orange: "bg-orange-500 group-hover:bg-orange-600",
  cyan: "bg-cyan-500 group-hover:bg-cyan-600",
  violet: "bg-violet-500 group-hover:bg-violet-600",
  slate: "bg-slate-500 group-hover:bg-slate-600",
} as const;

/**
 * Vertical columns for a time series. Each column is a button: tapping (or focusing) shows its exact value in the
 * readout line, which is how tooltips work on touch screens. The numbers are also available as a table by wrapping
 * this in <ChartFrame>.
 */
export default function ColumnChart({ points, ariaLabel, unit = "", className, onSelect }: {
  points: ColumnPoint[];
  ariaLabel: string;
  unit?: string;
  className?: string;
  onSelect?: (point: ColumnPoint) => void;
}) {
  const [active, setActive] = useState<string | null>(null);
  const max = Math.max(1, ...points.map((p) => p.value));
  const shown = points.find((p) => p.key === active) ?? null;
  return (
    <div className={className}>
      <p aria-live="polite" className="mb-3 min-h-5 text-sm text-ink-soft tabular">
        {shown ? <><span className="font-semibold text-ink">{shown.value}</span> {unit} · {shown.label}</> : <span className="text-muted">Select a bar to inspect its value</span>}
      </p>
      <div role="group" aria-label={ariaLabel} className="flex h-28 items-end gap-1 border-b border-line sm:h-32 sm:gap-1.5">
        {points.map((point) => {
          const height = point.value ? Math.max(6, Math.round((point.value / max) * 100)) : 2;
          return (
            <button
              key={point.key}
              type="button"
              aria-label={`${point.label}: ${point.value} ${unit}`.trim()}
              onClick={() => { setActive(point.key); onSelect?.(point); }}
              onMouseEnter={() => setActive(point.key)}
              onFocus={() => setActive(point.key)}
              className="group relative flex h-full min-w-0 flex-1 items-end px-px outline-none focus-visible:ring-2 focus-visible:ring-(--ring)"
            >
              <span
                className={cn("block w-full transition-colors duration-200", point.value ? TONE_FILL[point.tone ?? "brand"] : "bg-line", active === point.key && "brightness-110")}
                style={{ height: `${height}%` }}
              />
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between gap-2 text-xs text-muted" aria-hidden="true">
        <span>{points[0]?.label}</span>
        {points.length > 2 && <span>{points[Math.floor((points.length - 1) / 2)]?.label}</span>}
        {points.length > 1 && <span>{points.at(-1)?.label}</span>}
      </div>
    </div>
  );
}
