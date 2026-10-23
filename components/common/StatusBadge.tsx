import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";
import { getLeadStatusLabel, LEAD_STATUS_VISUALS } from "@/lib/business/form-options";

const statusStyles: Record<string, string> = {
  ACTIVE: "bg-brand-green/10 text-brand-green-strong",
  COMPLETED: "bg-brand-green/10 text-brand-green-strong",
  TODAY: "bg-brand-green/10 text-brand-green-strong",
  INACTIVE: "bg-slate-100 text-slate-600",
  CANCELLED: "bg-slate-100 text-slate-600",
  NONE: "bg-slate-100 text-slate-600",
  SCHEDULED: "bg-primary/10 text-primary",
  TOMORROW: "bg-primary/10 text-primary",
  DATE: "bg-primary/10 text-primary",
  OVERDUE: "bg-rose-50 text-rose-700",
  ...Object.fromEntries(
    Object.entries(LEAD_STATUS_VISUALS).map(([status, visual]) => [status, visual.badge]),
  ),
};

function formatStatus(status: string) {
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
        "border font-semibold hover:bg-inherit",
        statusStyles[normalizedStatus] ?? "bg-slate-100 text-slate-700",
        className,
      )}
      {...props}
    >
      {label ?? formatStatus(status)}
    </Badge>
  );
}
