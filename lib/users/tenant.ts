import type { UserRecord } from "@/types/user";
import type { Tenant } from "@/types/tenant";

export function getUserTenant(user: UserRecord, tenants: Tenant[]) {
  const embedded = user.tenant ?? (typeof user.tenantId === "object" ? user.tenantId : null);
  const id = typeof user.tenantId === "string" ? user.tenantId : embedded?._id ?? embedded?.id;
  const resolved = tenants.find((tenant) => tenant.id === id);
  return {
    name: embedded?.name || resolved?.name || user.tenantName || (id ? "Tenant unavailable" : "No tenant"),
    isActive: embedded?.isActive ?? resolved?.isActive,
  };
}
