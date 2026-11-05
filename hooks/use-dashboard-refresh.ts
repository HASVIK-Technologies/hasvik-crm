"use client";

import { useCallback, useEffect, useState } from "react";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import {
  DASHBOARD_REFRESH_INTERVAL,
  isDashboardQuery,
  shouldAutoRefreshDashboard,
  type DashboardRefreshMode,
} from "@/lib/dashboard/refresh";

export function useDashboardRefresh() {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<DashboardRefreshMode>("manual");
  const fetching = useIsFetching({ predicate: isDashboardQuery }) > 0;
  const refresh = useCallback(
    () => queryClient.refetchQueries({ predicate: isDashboardQuery, type: "active" }),
    [queryClient],
  );

  useEffect(() => {
    if (mode !== "auto") return;
    const timer = window.setInterval(() => {
      if (shouldAutoRefreshDashboard(mode, document.visibilityState === "visible", navigator.onLine, fetching)) {
        void refresh();
      }
    }, DASHBOARD_REFRESH_INTERVAL);
    return () => window.clearInterval(timer);
  }, [fetching, mode, refresh]);

  return { mode, setMode, refresh, isRefreshing: fetching };
}
