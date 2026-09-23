import { apiClient } from "@/lib/api-client";
import type { CategoryAutocompleteItem, CityAutocompleteItem } from "@/types/business-api";

export type BusinessStatusResponse = Record<string, string>;

export async function getCategoryAutocomplete(search: string): Promise<CategoryAutocompleteItem[]> {
  const response = await apiClient.get<CategoryAutocompleteItem[]>("/categories/autocomplete", { params: { search: search.trim() } });
  return Array.isArray(response.data) ? response.data : [];
}

export async function getCityAutocomplete(search: string): Promise<CityAutocompleteItem[]> {
  const response = await apiClient.get<CityAutocompleteItem[]>("/businesses/city/autocomplete", { params: { search: search.trim() } });
  return Array.isArray(response.data) ? response.data : [];
}

export async function getBusinessStatuses(): Promise<BusinessStatusResponse> {
  const response = await apiClient.get<BusinessStatusResponse>("/businesses/status");
  return response.data ?? {};
}