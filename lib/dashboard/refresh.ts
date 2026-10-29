export const DASHBOARD_REFRESH_INTERVAL = 60_000;

// Polling is controlled by the page, so manual mode has no implicit refetches.
export const dashboardQueryPolicy = {
  staleTime: Infinity,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  meta: { dashboard: true },
} as const;

export function isDashboardQuery(query: { meta?: Record<string, unknown> }) {
  return query.meta?.dashboard === true;
}

export function shouldAutoRefreshDashboard(mode: "manual" | "auto", visible: boolean, online: boolean, fetching: boolean) {
  return mode === "auto" && visible && online && !fetching;
}
