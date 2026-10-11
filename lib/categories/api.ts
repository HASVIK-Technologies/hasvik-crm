import { apiClient } from "@/lib/api/api-client";
import type { BusinessCategory, CategoryPayload } from "@/types/category";

type CollectionPayload<T> =
  | T[]
  | { data: T[]; total?: number; page?: number; limit?: number };

export type CategoryListResult = {
  items: BusinessCategory[];
  total: number;
};

function readCategories(
  payload: CollectionPayload<BusinessCategory>,
): CategoryListResult {
  if (Array.isArray(payload)) return { items: payload, total: payload.length };
  if (payload && Array.isArray(payload.data)) {
    return { items: payload.data, total: payload.total ?? payload.data.length };
  }
  throw new Error("The categories service returned an invalid list.");
}

export async function getBusinessCategories(
  signal?: AbortSignal,
  search?: string,
  isActive?: boolean,
  page = 1,
  limit = 10,
  sortBy = "name",
  sortOrder: "asc" | "desc" = "asc",
) {
  const response = await apiClient.get<CollectionPayload<BusinessCategory>>(
    "/categories",
    {
      params: {
        page,
        limit,
        sortBy,
        sortOrder,
        ...(search?.trim() ? { search: search.trim() } : {}),
        ...(isActive === undefined ? {} : { isActive }),
      },
      signal,
    },
  );
  return readCategories(response.data);
}

export async function createBusinessCategory(payload: CategoryPayload) {
  const response = await apiClient.post<BusinessCategory>("/categories", payload);
  return response.data;
}

export async function updateBusinessCategory(
  id: string,
  payload: Partial<CategoryPayload>,
) {
  const response = await apiClient.patch<BusinessCategory>(
    `/categories/${id}`,
    payload,
  );
  return response.data;
}

export async function setBusinessCategoryStatus(id: string, isActive: boolean) {
  const response = await apiClient.patch<BusinessCategory>(
    `/categories/${id}/status`,
    { isActive },
  );
  return response.data;
}
