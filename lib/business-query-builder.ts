import type { BusinessQueryParams, BusinessKpiParams } from "@/types/business-api";

export interface BusinessListStateFilters {
  page: number;
  limit: number;
  sortBy: string; // "-createdAt" or "+createdAt"
  search: string;
  categoryId: string;
  categoryName?: string; // used for UI display in dropdown
  city: string;
  status: string;
  isDeleted?: boolean; // undefined = All, false = Active, true = Inactive
}

export const DEFAULT_BUSINESS_QUERY: BusinessListStateFilters = {
  page: 1,
  limit: 20,
  sortBy: "-createdAt",
  search: "",
  categoryId: "",
  categoryName: "",
  city: "",
  status: "",
  isDeleted: undefined,
};

/**
 * Builds clean, server-side query params for GET /api/businesses
 * Preserves: page, limit, sortBy, search, categoryId, city, status, isDeleted
 */
export function buildBusinessListParams(
  filters: Partial<BusinessListStateFilters>,
): BusinessQueryParams {
  const params: BusinessQueryParams = {
    page: filters.page && filters.page > 0 ? filters.page : DEFAULT_BUSINESS_QUERY.page,
    limit: filters.limit && filters.limit > 0 ? filters.limit : DEFAULT_BUSINESS_QUERY.limit,
    sortBy: filters.sortBy || DEFAULT_BUSINESS_QUERY.sortBy,
  };

  if (filters.search && filters.search.trim()) {
    // Rule: lowercase search string
    params.search = filters.search.trim().toLowerCase();
  }

  if (filters.categoryId && filters.categoryId.trim()) {
    params.categoryId = filters.categoryId.trim();
  }

  if (filters.city && filters.city.trim() && filters.city !== "All Cities") {
    params.city = filters.city.trim();
  }

  if (filters.status && filters.status.trim() && filters.status !== "All Status") {
    params.status = filters.status.trim();
  }

  if (typeof filters.isDeleted === "boolean") {
    params.isDeleted = filters.isDeleted;
  }

  return params;
}

/**
 * Builds query params for GET /api/businesses/kpis
 * Passes current search/filter params: search, status, categoryId, city, isDeleted
 */
export function buildBusinessKpiParams(
  filters: Partial<BusinessListStateFilters>,
): BusinessKpiParams {
  const params: BusinessKpiParams = {};

  if (filters.search && filters.search.trim()) {
    params.search = filters.search.trim().toLowerCase();
  }

  if (filters.categoryId && filters.categoryId.trim()) {
    params.categoryId = filters.categoryId.trim();
  }

  if (filters.city && filters.city.trim() && filters.city !== "All Cities") {
    params.city = filters.city.trim();
  }

  if (filters.status && filters.status.trim() && filters.status !== "All Status") {
    params.status = filters.status.trim();
  }

  if (typeof filters.isDeleted === "boolean") {
    params.isDeleted = filters.isDeleted;
  }

  return params;
}

/**
 * Serializes current filters into URLSearchParams
 */
export function filtersToSearchParams(
  filters: BusinessListStateFilters,
): URLSearchParams {
  const sp = new URLSearchParams();

  if (filters.page && filters.page > 1) {
    sp.set("page", String(filters.page));
  }

  if (filters.limit && filters.limit !== DEFAULT_BUSINESS_QUERY.limit) {
    sp.set("limit", String(filters.limit));
  }

  if (filters.sortBy && filters.sortBy !== DEFAULT_BUSINESS_QUERY.sortBy) {
    sp.set("sortBy", filters.sortBy);
  }

  if (filters.search && filters.search.trim()) {
    sp.set("search", filters.search.trim().toLowerCase());
  }

  if (filters.categoryId && filters.categoryId.trim()) {
    sp.set("categoryId", filters.categoryId.trim());
    if (filters.categoryName) {
      sp.set("categoryName", filters.categoryName);
    }
  }

  if (filters.city && filters.city.trim() && filters.city !== "All Cities") {
    sp.set("city", filters.city.trim());
  }

  if (filters.status && filters.status.trim() && filters.status !== "All Status") {
    sp.set("status", filters.status.trim());
  }

  if (typeof filters.isDeleted === "boolean") {
    sp.set("isDeleted", String(filters.isDeleted));
  }

  return sp;
}

/**
 * Parses URLSearchParams into BusinessListStateFilters
 */
export function searchParamsToFilters(
  sp: URLSearchParams | { [key: string]: string | string[] | undefined },
): BusinessListStateFilters {
  const getParam = (key: string): string | undefined => {
    if (sp instanceof URLSearchParams) {
      return sp.get(key) ?? undefined;
    }
    const val = sp[key];
    return Array.isArray(val) ? val[0] : val;
  };

  const pageVal = Number.parseInt(getParam("page") || "", 10);
  const limitVal = Number.parseInt(getParam("limit") || "", 10);
  const isDeletedRaw = getParam("isDeleted");

  let isDeleted: boolean | undefined = undefined;
  if (isDeletedRaw === "true") isDeleted = true;
  else if (isDeletedRaw === "false") isDeleted = false;

  return {
    page: !isNaN(pageVal) && pageVal > 0 ? pageVal : DEFAULT_BUSINESS_QUERY.page,
    limit: !isNaN(limitVal) && limitVal > 0 ? limitVal : DEFAULT_BUSINESS_QUERY.limit,
    sortBy: getParam("sortBy") || DEFAULT_BUSINESS_QUERY.sortBy,
    search: getParam("search") || "",
    categoryId: getParam("categoryId") || "",
    categoryName: getParam("categoryName") || "",
    city: getParam("city") || "",
    status: getParam("status") || "",
    isDeleted,
  };
}
