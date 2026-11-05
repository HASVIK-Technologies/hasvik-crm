import type { SubscriptionStatus } from "@/types/subscription";

export const SUBSCRIPTION_STATUS_VISUALS = {
  ACTIVE: { label: "Active", badge: "border-emerald-200 bg-emerald-50 text-emerald-800", dot: "bg-emerald-600", darkDot: "bg-emerald-300", accent: "border-l-emerald-300", top: "border-t-emerald-300", icon: "bg-emerald-50 text-emerald-700" },
  PENDING: { label: "Pending", badge: "border-amber-200 bg-amber-50 text-amber-800", dot: "bg-amber-600", darkDot: "bg-amber-300", accent: "border-l-amber-300", top: "border-t-amber-300", icon: "bg-amber-50 text-amber-700" },
  EXPIRED: { label: "Expired", badge: "border-red-200 bg-red-50 text-red-800", dot: "bg-red-600", darkDot: "bg-red-300", accent: "border-l-red-300", top: "border-t-red-300", icon: "bg-red-50 text-red-700" },
  SUSPENDED: { label: "Suspended", badge: "border-orange-200 bg-orange-50 text-orange-800", dot: "bg-orange-600", darkDot: "bg-orange-300", accent: "border-l-orange-300", top: "border-t-orange-300", icon: "bg-orange-50 text-orange-700" },
  CANCELLED: { label: "Cancelled", badge: "border-slate-300 bg-slate-100 text-slate-700", dot: "bg-slate-500", darkDot: "bg-slate-300", accent: "border-l-slate-300", top: "border-t-slate-300", icon: "bg-slate-100 text-slate-700" },
  REJECTED: { label: "Rejected", badge: "border-rose-200 bg-rose-50 text-rose-800", dot: "bg-rose-600", darkDot: "bg-rose-300", accent: "border-l-rose-300", top: "border-t-rose-300", icon: "bg-rose-50 text-rose-700" },
} satisfies Record<SubscriptionStatus, { label: string; badge: string; dot: string; darkDot: string; accent: string; top: string; icon: string }>;

export function getSubscriptionStatusVisual(status?: string) {
  const key = status?.trim().toUpperCase() ?? "";
  return Object.prototype.hasOwnProperty.call(SUBSCRIPTION_STATUS_VISUALS, key)
    ? SUBSCRIPTION_STATUS_VISUALS[key as SubscriptionStatus]
    : { ...SUBSCRIPTION_STATUS_VISUALS.CANCELLED, label: "Unknown" };
}
