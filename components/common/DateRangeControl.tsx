"use client";

import { useState } from "react";
import { PRESET_LABELS } from "@/lib/analytics/ranges";
import type { RangePreset } from "@/lib/analytics/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const ORDER: RangePreset[] = ["today", "7d", "30d", "month", "quarter", "custom"];

/** Today / 7d / 30d / This month / This quarter / Custom. Chips scroll sideways on phones. */
export default function DateRangeControl({ preset, custom, onChange, className }: {
  preset: RangePreset;
  custom: { from: string; to: string };
  onChange: (preset: RangePreset, custom?: { from: string; to: string }) => void;
  className?: string;
}) {
  const [from, setFrom] = useState(custom.from);
  const [to, setTo] = useState(custom.to);
  const customOpen = preset === "custom";
  const invalid = Boolean(from && to && from > to);
  return (
    <div className={cn("space-y-3", className)}>
      <div role="radiogroup" aria-label="Date range" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        {ORDER.map((value) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={preset === value}
            onClick={() => (value === "custom" ? onChange("custom", from && to ? { from, to } : undefined) : onChange(value))}
            className={cn(
              "inline-flex min-h-11 shrink-0 items-center rounded-full border px-4 text-sm font-semibold transition-colors sm:min-h-10",
              preset === value ? "border-brand bg-brand-soft text-brand-strong" : "border-line bg-surface text-ink-soft hover:border-brand/50",
            )}
          >
            {PRESET_LABELS[value]}
          </button>
        ))}
      </div>
      {customOpen && (
        <form
          className="flex flex-wrap items-end gap-3 rounded-2xl border border-line bg-surface p-3"
          onSubmit={(event) => { event.preventDefault(); if (from && to && !invalid) onChange("custom", { from, to }); }}
        >
          <label className="text-xs font-semibold text-muted">From
            <Input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="mt-1 w-44" aria-invalid={invalid} />
          </label>
          <label className="text-xs font-semibold text-muted">To
            <Input type="date" value={to} onChange={(event) => setTo(event.target.value)} className="mt-1 w-44" aria-invalid={invalid} />
          </label>
          <Button type="submit" disabled={!from || !to || invalid}>Apply</Button>
          {invalid && <p role="alert" className="basis-full text-xs font-medium text-bad">The start date must be on or before the end date.</p>}
        </form>
      )}
    </div>
  );
}
