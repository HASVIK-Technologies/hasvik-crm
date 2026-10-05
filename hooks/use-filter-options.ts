"use client";

import { useQuery } from "@tanstack/react-query";
import { getBusinessStatuses, getCategoryAutocomplete, getCityAutocomplete } from "@/lib/filters/api";

export const filterQueryKeys = {
  categories: (search: string) => ["filters", "categories", search] as const,
  cities: (search: string) => ["filters", "cities", search] as const,
  statuses: ["filters", "statuses"] as const,
};

export function useCategoryAutocomplete(search: string, enabled = true) {
  return useQuery({
    queryKey: filterQueryKeys.categories(search),
    queryFn: ({ signal }) => getCategoryAutocomplete(search, signal),
    enabled,
    staleTime: 60_000,
  });
}

export function useCityAutocomplete(search: string, enabled = true) {
  return useQuery({
    queryKey: filterQueryKeys.cities(search),
    queryFn: ({ signal }) => getCityAutocomplete(search, signal),
    enabled,
    staleTime: 60_000,
  });
}

export function useBusinessStatuses() {
  return useQuery({
    queryKey: filterQueryKeys.statuses,
    queryFn: ({ signal }) => getBusinessStatuses(signal),
    staleTime: 5 * 60 * 1000,
  });
}