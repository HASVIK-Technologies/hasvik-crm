import type { ComponentProps } from "react";
import { getSubscriptionStatusVisual } from "@/lib/subscriptions/status";
import { cn } from "@/lib/utils";

export default function SubscriptionStatusBadge({ status, label, className, ...props }: ComponentProps<"span"> & { status?: string; label?: string }) {
  const visual = getSubscriptionStatusVisual(status);
  return <span {...props} className={cn("inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border px-2 py-1 text-[10px] font-semibold", visual.badge, className)}><span aria-hidden="true" className={cn("size-1.5 shrink-0 rounded-full", visual.dot)} />{label ?? visual.label}</span>;
}
