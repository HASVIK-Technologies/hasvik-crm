"use client";

import { create } from "zustand";
import {
  BusinessListStateFilters,
  DEFAULT_BUSINESS_QUERY,
} from "@/lib/business/query-builder";

export interface BusinessListStoreState extends BusinessListStateFilters {
  showStats: boolean;
  showFilters: boolean;
  view: BusinessListView;
  kanbanScrollLeft: number;
  highlightedBusinessId: string | null;
  highlightRevision: number;
  scrollToHighlightedBusiness: boolean;

  // Actions
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setSortBy: (sortBy: string) => void;
  setSearch: (search: string) => void;
  setCategory: (categoryId: string, categoryName?: string) => void;
  setCity: (city: string) => void;
  setStatus: (status: string) => void;
  setIsActive: (isActive: boolean | undefined) => void;
  toggleStats: () => void;
  toggleFilters: () => void;
  setView: (view: BusinessListView) => void;
  setKanbanScrollLeft: (scrollLeft: number) => void;
  highlightBusiness: (id: string | number, scrollToItem?: boolean) => void;
  clearBusinessHighlight: (revision: number) => void;
  resetAllFilters: () => void;
  syncFromParams: (filters: Partial<BusinessListStateFilters>) => void;
}

export type BusinessListView = "table" | "kanban";

export const useBusinessListStore = create<BusinessListStoreState>((set) => ({
  page: DEFAULT_BUSINESS_QUERY.page,
  limit: DEFAULT_BUSINESS_QUERY.limit,
  sortBy: DEFAULT_BUSINESS_QUERY.sortBy,
  search: DEFAULT_BUSINESS_QUERY.search,
  categoryId: DEFAULT_BUSINESS_QUERY.categoryId,
  categoryName: DEFAULT_BUSINESS_QUERY.categoryName,
  city: DEFAULT_BUSINESS_QUERY.city,
  status: DEFAULT_BUSINESS_QUERY.status,
  isActive: DEFAULT_BUSINESS_QUERY.isActive,
  showStats: true,
  showFilters: true,
  view: "table",
  kanbanScrollLeft: 0,
  highlightedBusinessId: null,
  highlightRevision: 0,
  scrollToHighlightedBusiness: false,

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

  setIsActive: (isActive: boolean | undefined) =>
    set({ isActive, page: 1 }),

  toggleStats: () => set((state) => ({ showStats: !state.showStats })),

  toggleFilters: () => set((state) => ({ showFilters: !state.showFilters })),

  setView: (view) => set({ view }),

  setKanbanScrollLeft: (kanbanScrollLeft) => set({ kanbanScrollLeft }),

  highlightBusiness: (id, scrollToItem = false) =>
    set((state) => ({
      highlightedBusinessId: String(id),
      highlightRevision: state.highlightRevision + 1,
      scrollToHighlightedBusiness: scrollToItem,
    })),

  clearBusinessHighlight: (revision) =>
    set((state) =>
      state.highlightRevision === revision
        ? { highlightedBusinessId: null, scrollToHighlightedBusiness: false }
        : state,
    ),

  resetAllFilters: () =>
    set({
      search: "",
      categoryId: "",
      categoryName: "",
      city: "",
      status: "",
      isActive: undefined,
      page: 1,
    }),

  syncFromParams: (params: Partial<BusinessListStateFilters>) =>
    set((state) => ({
      ...state,
      ...params,
    })),
}));
