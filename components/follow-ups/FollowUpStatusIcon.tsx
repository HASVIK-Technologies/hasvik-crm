import { Clock3 } from "lucide-react";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  SCHEDULED: "border-sky-200 bg-sky-50 text-sky-700",
  COMPLETED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  CANCELLED: "border-slate-200 bg-slate-100 text-slate-600",
  CANCELED: "border-slate-200 bg-slate-100 text-slate-600",
  OVERDUE: "border-rose-200 bg-rose-50 text-rose-700",
};

export default function FollowUpStatusIcon({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const color = statusColors[status.trim().toUpperCase()] ?? "border-slate-200 bg-slate-50 text-slate-600";

  return (
    <span
      aria-hidden="true"
      className={cn("flex shrink-0 items-center justify-center rounded-full border", color, className)}
    >
      <Clock3 className="size-1/2" strokeWidth={2.25} />
    </span>
  );
}
