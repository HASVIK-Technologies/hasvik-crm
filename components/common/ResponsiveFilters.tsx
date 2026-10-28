"use client";

import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";
import { Filter, RotateCcw } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { splitFilters, visibleFilterCount } from "@/lib/filters/responsive";

export const FilterDisplayContext = createContext<"inline" | "drawer">("inline");

export interface ResponsiveFilter {
  key: string;
  label: string;
  control: ReactNode;
  active?: boolean;
  reset?: () => void;
}

function subscribe(callback: () => void) {
  const queries = [window.matchMedia("(min-width: 1024px)"), window.matchMedia("(min-width: 1280px)")];
  queries.forEach((query) => query.addEventListener("change", callback));
  return () => queries.forEach((query) => query.removeEventListener("change", callback));
}

function snapshot() {
  return visibleFilterCount(window.innerWidth);
}

export default function ResponsiveFilters({ fields, onReset, hasActiveFilters }: {
  fields: ResponsiveFilter[];
  onReset?: () => void;
  hasActiveFilters?: boolean;
}) {
  const display = useContext(FilterDisplayContext);
  const count = useSyncExternalStore(subscribe, snapshot, () => 2);
  const { visible, more } = splitFilters(fields, count);
  const activeMore = more.filter((field) => field.active).length;
  const renderField = (field: ResponsiveFilter, expanded: boolean) => (
    <div key={field.key} role="group" aria-label={field.label} className={`responsive-filter-field min-w-0 ${expanded ? "w-full space-y-1.5" : "w-40 xl:w-44"}`}>
      <p className={expanded ? "text-xs font-medium text-ink-soft" : "sr-only"}>{field.label}</p>
      {field.control}
    </div>
  );

  if (display === "drawer") return <div data-filter-controls className="flex w-full flex-col gap-4">{fields.map((field) => renderField(field, true))}</div>;

  return <div data-filter-controls className="flex min-w-0 flex-wrap items-center gap-2.5">
    {visible.map((field) => renderField(field, false))}
    {more.length > 0 && <Popover key={count}>
      <PopoverTrigger asChild>
        <button type="button" className={`inline-flex h-10 shrink-0 items-center gap-2 border px-3 text-xs font-semibold ${activeMore ? "border-brand-strong bg-brand-soft text-brand-strong" : "border-line bg-surface text-ink-soft hover:bg-surface-2"}`}>
          <Filter className="size-3.5" />More Filters
          {activeMore > 0 && <span className="rounded-full bg-btn px-1.5 text-[10px] text-primary-foreground">{activeMore}</span>}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" collisionPadding={12} className="max-h-[var(--radix-popover-content-available-height)] w-[min(22rem,calc(100vw-1.5rem))] overflow-y-auto border border-line bg-surface p-4 shadow-xl rounded-2xl">
        <div className="mb-4 flex items-center justify-between border-b border-surface-2 pb-3">
          <h3 className="text-xs font-bold text-ink">More Filters</h3>
          {activeMore > 0 && <button type="button" onClick={() => more.forEach((field) => field.reset?.())} className="text-xs text-brand-strong hover:underline">Reset Extra</button>}
        </div>
        <div className="flex flex-col gap-4">{more.map((field) => renderField(field, true))}</div>
      </PopoverContent>
    </Popover>}
    {onReset && (hasActiveFilters ?? fields.some((field) => field.active)) && <button type="button" data-inline-filter-reset onClick={onReset} className="inline-flex h-10 shrink-0 items-center gap-1.5 border border-line bg-surface px-3 text-xs font-semibold text-ink-soft hover:bg-bad-soft hover:text-bad"><RotateCcw className="size-3.5" />Reset Filters</button>}
  </div>;
}
