import type { SubscriptionStatus } from "@/types/subscription";

export const SUBSCRIPTION_STATUS_VISUALS = {
  ACTIVE: { label: "Active", badge: "border-ok/30 bg-ok-soft text-ok", dot: "bg-ok", darkDot: "bg-ok/20", accent: "border-l-ok/30", top: "border-t-ok/30", icon: "bg-ok-soft text-ok" },
  PENDING: { label: "Pending", badge: "border-warn/30 bg-warn-soft text-warn", dot: "bg-warn", darkDot: "bg-warn/20", accent: "border-l-warn/30", top: "border-t-warn/30", icon: "bg-warn-soft text-warn" },
  EXPIRED: { label: "Expired", badge: "border-bad/30 bg-bad-soft text-bad", dot: "bg-bad", darkDot: "bg-bad/20", accent: "border-l-bad/30", top: "border-t-bad/30", icon: "bg-bad-soft text-bad" },
    SUSPENDED: { label: "Suspended", badge: "border-warn/70 bg-warn-soft text-warn", dot: "bg-warn/70", darkDot: "bg-warn/40", accent: "border-l-warn/70", top: "border-t-warn/70", icon: "bg-warn-soft text-warn" },
  CANCELLED: { label: "Cancelled", badge: "border-line bg-surface-2 text-ink-soft", dot: "bg-muted", darkDot: "bg-line", accent: "border-l-line", top: "border-t-line", icon: "bg-surface-2 text-ink-soft" },
    REJECTED: { label: "Rejected", badge: "border-bad/70 bg-bad-soft text-bad", dot: "bg-bad/70", darkDot: "bg-bad/40", accent: "border-l-bad/70", top: "border-t-bad/70", icon: "bg-bad-soft text-bad" },
} satisfies Record<SubscriptionStatus, { label: string; badge: string; dot: string; darkDot: string; accent: string; top: string; icon: string }>;

export function getSubscriptionStatusVisual(status?: string) {
  const key = status?.trim().toUpperCase() ?? "";
  return Object.prototype.hasOwnProperty.call(SUBSCRIPTION_STATUS_VISUALS, key)
    ? SUBSCRIPTION_STATUS_VISUALS[key as SubscriptionStatus]
    : { ...SUBSCRIPTION_STATUS_VISUALS.CANCELLED, label: "Unknown" };
}
