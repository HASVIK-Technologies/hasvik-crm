import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";
import { getLeadStatusLabel, LEAD_STATUS_VISUALS } from "@/lib/business/form-options";
import { FOLLOW_UP_STATUS_LABELS, formatFollowUpStatus } from "@/lib/follow-ups/status";
import { SUBSCRIPTION_STATUS_VISUALS } from "@/lib/subscriptions/status";

const statusStyles: Record<string, string> = {
  ...Object.fromEntries(Object.entries(SUBSCRIPTION_STATUS_VISUALS).map(([status, visual]) => [status, visual.badge])),
  COMPLETED: "border-ok/30 bg-ok-soft text-ok",
  TODAY: "border-ok/30 bg-ok-soft text-ok",
  INACTIVE: "border-line bg-surface-2 text-ink-soft",
  NONE: "border-line bg-surface-2 text-ink-soft",
  SCHEDULED: "border-brand/40 bg-brand-soft text-brand-strong",
  TOMORROW: "border-brand/40 bg-brand-soft text-brand-strong",
  DATE: "border-brand/40 bg-brand-soft text-brand-strong",
  OVERDUE: "border-bad/30 bg-bad-soft text-bad",
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
        "rounded-xl border px-2.5 py-1 text-[11px] font-semibold leading-none shadow-card hover:bg-inherit",
        statusStyles[normalizedStatus] ?? "bg-surface-2 text-ink-soft",
        className,
      )}
      {...props}
    >
      <span className="truncate">{label ?? formatStatus(status)}</span>
    </Badge>
  );
}
