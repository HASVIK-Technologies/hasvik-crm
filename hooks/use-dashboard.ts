"use client";

import { useQueries, useQuery } from "@tanstack/react-query";
import { getBusinesses } from "@/lib/business/api";
import { getFollowUpKpis, getFollowUps } from "@/lib/follow-ups/api";
import { getUsers } from "@/lib/users/api";
import { STATUS_OPTIONS } from "@/lib/business/form-options";
import { dashboardDates, dashboardFollowUpFilters } from "@/lib/dashboard/model";
import { businessQueryKeys, followUpQueryKeys } from "@/lib/query/query-keys";
import { dashboardQueryPolicy } from "@/lib/dashboard/refresh";
import { getTenantsPage } from "@/lib/tenants/api";
import { getSubscriptions } from "@/lib/subscriptions/api";
import type { TenantQueryParams } from "@/types/tenant";

const freshness = dashboardQueryPolicy;

export function useDashboardPipeline() {
  return useQueries({ queries: STATUS_OPTIONS.map((stage) => {
    const params = { status: stage.value, isActive: true, page: 1, limit: 1 };
    return {
      queryKey: [...businessQueryKeys.all, "dashboard", "pipeline", params],
      queryFn: async ({ signal }: { signal: AbortSignal }) => {
        const response = await getBusinesses(params, signal);
        if (!Number.isFinite(response.total) || response.total < 0) throw new Error("Business totals are unavailable.");
        return { status: stage.value, count: response.total };
      },
      ...freshness,
    };
  }) });
}

export function useDashboardFollowUps(assignedTo: string, now: Date) {
  const dates = dashboardDates(now);
  const today = dashboardFollowUpFilters(assignedTo, { fromDate: dates.fromDate, toDate: dates.toDate });
  const overdue = dashboardFollowUpFilters(assignedTo, { status: "OVERDUE" });
  const upcoming = dashboardFollowUpFilters(assignedTo, { status: "SCHEDULED", fromDate: dates.upcomingFrom, toDate: dates.upcomingTo });
  const kpis = useQuery({
    queryKey: [...followUpQueryKeys.all, "dashboard", "kpis", assignedTo, dates.day],
    queryFn: ({ signal }) => getFollowUpKpis({ assignedTo }, signal), ...freshness,
  });
  const agenda = useQuery({ queryKey: [...followUpQueryKeys.all, "dashboard", "list", today], queryFn: ({ signal }) => getFollowUps(today, signal), ...freshness });
  const late = useQuery({ queryKey: [...followUpQueryKeys.all, "dashboard", "list", overdue], queryFn: ({ signal }) => getFollowUps(overdue, signal), ...freshness });
  const next = useQuery({ queryKey: [...followUpQueryKeys.all, "dashboard", "list", upcoming], queryFn: ({ signal }) => getFollowUps(upcoming, signal), ...freshness });
  return { kpis, agenda, late, next, dates };
}

export function useDashboardUserCount(tenantId?: string) {
  return useQuery({
    queryKey: ["users", "dashboard", "active-count", tenantId],
    queryFn: ({ signal }) => getUsers(signal, { page: 1, limit: 1, isActive: true, tenantId }),
    ...freshness,
  });
}

export function useDashboardTenants(params: TenantQueryParams, userId: string) {
  return useQuery({
    queryKey: ["tenants", "dashboard", userId, params],
    queryFn: ({ signal }) => getTenantsPage(params, signal), ...freshness,
  });
}

export function useDashboardSubscriptions(userId: string) {
  return useQuery({
    queryKey: ["subscriptions", "dashboard", userId],
    queryFn: ({ signal }) => getSubscriptions(signal), ...freshness,
  });
}
