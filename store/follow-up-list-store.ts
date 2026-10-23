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
  showStats: boolean;
  showFilters: boolean;
  highlightedFollowUpId: string | null;
  highlightRevision: number;
  scrollToHighlightedFollowUp: boolean;
  setFilter: <K extends keyof FollowUpFilters>(
    key: K,
    value: FollowUpFilters[K],
  ) => void;
  setTab: (tab: FollowUpFilters["tab"]) => void;
  reset: () => void;
  toggleStats: () => void;
  toggleFilters: () => void;
  highlightFollowUp: (id: string, scrollToItem?: boolean) => void;
  clearFollowUpHighlight: (revision: number) => void;
}

export const useFollowUpListStore = create<FollowUpListState>((set) => ({
  ...initialFilters,
  showStats: true,
  showFilters: true,
  highlightedFollowUpId: null,
  highlightRevision: 0,
  scrollToHighlightedFollowUp: false,
  setFilter: (key, value) =>
    set({
      [key]: value,
      page: key === "page" ? value : 1,
    } as Partial<FollowUpListState>),
  setTab: (tab) => set({ tab, page: 1 }),
  reset: () => set(initialFilters),
  toggleStats: () => set((state) => ({ showStats: !state.showStats })),
  toggleFilters: () => set((state) => ({ showFilters: !state.showFilters })),
  highlightFollowUp: (id, scrollToItem = false) =>
    set((state) => ({
      highlightedFollowUpId: id,
      highlightRevision: state.highlightRevision + 1,
      scrollToHighlightedFollowUp: scrollToItem,
    })),
  clearFollowUpHighlight: (revision) =>
    set((state) =>
      state.highlightRevision === revision
        ? { highlightedFollowUpId: null, scrollToHighlightedFollowUp: false }
        : state,
    ),
}));
