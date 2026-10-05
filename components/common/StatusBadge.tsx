import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

const statusStyles: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700",
  COMPLETED: "bg-emerald-50 text-emerald-700",
  WON: "bg-emerald-50 text-emerald-700",
  TODAY: "bg-emerald-50 text-emerald-700",
  INACTIVE: "bg-slate-100 text-slate-600",
  CANCELLED: "bg-slate-100 text-slate-600",
  NONE: "bg-slate-100 text-slate-600",
  NEW: "bg-blue-50 text-blue-700",
  SCHEDULED: "bg-blue-50 text-blue-700",
  TOMORROW: "bg-blue-50 text-blue-700",
  DATE: "bg-blue-50 text-blue-700",
  CONTACTED: "bg-sky-50 text-sky-700",
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
