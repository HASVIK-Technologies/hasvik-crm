"use client";

import { Columns3, List } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { BusinessListView } from "@/store/business-list-store";

export type BusinessView = BusinessListView;

export default function BusinessViewToggle({
  value,
  onChange,
}: {
  value: BusinessView;
  onChange: (value: BusinessView) => void;
}) {
  return (
    <div
      className="inline-flex h-9 border border-slate-200 bg-slate-50 p-0.5"
      role="group"
      aria-label="Business view"
    >
      {([
        { value: "table" as const, label: "Table view", icon: List },
        { value: "kanban" as const, label: "Kanban view", icon: Columns3 },
      ]).map((option) => {
        const Icon = option.icon;
        const active = value === option.value;
        return (
          <Tooltip key={option.value}>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label={option.label}
                aria-pressed={active}
                onClick={() => onChange(option.value)}
                className={cn(
                  "inline-flex h-8 items-center gap-2 border px-3 text-xs font-semibold transition-colors",
                  active
                    ? "border-slate-200 bg-white text-brand-blue shadow-sm"
                    : "border-transparent text-slate-500 hover:text-slate-900",
                )}
              >
                <Icon className="size-4" />
                <span className="hidden min-[420px]:inline sm:hidden">{option.value === "table" ? "List" : "Pipeline"}</span>
                <span className="hidden sm:inline">{option.value === "table" ? "Table" : "Kanban"}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>{option.label}</TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
