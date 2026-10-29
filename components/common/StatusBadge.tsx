import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";
import { getLeadStatusLabel, LEAD_STATUS_VISUALS } from "@/lib/business/form-options";
import { FOLLOW_UP_STATUS_LABELS, formatFollowUpStatus } from "@/lib/follow-ups/status";
import { SUBSCRIPTION_STATUS_VISUALS } from "@/lib/subscriptions/status";

const statusStyles: Record<string, string> = {
  ...Object.fromEntries(Object.entries(SUBSCRIPTION_STATUS_VISUALS).map(([status, visual]) => [status, visual.badge])),
  COMPLETED: "border-emerald-200 bg-emerald-50 text-emerald-800",
  TODAY: "border-emerald-200 bg-emerald-50 text-emerald-800",
  INACTIVE: "border-slate-200 bg-slate-50 text-slate-600",
  NONE: "border-slate-200 bg-slate-50 text-slate-600",
  SCHEDULED: "border-sky-200 bg-sky-50 text-sky-800",
  TOMORROW: "border-sky-200 bg-sky-50 text-sky-800",
  DATE: "border-sky-200 bg-sky-50 text-sky-800",
  OVERDUE: "border-rose-200 bg-rose-50 text-rose-800",
  ...Object.fromEntries(
    Object.entries(LEAD_STATUS_VISUALS).map(([status, visual]) => [status, visual.badge]),
  ),
};

function formatStatus(status: string) {
  if (FOLLOW_UP_STATUS_LABELS[status.trim().toUpperCase()]) {
    return formatFollowUpStatus(status);
  }
  return getLeadStatusLabel(status);
}

export function StatusBadge({
  status,
  label,
  className,
  ...props
}: Omit<ComponentProps<typeof Badge>, "children"> & {
  status: string;
  label?: string;
}) {
  const normalizedStatus = status.trim().toUpperCase();

  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-md border px-2.5 py-1 text-[11px] font-semibold leading-none shadow-[0_1px_2px_rgba(15,23,42,0.06)] hover:bg-inherit",
        statusStyles[normalizedStatus] ?? "bg-slate-100 text-slate-700",
        className,
      )}
      {...props}
    >
      <span className="truncate">{label ?? formatStatus(status)}</span>
    </Badge>
  );
}
