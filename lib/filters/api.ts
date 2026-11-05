import { apiClient } from "@/lib/api/api-client";
import { formatLeadStatus } from "@/lib/business/form-options";
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
  const response = await apiClient.get<BusinessStatusResponse | string[]>(
    "/businesses/status",
    { signal },
  );
  const raw = response.data as { data?: unknown } | unknown;
  const payload =
    raw && typeof raw === "object" && "data" in (raw as Record<string, unknown>) && (raw as { data: unknown }).data !== undefined
      ? (raw as { data: unknown }).data
      : raw;

  if (Array.isArray(payload)) {
    return Object.fromEntries(
      payload
        .filter((s): s is string => typeof s === "string" && Boolean(s.trim()))
        .map((status) => [status.trim(), formatLeadStatus(status)]),
    );
  }

  if (payload && typeof payload === "object") {
    return Object.fromEntries(
      Object.entries(payload).map(([key, label]) => [
        key,
        formatLeadStatus(typeof label === "string" && label.trim() !== key ? label : key),
      ]),
    );
  }

  return {};
}