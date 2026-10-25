"use client";

import { create } from "zustand";
import type { FollowUpFilters } from "@/types/follow-up";
import { savedFollowUpDate } from "@/lib/follow-ups/highlight";

const initialFilters: FollowUpFilters = {
  page: 1,
  limit: 10,
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
  view: "table" | "calendar";
  calendarMonth: string;
  showStats: boolean;
  showFilters: boolean;
  highlightedFollowUpId: string | null;
  highlightedFollowUpDate: string | null;
  highlightRevision: number;
  scrollToHighlightedFollowUp: boolean;
  setFilter: <K extends keyof FollowUpFilters>(
    key: K,
    value: FollowUpFilters[K],
  ) => void;
  setTab: (tab: FollowUpFilters["tab"]) => void;
  setView: (view: "table" | "calendar") => void;
  setCalendarMonth: (month: string) => void;
  reset: () => void;
  toggleStats: () => void;
  toggleFilters: () => void;
  highlightFollowUp: (id: string, scrollToItem?: boolean) => void;
  highlightSavedFollowUp: (id: string, scheduledAt: string) => void;
  clearFollowUpHighlight: (revision: number) => void;
}

export const useFollowUpListStore = create<FollowUpListState>((set) => ({
  ...initialFilters,
  view: "table",
  calendarMonth: new Date().toISOString().slice(0, 7),
  showStats: true,
  showFilters: true,
  highlightedFollowUpId: null,
  highlightedFollowUpDate: null,
  highlightRevision: 0,
  scrollToHighlightedFollowUp: false,
  setFilter: (key, value) =>
    set({
      [key]: value,
      page: key === "page" ? value : 1,
    } as Partial<FollowUpListState>),
  setTab: (tab) => set({ tab, page: 1 }),
  setView: (view) => set({ view, page: 1 }),
  setCalendarMonth: (calendarMonth) => set({ calendarMonth, page: 1 }),
  reset: () => set(initialFilters),
  toggleStats: () => set((state) => ({ showStats: !state.showStats })),
  toggleFilters: () => set((state) => ({ showFilters: !state.showFilters })),
  highlightFollowUp: (id, scrollToItem = false) =>
    set((state) => ({
      highlightedFollowUpId: id,
      highlightedFollowUpDate: null,
      highlightRevision: state.highlightRevision + 1,
      scrollToHighlightedFollowUp: scrollToItem,
    })),
  highlightSavedFollowUp: (id, scheduledAt) => set((state) => {
    const date = savedFollowUpDate(scheduledAt);
    return {
      highlightedFollowUpId: id || null,
      highlightedFollowUpDate: date,
      highlightRevision: state.highlightRevision + 1,
      scrollToHighlightedFollowUp: true,
      ...(state.view === "calendar" && date ? { calendarMonth: date.slice(0, 7) } : {}),
    };
  }),
  clearFollowUpHighlight: (revision) =>
    set((state) =>
      state.highlightRevision === revision
        ? { highlightedFollowUpId: null, highlightedFollowUpDate: null, scrollToHighlightedFollowUp: false }
        : state,
    ),
}));
