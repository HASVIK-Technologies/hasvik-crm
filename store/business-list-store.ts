"use client";

import { create } from "zustand";

type BusinessListState = {
  searchTerm: string;
  selectedCategory: string;
  selectedLeadStatus: string;
  selectedActivityStatus: string;
  selectedCity: string;
  selectedState: string;
  sortOrder: "Latest First" | "Oldest First";
  page: number;
  limit: number;
  showStats: boolean;
  setSearchTerm: (searchTerm: string) => void;
  setSelectedCategory: (selectedCategory: string) => void;
  setSelectedLeadStatus: (selectedLeadStatus: string) => void;
  setSelectedActivityStatus: (selectedActivityStatus: string) => void;
  setSelectedCity: (selectedCity: string) => void;
  setSelectedState: (selectedState: string) => void;
  setSortOrder: (sortOrder: BusinessListState["sortOrder"]) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  toggleStats: () => void;
};

const resetPage = { page: 1 };

export const useBusinessListStore = create<BusinessListState>((set) => ({
  searchTerm: "",
  selectedCategory: "All Categories",
  selectedLeadStatus: "All Lead Statuses",
  selectedActivityStatus: "All Status",
  selectedCity: "All Cities",
  selectedState: "All States",
  sortOrder: "Latest First",
  page: 1,
  limit: 10,
  showStats: true,
  setSearchTerm: (searchTerm) => set({ searchTerm, ...resetPage }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory, ...resetPage }),
  setSelectedLeadStatus: (selectedLeadStatus) => set({ selectedLeadStatus, ...resetPage }),
  setSelectedActivityStatus: (selectedActivityStatus) => set({ selectedActivityStatus, ...resetPage }),
  setSelectedCity: (selectedCity) => set({ selectedCity, ...resetPage }),
  setSelectedState: (selectedState) => set({ selectedState, ...resetPage }),
  setSortOrder: (sortOrder) => set({ sortOrder, ...resetPage }),
  setPage: (page) => set({ page }),
  setLimit: (limit) => set({ limit, ...resetPage }),
  toggleStats: () => set((state) => ({ showStats: !state.showStats })),
}));
