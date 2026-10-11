import { apiClient } from "@/lib/api/api-client";
import type {
  CreateTenantPayload,
  Tenant,
  TenantResponse,
  UpdateTenantPayload,
} from "@/types/tenant";

type TenantCollectionResponse =
  | TenantResponse[]
  | { data: TenantResponse[] };

function normalizeTenant(tenant: TenantResponse): Tenant {
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

export async function getTenants(signal?: AbortSignal): Promise<Tenant[]> {
  const response = await apiClient.get<TenantCollectionResponse>("/tenants", {
    signal,
  });
  return readTenants(response.data);
}

export async function createTenant(payload: CreateTenantPayload): Promise<void> {
  await apiClient.post("/tenants", payload);
}

export async function updateTenant(
  id: string,
  payload: UpdateTenantPayload,
): Promise<void> {
  await apiClient.patch(`/tenants/${id}`, payload);
}

export async function updateTenantStatus(
  id: string,
  isActive: boolean,
): Promise<void> {
  await apiClient.patch(`/tenants/${id}/status`, { isActive });
}
