import type { Subscription } from "@/types/subscription";

function readId(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const candidate = record.id ?? record._id ?? record.$oid;
    return typeof candidate === "string" ? candidate : "";
  }
  return "";
}

export function getSubscriptionId(subscription: Subscription) {
  return (
    readId(subscription._id) ||
    readId(subscription.id) ||
    readId(subscription.subscriptionId)
  );
}

export function getSubscriptionTenantId(subscription: Subscription) {
  const tenant = subscription.tenantId ?? subscription.tenant;
  if (typeof tenant === "string") return tenant;
  return tenant?.id ?? tenant?._id ?? "";
}

export function hasCurrentSubscriptionAccess(subscription: Subscription, now = Date.now()) {
  const status = subscription.status?.toUpperCase();
  if (status !== "ACTIVE" && status !== "CANCELLED") return false;
  if (subscription.startDate) {
    const startTime = Date.parse(subscription.startDate);
    if (!Number.isFinite(startTime) || startTime > now) return false;
  }
  if (!subscription.endDate) return true;
  const endTime = new Date(subscription.endDate).getTime();
  return Number.isFinite(endTime) && endTime > now;
}
