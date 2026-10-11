import { apiClient } from "@/lib/api/api-client";
import type {
  CreateUserPayload,
  UpdateUserPayload,
  UserRecord,
  UserRole,
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
  params?: {
    search?: string;
    role?: UserRole | "ALL";
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  },
) {
  const response = await apiClient.get<CollectionPayload<UserRecord>>("/users", {
    params: {
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
      sortBy: params?.sortBy ?? "fullName",
      sortOrder: params?.sortOrder ?? "asc",
      ...(params?.search?.trim() ? { search: params.search.trim() } : {}),
      ...(params?.role && params.role !== "ALL" ? { role: params.role } : {}),
    },
    signal,
  });
  return readUsers(response.data);
}

export async function createUser(payload: CreateUserPayload) {
  const response = await apiClient.post<UserRecord>("/users", payload);
  return response.data;
}

export async function updateUser(id: string, payload: UpdateUserPayload) {
  const response = await apiClient.patch<UserRecord>(`/users/${id}`, payload);
  return response.data;
}

export async function deleteUser(id: string) {
  const response = await apiClient.delete(`/users/${id}`);
  return response.data;
}
