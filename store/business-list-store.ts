"use client";

import { create } from "zustand";
import {
  BusinessListStateFilters,
  DEFAULT_BUSINESS_QUERY,
} from "@/lib/business-query-builder";

export interface BusinessListStoreState extends BusinessListStateFilters {
  showStats: boolean;

  // Actions
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setSortBy: (sortBy: string) => void;
  setSearch: (search: string) => void;
  setCategory: (categoryId: string, categoryName?: string) => void;
  setCity: (city: string) => void;
  setStatus: (status: string) => void;
  setIsDeleted: (isDeleted: boolean | undefined) => void;
  toggleStats: () => void;
  resetAllFilters: () => void;
  syncFromParams: (filters: Partial<BusinessListStateFilters>) => void;
}

export const useBusinessListStore = create<BusinessListStoreState>((set) => ({
  page: DEFAULT_BUSINESS_QUERY.page,
  limit: DEFAULT_BUSINESS_QUERY.limit,
  sortBy: DEFAULT_BUSINESS_QUERY.sortBy,
  search: DEFAULT_BUSINESS_QUERY.search,
  categoryId: DEFAULT_BUSINESS_QUERY.categoryId,
  categoryName: DEFAULT_BUSINESS_QUERY.categoryName,
  city: DEFAULT_BUSINESS_QUERY.city,
  status: DEFAULT_BUSINESS_QUERY.status,
  isDeleted: DEFAULT_BUSINESS_QUERY.isDeleted,
  showStats: true,

  // Rule: Pagination: change page only; preserve filters/search/sort/limit
  setPage: (page: number) => set({ page }),

  // Rule: Page-size change: reset page=1 and use new limit
  setLimit: (limit: number) => set({ limit, page: 1 }),

  // Rule: Sorting: reset page=1 and use sortBy=-createdAt or +createdAt
  setSortBy: (sortBy: string) => set({ sortBy, page: 1 }),

  // Rule: Any filter/search change: reset page=1
  setSearch: (search: string) => set({ search, page: 1 }),

  setCategory: (categoryId: string, categoryName?: string) =>
    set({
      categoryId,
      categoryName: categoryName ?? (categoryId ? categoryName : ""),
      page: 1,
    }),

  setCity: (city: string) => set({ city, page: 1 }),

  setStatus: (status: string) => set({ status, page: 1 }),

  setIsDeleted: (isDeleted: boolean | undefined) =>
    set({ isDeleted, page: 1 }),

  toggleStats: () => set((state) => ({ showStats: !state.showStats })),

  resetAllFilters: () =>
    set({
      search: "",
      categoryId: "",
      categoryName: "",
      city: "",
      status: "",
      isDeleted: undefined,
      page: 1,
    }),

  syncFromParams: (params: Partial<BusinessListStateFilters>) =>
    set((state) => ({
      ...state,
      ...params,
    })),
}));
