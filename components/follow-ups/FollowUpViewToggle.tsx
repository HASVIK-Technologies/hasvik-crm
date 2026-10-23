"use client";

import { CalendarDays, List } from "lucide-react";
import { cn } from "@/lib/utils";

export type FollowUpView = "table" | "calendar";

export default function FollowUpViewToggle({
  value,
  onChange,
}: {
  value: FollowUpView;
  onChange: (view: FollowUpView) => void;
}) {
  return (
    <div className="flex border border-slate-200 bg-slate-50 p-0.5" aria-label="Follow-up view">
      {([
        { value: "table" as const, label: "Table", icon: List },
        { value: "calendar" as const, label: "Calendar", icon: CalendarDays },
      ]).map((option) => {
        const Icon = option.icon;
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex h-9 items-center gap-2 border px-3 text-xs font-semibold transition-colors",
              active
                ? "border-slate-200 bg-white text-brand-blue shadow-sm"
                : "border-transparent text-slate-500 hover:bg-white/70 hover:text-slate-800",
            )}
          >
            <Icon className="size-4" />
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
