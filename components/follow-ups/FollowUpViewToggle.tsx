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
    <div className="flex border border-line bg-surface-2 p-0.5" aria-label="Follow-up view">
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
            aria-label={option.label}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex h-11 items-center gap-1.5 rounded-lg border px-3 sm:h-9 text-xs font-semibold transition-colors sm:gap-2 sm:px-3",
              active
                ? "border-line bg-surface text-brand-strong shadow-sm"
                : "border-transparent text-muted hover:bg-surface/70 hover:text-ink",
            )}
          >
            <Icon className="size-4" />
            <span className="hidden min-[420px]:inline sm:hidden">{option.value === "table" ? "List" : option.label}</span>
            <span className="hidden sm:inline">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
