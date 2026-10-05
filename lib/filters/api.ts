import { apiClient } from "@/lib/api/api-client";
import type { CategoryAutocompleteItem, CityAutocompleteItem } from "@/types/business-api";

export type BusinessStatusResponse = Record<string, string>;

export async function getCategoryAutocomplete(
  search: string,
  signal?: AbortSignal,
): Promise<CategoryAutocompleteItem[]> {
  const response = await apiClient.get<CategoryAutocompleteItem[]>(
    "/categories/autocomplete",
    { params: { search: search.trim() }, signal },
  );
  return Array.isArray(response.data) ? response.data : [];
}

export async function getCityAutocomplete(
  search: string,
  signal?: AbortSignal,
): Promise<CityAutocompleteItem[]> {
  const response = await apiClient.get<CityAutocompleteItem[]>(
    "/businesses/city/autocomplete",
    { params: { search: search.trim() }, signal },
  );
  return Array.isArray(response.data) ? response.data : [];
}

export async function getBusinessStatuses(
  signal?: AbortSignal,
): Promise<BusinessStatusResponse> {
  const response = await apiClient.get<BusinessStatusResponse>(
    "/businesses/status",
    { signal },
  );
  return response.data ?? {};
}