"use client";

import { create } from "zustand";

type BusinessListState = {
  searchTerm: string;
  searchChips: string[];
  selectedCategory: string;
  selectedCategories: string[];
  selectedStatus: string;
  selectedCity: string;
  selectedCities: string[];
  sortOrder: "Latest First" | "Oldest First";
  page: number;
  limit: number;
  showStats: boolean;
  setSearchTerm: (searchTerm: string) => void;
  setSearchChips: (chips: string[]) => void;
  addSearchChip: (chip: string) => void;
  removeSearchChip: (chip: string) => void;
  clearSearchChips: () => void;
  setSelectedCategory: (selectedCategory: string) => void;
  setSelectedCategories: (selectedCategories: string[]) => void;
  toggleCategory: (category: string) => void;
  clearCategories: () => void;
  setSelectedStatus: (selectedStatus: string) => void;
  setSelectedCity: (selectedCity: string) => void;
  setSelectedCities: (selectedCities: string[]) => void;
  toggleCity: (city: string) => void;
  clearCities: () => void;
  setSortOrder: (sortOrder: BusinessListState["sortOrder"]) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  toggleStats: () => void;
  resetAllFilters: () => void;
};

const resetPage = { page: 1 };

export const useBusinessListStore = create<BusinessListState>((set) => ({
  searchTerm: "",
  searchChips: [],
  selectedCategory: "All Categories",
  selectedCategories: [],
  selectedStatus: "All Status",
  selectedCity: "All Cities",
  selectedCities: [],
  sortOrder: "Latest First",
  page: 1,
  limit: 10,
  showStats: true,
  setSearchTerm: (searchTerm) => set({ searchTerm, ...resetPage }),
  setSearchChips: (searchChips) => set({ searchChips, ...resetPage }),
  addSearchChip: (chip) =>
    set((state) => {
      const trimmed = chip.trim();
      if (!trimmed || state.searchChips.includes(trimmed)) return state;
      return { searchChips: [...state.searchChips, trimmed], ...resetPage };
    }),
  removeSearchChip: (chip) =>
    set((state) => ({
      searchChips: state.searchChips.filter((c) => c !== chip),
      ...resetPage,
    })),
  clearSearchChips: () => set({ searchChips: [], searchTerm: "", ...resetPage }),
  setSelectedCategory: (selectedCategory) =>
    set((state) => ({
      selectedCategory,
      selectedCategories:
        state.selectedCategories.length > 1
          ? state.selectedCategories
          : selectedCategory && selectedCategory !== "All Categories"
            ? [selectedCategory]
            : [],
      ...resetPage,
    })),
  setSelectedCategories: (selectedCategories) =>
    set({
      selectedCategories,
      selectedCategory:
        selectedCategories.length === 1
          ? selectedCategories[0]
          : selectedCategories.length > 1
            ? `${selectedCategories.length} Categories`
            : "All Categories",
      ...resetPage,
    }),
  toggleCategory: (category) =>
    set((state) => {
      const exists = state.selectedCategories.includes(category);
      const updated = exists
        ? state.selectedCategories.filter((c) => c !== category)
        : [...state.selectedCategories, category];
      return {
        selectedCategories: updated,
        selectedCategory:
          updated.length === 1
            ? updated[0]
            : updated.length > 1
              ? `${updated.length} Categories`
              : "All Categories",
        ...resetPage,
      };
    }),
  clearCategories: () =>
    set({
      selectedCategories: [],
      selectedCategory: "All Categories",
      ...resetPage,
    }),
  setSelectedStatus: (selectedStatus) => set({ selectedStatus, ...resetPage }),
  setSelectedCity: (selectedCity: string) =>
    set((state) => ({
      selectedCity,
      selectedCities:
        state.selectedCities.length > 1
          ? state.selectedCities
          : selectedCity && selectedCity !== "All Cities"
            ? [selectedCity]
            : [],
      ...resetPage,
    })),
  setSelectedCities: (selectedCities) =>
    set({
      selectedCities,
      selectedCity:
        selectedCities.length === 1
          ? selectedCities[0]
          : selectedCities.length > 1
            ? `${selectedCities.length} Cities`
            : "All Cities",
      ...resetPage,
    }),
  toggleCity: (city) =>
    set((state) => {
      const exists = state.selectedCities.includes(city);
      const updated = exists
        ? state.selectedCities.filter((c) => c !== city)
        : [...state.selectedCities, city];
      return {
        selectedCities: updated,
        selectedCity:
          updated.length === 1
            ? updated[0]
            : updated.length > 1
              ? `${updated.length} Cities`
              : "All Cities",
        ...resetPage,
      };
    }),
  clearCities: () =>
    set({
      selectedCities: [],
      selectedCity: "All Cities",
      ...resetPage,
    }),
  setSortOrder: (sortOrder) => set({ sortOrder, ...resetPage }),
  setPage: (page) => set({ page }),
  setLimit: (limit) => set({ limit, ...resetPage }),
  toggleStats: () => set((state) => ({ showStats: !state.showStats })),
  resetAllFilters: () =>
    set({
      searchTerm: "",
      searchChips: [],
      selectedCategory: "All Categories",
      selectedCategories: [],
      selectedStatus: "All Status",
      selectedCity: "All Cities",
      selectedCities: [],
      page: 1,
    }),
}));
