"use client";

import { CalendarDays } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Calendar from "@/components/common/Calendar";
import { parseCalendarDate } from "@/lib/forms/date-time";

interface FollowUpDateRangeProps {
  from?: string;
  to?: string;
  onChange: (from: string, to: string) => void;
}

function display(value: string) {
  const date = parseCalendarDate(value);
  return date
    ? new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(date)
    : "";
}

function inputDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function FollowUpDateRange({
  from = "",
  to = "",
  onChange,
}: FollowUpDateRangeProps) {
  const fromDate = parseCalendarDate(from);
  const toDate = parseCalendarDate(to);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-10 w-full items-center justify-between border border-line bg-surface px-3 text-left text-xs font-medium text-ink-soft shadow-card hover:border-muted focus-visible:border-brand-strong focus-visible:ring-2 focus-visible:ring-brand/15"
        >
          <span className="flex min-w-0 items-center gap-2">
            <CalendarDays className="size-3.5 shrink-0 text-muted" />
            <span className="truncate">
              {from || to
                ? `${display(from) || "Start"} - ${display(to) || "End"}`
                : "Date range"}
            </span>
          </span>

        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        collisionPadding={12} className="max-h-[var(--radix-popover-content-available-height)] w-[min(22rem,calc(100vw-1.5rem))] overflow-y-auto space-y-4 border border-line bg-surface p-3 shadow-xl"
      >
        <div>
          <p className="text-xs font-bold text-ink">Date range</p>
          <p className="mt-0.5 text-[10px] text-muted">Use a shortcut or choose exact dates.</p>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            {
              label: "Today",
              range: () => {
                const today = inputDate(new Date());
                return [today, today] as const;
              },
            },
            {
              label: "This week",
              range: () => {
                const start = new Date();
                start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
                const end = new Date(start);
                end.setDate(end.getDate() + 6);
                return [inputDate(start), inputDate(end)] as const;
              },
            },
            {
              label: "This month",
              range: () => {
                const now = new Date();
                return [
                  inputDate(new Date(now.getFullYear(), now.getMonth(), 1)),
                  inputDate(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
                ] as const;
              },
            },
          ].map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => onChange(...preset.range())}
              className="h-8 border border-line bg-surface-2 px-2 text-[10px] font-semibold text-ink-soft hover:border-brand-strong hover:bg-brand-soft hover:text-brand-strong"
            >
              {preset.label}
            </button>
          ))}
        </div>
        <Calendar mode="range" defaultMonth={fromDate} selected={fromDate ? { from: fromDate, to: toDate } : undefined} onSelect={(range) => onChange(range?.from ? inputDate(range.from) : "", range?.to ? inputDate(range.to) : "")} />
        <button type="button" onClick={() => onChange("", "")} className="h-9 w-full rounded-lg border border-line text-xs font-semibold text-ink-soft hover:bg-surface-2">Clear dates</button>
      </PopoverContent>
    </Popover>
  );
}
