"use client";

import { create } from "zustand";
import type { FollowUpFilters } from "@/types/follow-up";

const initialFilters: FollowUpFilters = {
  page: 1,
  limit: 10,
  search: "",
  businessId: "",
  businessName: "",
  assignedTo: "",
  assignedToName: "",
  status: "",
  type: "",
  fromDate: "",
  toDate: "",
  tab: "all",
};

interface FollowUpListState extends FollowUpFilters {
  setFilter: <K extends keyof FollowUpFilters>(
    key: K,
    value: FollowUpFilters[K],
  ) => void;
  setTab: (tab: FollowUpFilters["tab"]) => void;
  reset: () => void;
}

export const useFollowUpListStore = create<FollowUpListState>((set) => ({
  ...initialFilters,
  setFilter: (key, value) =>
    set({
      [key]: value,
      page: key === "page" ? value : 1,
    } as Partial<FollowUpListState>),
  setTab: (tab) => set({ tab, page: 1 }),
  reset: () => set(initialFilters),
}));
