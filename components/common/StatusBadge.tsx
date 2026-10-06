import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

const statusStyles: Record<string, string> = {
  ACTIVE: "bg-brand-green/10 text-brand-green-strong",
  COMPLETED: "bg-brand-green/10 text-brand-green-strong",
  WON: "bg-brand-green/10 text-brand-green-strong",
  TODAY: "bg-brand-green/10 text-brand-green-strong",
  INACTIVE: "bg-slate-100 text-slate-600",
  CANCELLED: "bg-slate-100 text-slate-600",
  NONE: "bg-slate-100 text-slate-600",
  NEW: "bg-primary/10 text-primary",
  SCHEDULED: "bg-primary/10 text-primary",
  TOMORROW: "bg-primary/10 text-primary",
  DATE: "bg-primary/10 text-primary",
  CONTACTED: "bg-brand-cyan/10 text-primary",
  PROPOSAL_AND_NEGOTIATION: "bg-amber-50 text-amber-700",
  INTERESTED: "bg-orange-50 text-orange-700",
  OVERDUE: "bg-rose-50 text-rose-700",
  LOST: "bg-rose-50 text-rose-700",
};

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
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
        "border-0 font-semibold hover:bg-inherit",
        statusStyles[normalizedStatus] ?? "bg-slate-100 text-slate-700",
        className,
      )}
      {...props}
    >
      {label ?? formatStatus(status)}
    </Badge>
  );
}
