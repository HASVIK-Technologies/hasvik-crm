import type { Tenant, TenantResponse, TenantQueryParams, TenantsPage } from "@/types/tenant";

export type TenantCollectionResponse =
  | TenantResponse[]
  | { data: TenantResponse[]; total?: number };

export function normalizeTenant(tenant: TenantResponse): Tenant {
  const id = tenant.id ?? tenant._id;
  if (
    typeof id !== "string" ||
    typeof tenant.name !== "string" ||
    typeof tenant.isActive !== "boolean"
  ) {
    throw new Error("The tenants service returned an invalid tenant.");
  }

  return {
    id,
    name: tenant.name,
    fullName: tenant.fullName,
    contactEmail: tenant.contactEmail,
    contactPhone: tenant.contactPhone,
    isActive: tenant.isActive,
    createdAt: tenant.createdAt,
    updatedAt: tenant.updatedAt,
  };
}

function readTenants(payload: TenantCollectionResponse): Tenant[] {
  const items = Array.isArray(payload) ? payload : payload?.data;
  if (!Array.isArray(items)) {
    throw new Error("The tenants service returned an invalid list.");
  }
  return items.map(normalizeTenant);
}

export function readTenantsPage(payload: TenantCollectionResponse): TenantsPage {
  const data = readTenants(payload);
  return { data, total: !Array.isArray(payload) && typeof payload.total === "number" ? payload.total : data.length };
}

export async function collectTenantPages(fetchPage: (params: TenantQueryParams) => Promise<TenantsPage>): Promise<Tenant[]> {
  const groups = await Promise.all([true, false].map(async (isActive) => {
    const limit = 100;
    const first = await fetchPage({ page: 1, limit, isActive });
    const rows = new Map(first.data.map((tenant) => [tenant.id, tenant]));
    for (let page = 2; rows.size < first.total; page++) {
      const next = await fetchPage({ page, limit, isActive });
      if (!next.data.length) break;
      const previousSize = rows.size;
      next.data.forEach((tenant) => rows.set(tenant.id, tenant));
      if (rows.size === previousSize) throw new Error("Tenant pagination did not advance. Please try again.");
    }
    return [...rows.values()];
  }));
  return [...new Map(groups.flat().map((tenant) => [tenant.id, tenant])).values()];
}
