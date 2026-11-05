"use client";

import { useId, useState } from "react";
import { PRESET_LABELS } from "@/lib/analytics/ranges";
import type { RangePreset } from "@/lib/analytics/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import BottomSheet from "@/components/common/BottomSheet";

const ORDER: RangePreset[] = ["today", "7d", "30d", "month", "quarter", "custom"];

/** Today / 7d / 30d / This month / This quarter / Custom. Chips scroll sideways on phones. */
export default function DateRangeControl({ preset, custom, onChange, className, customPresentation = "inline", compact = false }: {
  preset: RangePreset;
  custom: { from: string; to: string };
  onChange: (preset: RangePreset, custom?: { from: string; to: string }) => void;
  className?: string;
  customPresentation?: "inline" | "dialog";
  compact?: boolean;
}) {
  const [from, setFrom] = useState(custom.from);
  const [to, setTo] = useState(custom.to);
  const [customDialogOpen, setCustomDialogOpen] = useState(false);
  const formId = useId();
  const customOpen = preset === "custom";
  const invalid = Boolean(from && to && from > to);
  const showCustomDialog = customPresentation === "dialog";

  const applyCustomRange = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!from || !to || invalid) return;
    onChange("custom", { from, to });
    setCustomDialogOpen(false);
  };
  const customForm = (
    <form
      id={formId}
      className={cn("flex flex-wrap items-end gap-3", showCustomDialog ? "" : "rounded-2xl border border-line bg-surface p-3")}
      onSubmit={applyCustomRange}
    >
      <label className="text-xs font-semibold text-muted">From
        <Input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="mt-1 w-44" aria-invalid={invalid} />
      </label>
      <label className="text-xs font-semibold text-muted">To
        <Input type="date" value={to} onChange={(event) => setTo(event.target.value)} className="mt-1 w-44" aria-invalid={invalid} />
      </label>
      {!showCustomDialog && <Button type="submit" disabled={!from || !to || invalid}>Apply</Button>}
      {invalid && <p role="alert" className="basis-full text-xs font-medium text-bad">The start date must be on or before the end date.</p>}
    </form>
  );
  return (
    <div className={cn("space-y-3", className)}>
      <div role="radiogroup" aria-label="Date range" className={cn(
        compact
          ? "flex flex-wrap gap-1.5"
          : "-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0",
      )}>
        {ORDER.map((value) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={preset === value}
            aria-haspopup={value === "custom" && showCustomDialog ? "dialog" : undefined}
            onClick={() => {
              if (value === "custom") {
                onChange("custom", from && to ? { from, to } : undefined);
                if (showCustomDialog) setCustomDialogOpen(true);
              } else {
                onChange(value);
              }
            }}
            className={cn(
              "inline-flex shrink-0 items-center border text-sm font-semibold transition-colors",
              compact ? "min-h-9 rounded-lg px-3" : "min-h-11 px-4 sm:min-h-10",
              preset === value ? "border-brand bg-brand-soft text-brand-strong" : "border-line bg-surface text-ink-soft hover:border-brand/50",
            )}
          >
            {PRESET_LABELS[value]}
          </button>
        ))}
      </div>
      {customOpen && !showCustomDialog && customForm}
      {showCustomDialog && (
        <BottomSheet
          open={customDialogOpen}
          onOpenChange={setCustomDialogOpen}
          title="Choose a custom range"
          description="Select the start and end dates for your dashboard metrics."
          footer={<Button type="submit" form={formId} disabled={!from || !to || invalid}>Apply range</Button>}
        >
          {customForm}
        </BottomSheet>
      )}
    </div>
  );
}
