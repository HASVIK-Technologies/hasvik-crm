import type { BusinessKpiParams, BusinessQueryParams } from "@/types/business-api";
import type { FollowUpFilters } from "@/types/follow-up";

export const businessQueryKeys = {
  all: ["businesses"] as const,
  lists: () => [...businessQueryKeys.all, "list"] as const,
  list: (params: BusinessQueryParams) =>
    [...businessQueryKeys.lists(), params] as const,
  detail: (id?: string) => [...businessQueryKeys.all, "detail", id] as const,
  kpis: (params: BusinessKpiParams) =>
    [...businessQueryKeys.all, "kpis", params] as const,
  statuses: () => [...businessQueryKeys.all, "statuses"] as const,
  categoryAutocomplete: (search: string) =>
    [...businessQueryKeys.all, "category-autocomplete", search] as const,
  cityAutocomplete: (search: string) =>
    [...businessQueryKeys.all, "city-autocomplete", search] as const,
  categories: () => ["categories"] as const,
  categoryOptions: (search: string) =>
    [...businessQueryKeys.categories(), "autocomplete", search] as const,
};

export const followUpQueryKeys = {
  all: ["follow-ups"] as const,
  lists: () => [...followUpQueryKeys.all, "list"] as const,
  list: (filters: FollowUpFilters) =>
    [...followUpQueryKeys.lists(), filters] as const,
  kpis: (params?: Partial<FollowUpFilters>) =>
    [...followUpQueryKeys.all, "kpis", params] as const,
  detail: (id?: string) => [...followUpQueryKeys.all, "detail", id] as const,
  statuses: () => [...followUpQueryKeys.all, "statuses"] as const,
  autocomplete: (path: string, search: string) =>
    [...followUpQueryKeys.all, "autocomplete", path, search] as const,
  byBusiness: (businessId?: string) =>
    [...followUpQueryKeys.all, "business", businessId] as const,
  byUser: (userId?: string) =>
    [...followUpQueryKeys.all, "user", userId] as const,
};
