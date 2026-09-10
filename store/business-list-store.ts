"use client";

import { create } from "zustand";

type BusinessListState = {
  searchTerm: string;
  selectedCategory: string;
  selectedStatus: string;
  selectedCity: string;
  sortOrder: "Latest First" | "Oldest First";
  page: number;
  limit: number;
  showStats: boolean;
  setSearchTerm: (searchTerm: string) => void;
  setSelectedCategory: (selectedCategory: string) => void;
  setSelectedStatus: (selectedStatus: string) => void;
  setSelectedCity: (selectedCity: string) => void;
  setSortOrder: (sortOrder: BusinessListState["sortOrder"]) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  toggleStats: () => void;
};

const resetPage = { page: 1 };

export const useBusinessListStore = create<BusinessListState>((set) => ({
  searchTerm: "",
  selectedCategory: "All Categories",
  selectedStatus: "All Status",
  selectedCity: "All Cities",
  sortOrder: "Latest First",
  page: 1,
  limit: 10,
  showStats: true,
  setSearchTerm: (searchTerm) => set({ searchTerm, ...resetPage }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory, ...resetPage }),
  setSelectedStatus: (selectedStatus) => set({ selectedStatus, ...resetPage }),
  setSelectedCity: (selectedCity) => set({ selectedCity, ...resetPage }),
  setSortOrder: (sortOrder) => set({ sortOrder, ...resetPage }),
  setPage: (page) => set({ page }),
  setLimit: (limit) => set({ limit, ...resetPage }),
  toggleStats: () => set((state) => ({ showStats: !state.showStats })),
}));
