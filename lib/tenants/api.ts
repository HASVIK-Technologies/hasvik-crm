import { collectTenantPages, normalizeTenant, readTenantsPage, type TenantCollectionResponse } from "@/lib/tenants/pagination";
import { apiClient } from "@/lib/api/api-client";
import type {
  CreateTenantPayload,
  Tenant,
  TenantResponse,
  TenantQueryParams,
  TenantsPage,
  UpdateTenantPayload,
} from "@/types/tenant";

export async function getTenant(
  id: string,
  signal?: AbortSignal,
): Promise<Tenant> {
  const response = await apiClient.get<TenantResponse | { data: TenantResponse }>(
    `/tenants/${id}`,
    { signal },
  );
  const tenant =
    response.data && "data" in response.data
      ? response.data.data
      : response.data;
  return normalizeTenant(tenant);
}

export async function getTenantsPage(params: TenantQueryParams, signal?: AbortSignal): Promise<TenantsPage> {
  const response = await apiClient.get<TenantCollectionResponse>("/tenants", {
    params: { page: 1, limit: 10, ...params },
    signal,
  });
  return readTenantsPage(response.data);
}

// Global search/sorting and subscription name lookups need the complete set.
// Query both statuses explicitly: Swagger documents an active-only default.
export async function getTenants(signal?: AbortSignal): Promise<Tenant[]> {
  return collectTenantPages((params) => getTenantsPage(params, signal));
}

export async function createTenant(payload: CreateTenantPayload): Promise<void> {
  await apiClient.post("/tenants", payload);
}

export async function updateTenant(
  id: string,
  payload: UpdateTenantPayload,
): Promise<void> {
  if (!(await getTenant(id)).isActive) throw new Error("Activate this tenant before editing it.");
  await apiClient.patch(`/tenants/${id}`, payload);
}

export async function updateTenantStatus(
  id: string,
  isActive: boolean,
): Promise<void> {
  await apiClient.patch(`/tenants/${id}/status`, { isActive });
}
