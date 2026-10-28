"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  icon?: LucideIcon;
  /** Shorter label for narrow phones; falls back to `label`. */
  shortLabel?: string;
}

/**
 * Two-to-four way switch (Table / Kanban, Table / Calendar ...). One size and style everywhere so page headers line up
 * and nothing jumps when moving between pages: 40px tall from `sm`, 44px on phones.
 */
export default function SegmentedControl<T extends string>({ value, onChange, options, ariaLabel, className }: {
  value: T;
  onChange: (value: T) => void;
  options: SegmentOption<T>[];
  ariaLabel: string;
  className?: string;
}) {
  return (
    <div role="group" aria-label={ariaLabel} className={cn("inline-flex shrink-0 gap-1 rounded-xl bg-surface-2 p-1 ring-1 ring-line ring-inset", className)}>
      {options.map(({ value: optionValue, label, icon: Icon, shortLabel }) => {
        const active = value === optionValue;
        return (
          <button
            key={optionValue}
            type="button"
            aria-pressed={active}
            aria-label={label}
            onClick={() => onChange(optionValue)}
            className={cn(
              "inline-flex h-9 min-w-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold transition-all sm:h-8",
              active ? "bg-surface text-ink shadow-card" : "text-muted hover:text-ink",
            )}
          >
            {Icon && <Icon className={cn("size-4 shrink-0", active && "text-brand-strong")} aria-hidden />}
            {shortLabel ? (
              <>
                <span className="sm:hidden">{shortLabel}</span>
                <span className="hidden sm:inline">{label}</span>
              </>
            ) : (
              <span>{label}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
