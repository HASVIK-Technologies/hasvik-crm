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
          className="flex h-10 w-full items-center justify-between rounded-xl border border-[#e2e8f0] bg-white px-3 text-left text-xs font-medium text-[#334155]"
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
        className="w-72 space-y-3 rounded-2xl bg-white p-4"
      >
        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1 text-[11px] font-semibold text-[#475569]">
            From
            <Input
              type="date"
              value={from}
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
