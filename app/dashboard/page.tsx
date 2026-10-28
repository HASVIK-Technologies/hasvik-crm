"use client";

import { useCallback, useEffect, useState } from "react";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import PageContainer from "@/components/layout/PageContainer";
import PrimaryButton from "@/components/common/PrimaryButton";
import PlatformDashboard from "@/components/dashboard/PlatformDashboard";
import SalesDashboard from "@/components/dashboard/SalesDashboard";
import { dashboardConfig, DASHBOARD_TIME_ZONE } from "@/lib/dashboard/model";
import { DASHBOARD_REFRESH_INTERVAL, isDashboardQuery, shouldAutoRefreshDashboard } from "@/lib/dashboard/refresh";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";

export default function HomeDashboard() {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const fetching = useIsFetching({ predicate: isDashboardQuery }) > 0;
  const [mode, setMode] = useState<"manual" | "auto">("manual");
  const [now, setNow] = useState(() => new Date());
  const refresh = useCallback(() => {
    if (queryClient.isFetching({ predicate: isDashboardQuery })) return;
    setNow(new Date());
    return queryClient.refetchQueries({ predicate: isDashboardQuery, type: "active" }, { cancelRefetch: false });
  }, [queryClient]);

  useEffect(() => {
    if (mode !== "auto") return;
    const interval = window.setInterval(() => {
      if (shouldAutoRefreshDashboard(mode, document.visibilityState === "visible", navigator.onLine, queryClient.isFetching({ predicate: isDashboardQuery }) > 0)) void refresh();
    }, DASHBOARD_REFRESH_INTERVAL);
    return () => window.clearInterval(interval);
  }, [mode, queryClient, refresh]);

  if (!user) return null;
  const config = dashboardConfig(user.role);
  if (!config) return <PageContainer><p role="alert" className="border border-warn/30 bg-warn-soft p-5 text-sm text-warn">A dashboard is not configured for your role. Contact your workspace administrator.</p></PageContainer>;

  return <PageContainer className="space-y-4">
    <header className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-surface px-4 py-4 shadow-card sm:px-5">
      <h1 className="text-lg font-semibold text-ink">{config.title}</h1>
      <div className="flex flex-wrap items-center gap-2">
        <div role="group" aria-label="Dashboard refresh mode" className="inline-flex border border-line bg-surface p-0.5">
          {(["manual", "auto"] as const).map((value) => <button key={value} type="button" aria-pressed={mode === value} onClick={() => setMode(value)} className={cn("min-h-8 px-3 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-brand", mode === value ? "bg-brand-soft text-brand-strong" : "text-muted hover:bg-surface-2")}>{value === "manual" ? "Manual" : "Auto · 60s"}</button>)}
        </div>
        <PrimaryButton size="sm" disabled={fetching} aria-label="Refresh dashboard" onClick={() => void refresh()}><RefreshCw className={cn("size-3.5", fetching && "animate-spin motion-reduce:animate-none")} />{fetching ? "Refreshing" : "Refresh"}</PrimaryButton>
      </div>
    </header>
    {config.role === "SUPERADMIN" ? <PlatformDashboard user={user} now={now} /> : <SalesDashboard role={config.role} user={user} now={now} />}
    <p className="text-[11px] leading-relaxed text-muted">{mode === "manual" ? "Manual refresh" : "Auto refresh every 60 seconds while visible"} · {new Intl.DateTimeFormat("en-IN", { timeZone: DASHBOARD_TIME_ZONE, day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(now)} IST. Follow-up totals cover all dates unless a section specifies a range.</p>
  </PageContainer>;
}
