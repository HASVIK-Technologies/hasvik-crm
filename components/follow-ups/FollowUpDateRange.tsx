"use client";

import { CalendarDays, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface FollowUpDateRangeProps {
  from?: string;
  to?: string;
  onChange: (from: string, to: string) => void;
}

function display(value: string) {
  return value
    ? new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(new Date(`${value}T00:00:00`))
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
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-10 w-full items-center justify-between border border-slate-300 bg-white px-3 text-left text-xs font-medium text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.05)] hover:border-slate-400 focus-visible:border-brand-blue focus-visible:ring-2 focus-visible:ring-brand-blue/15"
        >
          <span className="flex min-w-0 items-center gap-2">
            <CalendarDays className="size-3.5 shrink-0 text-[#64748b]" />
            <span className="truncate">
              {from || to
                ? `${display(from) || "Start"} - ${display(to) || "End"}`
                : "Date range"}
            </span>
          </span>
          {from || to ? (
            <X
              className="size-3.5 text-[#94a3b8]"
              onClick={(event) => {
                event.stopPropagation();
                onChange("", "");
              }}
            />
          ) : null}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-72 space-y-4 border border-slate-200 bg-white p-4 shadow-xl"
      >
        <div>
          <p className="text-xs font-bold text-slate-900">Date range</p>
          <p className="mt-0.5 text-[10px] text-slate-500">Use a shortcut or choose exact dates.</p>
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
              className="h-8 border border-slate-200 bg-slate-50 px-2 text-[10px] font-semibold text-slate-600 hover:border-brand-blue hover:bg-blue-50 hover:text-brand-blue"
            >
              {preset.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1 text-[11px] font-semibold text-[#475569]">
            From
            <Input
              type="date"
              value={from}
              max={to || undefined}
              onChange={(event) => onChange(event.target.value, to)}
              className="mt-1 h-9 text-xs"
            />
          </label>
          <label className="space-y-1 text-[11px] font-semibold text-[#475569]">
            To
            <Input
              type="date"
              value={to}
              min={from || undefined}
              onChange={(event) => onChange(from, event.target.value)}
              className="mt-1 h-9 text-xs"
            />
          </label>
        </div>
      </PopoverContent>
    </Popover>
  );
}
