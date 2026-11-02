"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAllActivities, fetchAllLeads, type AnalyticsActivityFilters } from "@/lib/analytics/api";
import type { DateRange } from "@/lib/analytics/types";

// One shared fetch per list, de-duplicated and cached by React Query, so the dashboard, reports and forecast
// reconcile against the same snapshot. Mutations invalidate the "businesses" / "follow-ups" prefixes.
const policy = { staleTime: 60_000, gcTime: 5 * 60_000, refetchOnWindowFocus: false } as const;

export function useLeadsData(enabled = true) {
  return useQuery({
    queryKey: ["businesses", "analytics", "all"],
    queryFn: ({ signal }) => fetchAllLeads(signal),
    enabled,
    ...policy,
  });
}

export function useActivitiesData(enabled = true) {
  return useQuery({
    queryKey: ["follow-ups", "analytics", "all"],
    queryFn: ({ signal }) => fetchAllActivities(signal),
    enabled,
    ...policy,
  });
}

export function useDashboardCompletedActivities(range: DateRange, assignedTo?: string) {
  const currentFilters: AnalyticsActivityFilters = {
    status: "COMPLETED",
    fromDate: range.from,
    toDate: range.to,
    ...(assignedTo ? { assignedTo } : {}),
  };
  const previousFilters: AnalyticsActivityFilters = {
    status: "COMPLETED",
    fromDate: range.previous.from,
    toDate: range.previous.to,
    ...(assignedTo ? { assignedTo } : {}),
  };

  return useQuery({
    queryKey: [
      "follow-ups",
      "analytics",
      "dashboard-completed",
      range.from,
      range.to,
      range.previous.from,
      range.previous.to,
      assignedTo,
    ],
    queryFn: async ({ signal }) => {
      const [current, previous] = await Promise.all([
        fetchAllActivities(signal, currentFilters),
        fetchAllActivities(signal, previousFilters),
      ]);
      return { current, previous };
    },
    ...policy,
  });
}
