import type { AuditEntityType } from "@/types/audit-log";

const entityRoots: Record<AuditEntityType, string> = {
  TENANT: "tenants", BUSINESS: "businesses", FOLLOWUP: "follow-ups",
  CATEGORY: "business-category-management", SUBSCRIPTION: "subscriptions", USER: "users",
};

// Share each entity's cache prefix so successful mutations invalidate its history.
export const auditLogQueryKeys = {
  entity: (entityType: AuditEntityType, entityId: string) =>
    [entityRoots[entityType], "activity", entityId] as const,
};
