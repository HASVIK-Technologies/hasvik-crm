import type { Subscription } from "@/types/subscription";

export function getSubscriptionTenantId(subscription: Subscription) {
  const tenant = subscription.tenantId ?? subscription.tenant;
  if (typeof tenant === "string") return tenant;
  return tenant?.id ?? tenant?._id ?? "";
}

export function hasCurrentSubscriptionAccess(subscription: Subscription) {
  const status = subscription.status?.toUpperCase();
  if (status === "ACTIVE") return true;
  if (status !== "CANCELLED") return false;
  if (!subscription.endDate) return true;
  const endTime = new Date(subscription.endDate).getTime();
  return Number.isNaN(endTime) || endTime > Date.now();
}
