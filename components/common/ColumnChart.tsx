"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export interface ColumnPoint {
  key: string;
  label: string;
  value: number;
}

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
  const every = Math.max(1, Math.ceil(points.length / 7));
  return (
    <div className={className}>
      <p aria-live="polite" className="mb-2 min-h-5 text-sm text-ink-soft tabular">
        {shown ? <><span className="font-semibold text-ink">{shown.value}</span> {unit} · {shown.label}</> : <span className="text-muted">Tap a column to see its value</span>}
      </p>
      <div role="group" aria-label={ariaLabel} className="flex h-40 items-end gap-1 sm:gap-1.5">
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
              className="group relative flex h-full min-w-0 flex-1 items-end rounded-md outline-none focus-visible:ring-4 focus-visible:ring-(--ring)"
            >
              <span
                className={cn("block w-full rounded-t-md transition-all duration-300", point.value ? "bg-brand-strong group-hover:bg-brand" : "bg-line", active === point.key && "bg-brand")}
                style={{ height: `${height}%` }}
              />
            </button>
          );
        })}
      </div>
      <div aria-hidden className="mt-1.5 flex gap-1 text-[10px] text-muted sm:gap-1.5">
        {points.map((point, index) => (
          <span key={point.key} className="min-w-0 flex-1 truncate text-center">{index % every === 0 ? point.label.slice(point.label.length > 7 ? 5 : 0) : ""}</span>
        ))}
      </div>
    </div>
  );
}
