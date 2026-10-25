import type { UserRole } from "@/types/user";

export interface UserQueryParams {
  search?: string;
  role?: UserRole | "ALL";
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  isActive?: boolean;
  tenantId?: string;
}

export function userRequestParams(params?: UserQueryParams) {
  return {
    page: params?.page ?? 1,
    limit: params?.limit ?? 10,
    sortBy: params?.sortBy ?? "fullName",
    sortOrder: params?.sortOrder ?? "asc",
    ...(params?.isActive !== undefined ? { isActive: params.isActive } : {}),
    ...(params?.tenantId?.trim() ? { tenantId: params.tenantId.trim() } : {}),
    ...(params?.search?.trim() ? { search: params.search.trim() } : {}),
    ...(params?.role && params.role !== "ALL" ? { role: params.role } : {}),
  };
}
