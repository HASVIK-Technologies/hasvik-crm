"use client";

import { X } from "lucide-react";

export interface FilterChip {
  key: string;
  label: string;
  onRemove: () => void;
}

/** Visible, removable chips for the filters a screen was opened with (e.g. from a dashboard card). */
export default function ActiveFilterChips({ chips, onClearAll }: { chips: FilterChip[]; onClearAll?: () => void }) {
  if (!chips.length) return null;
  return (
    <div role="group" aria-label="Active filters" className="fade-up flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold tracking-wide text-muted uppercase">Filtered by</span>
      {chips.map((chip) => (
        <span key={chip.key} className="inline-flex min-h-9 items-center gap-1 rounded-tag bg-brand-soft py-1 pr-1 pl-3 text-sm font-semibold text-brand-strong">
          {chip.label}
          <button
            type="button"
            onClick={chip.onRemove}
            aria-label={`Remove filter: ${chip.label}`}
            className="grid size-7 place-items-center rounded-full hover:bg-brand/20"
          >
            <X className="size-4" aria-hidden />
          </button>
        </span>
      ))}
      {chips.length > 1 && onClearAll && (
        <button type="button" onClick={onClearAll} className="min-h-9 px-2 text-sm font-semibold text-muted hover:text-ink">Clear all</button>
      )}
    </div>
  );
}
