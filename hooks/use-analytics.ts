"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAllActivities, fetchAllLeads } from "@/lib/analytics/api";

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
