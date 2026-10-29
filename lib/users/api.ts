import { apiClient } from "@/lib/api/api-client";
import { useAuthStore } from "@/store/auth-store";
import { canEditManagedUser, isSuperAdmin } from "@/types/auth";
import { getTenant } from "@/lib/tenants/api";
import { getUserTenant } from "@/lib/users/tenant";
import { userRequestParams, userKpiRequestParams, type UserQueryParams, type UserKpiParams } from "@/lib/users/query-params";
import { canUpdateRecord } from "@/lib/records/activity";
import type {
  CreateUserPayload,
  UpdateUserPayload,
  UserRecord,
  UserKpis,
} from "@/types/user";

type CollectionPayload<T> =
  | T[]
  | { data: T[]; total?: number; page?: number; limit?: number };

export type UserListResult = { items: UserRecord[]; total: number };

function readUsers(payload: CollectionPayload<UserRecord>): UserListResult {
  if (Array.isArray(payload)) return { items: payload, total: payload.length };
  if (payload && Array.isArray(payload.data)) {
    return { items: payload.data, total: payload.total ?? payload.data.length };
  }
  throw new Error("The users service returned an invalid list.");
}

export async function getUsers(
  signal?: AbortSignal,
  params?: UserQueryParams,
) {
  const response = await apiClient.get<CollectionPayload<UserRecord>>("/users", {
    params: userRequestParams(params),
    signal,
  });
  return readUsers(response.data);
}

export async function createUser(payload: CreateUserPayload) {
  const response = await apiClient.post<UserRecord>("/users", payload);
  return response.data;
}

export async function getUserKpis(params?: UserKpiParams, signal?: AbortSignal): Promise<UserKpis> {
  const response = await apiClient.get<UserKpis | { data: UserKpis }>("/users/kpis", {
    params: userKpiRequestParams(params),
    signal,
  });
  const payload = response.data;
  const value = payload && "data" in payload ? payload.data : payload;
  if (!value || ![value.total, value.active, value.inactive].every((count) => Number.isInteger(count) && count >= 0)) {
    throw new Error("The users service returned invalid KPI counts.");
  }
  return { total: value.total, active: value.active, inactive: value.inactive };
}

export async function updateUser(id: string, payload: UpdateUserPayload, management = false) {
  const user = await assertUserWritable(id, payload);
  if (payload.isActive === false && (isSuperAdmin(user) || (payload.role && isSuperAdmin({ role: payload.role })))) {
    throw new Error("Super admin accounts cannot be deactivated.");
  }
  if (management) {
    const actor = useAuthStore.getState().user;
    if (!canEditManagedUser(actor, user) || (payload.role && isSuperAdmin({ role: payload.role }) && !isSuperAdmin(actor))) {
      throw new Error("Only admins can update user details. Super admin accounts can only be updated by a super admin.");
    }
  }
  const response = await apiClient.patch<UserRecord>(`/users/${id}`, payload);
  return response.data;
}

export async function deleteUser(id: string) {
  const user = await assertUserWritable(id);
  if (isSuperAdmin(user)) throw new Error("Super admin accounts cannot be deactivated or deleted.");
  const response = await apiClient.delete(`/users/${id}`);
  return response.data;
}

async function assertUserWritable(id: string, payload: UpdateUserPayload = {}) {
  const response = await apiClient.get<UserRecord | { data: UserRecord }>(`/users/${id}`);
  const user = "data" in response.data ? response.data.data : response.data;
  if (!canUpdateRecord(user, { ...payload }) || getUserTenant(user, []).isActive === false) throw new Error("Inactive users are read-only except for activation. Inactive tenants must be activated first.");
  const tenantId = typeof user.tenantId === "string" ? user.tenantId : user.tenantId?._id ?? user.tenantId?.id ?? user.tenant?._id ?? user.tenant?.id;
  if (tenantId && (await getTenant(tenantId)).isActive === false) throw new Error("Activate this user's tenant before editing the user.");
  return user;
}
