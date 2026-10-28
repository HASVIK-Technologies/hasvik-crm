"use client";

import { CircleAlert, CreditCard, Landmark, ShieldCheck, Users } from "lucide-react";
import KpiCards from "@/components/common/KpiCards";
import { useDashboardSubscriptions, useDashboardTenants, useDashboardUserCount } from "@/hooks/use-dashboard";
import { DASHBOARD_PREVIEW_LIMIT, dashboardDateLabel, dashboardPreview, subscriptionSummary } from "@/lib/dashboard/model";
import { getSubscriptionId, getSubscriptionTenantId } from "@/lib/subscriptions/access";
import type { AuthUser } from "@/types/auth";
import type { Subscription } from "@/types/subscription";
import { cn } from "@/lib/utils";
import { getSubscriptionStatusVisual } from "@/lib/subscriptions/status";
import { DashboardFacts, DashboardLink, DashboardPanel, EmptyDashboardState, QueryContent, metricValue } from "./DashboardPrimitives";
import { PendingSubscriptionList, WorkspaceDirectoryList } from "./PlatformOverviewLists";

export default function PlatformDashboard({ user, now }: { user: AuthUser; now: Date }) {
  const active = useDashboardTenants({ page: 1, limit: DASHBOARD_PREVIEW_LIMIT, isActive: true }, user.userId);
  const inactive = useDashboardTenants({ page: 1, limit: 1, isActive: false }, user.userId);
  const users = useDashboardUserCount();
  const subscriptions = useDashboardSubscriptions(user.userId);
  const summary = subscriptionSummary(subscriptions.data ?? [], now);
  const tenantName = (subscription: Subscription) => {
    const tenant = typeof subscription.tenantId === "object" ? subscription.tenantId : subscription.tenant;
    const id = getSubscriptionTenantId(subscription);
    return tenant?.name || active.data?.data.find((item) => item.id === id)?.name || (id ? `Tenant ${id.slice(-6)}` : "Workspace");
  };

  return <div className="space-y-4">
    <KpiCards className="gap-4 sm:gap-4" variant="solid" items={[
      { label: "Active tenants", value: metricValue(active, active.data?.total), icon: Landmark, tone: "blue" },
      { label: "Inactive tenants", value: metricValue(inactive, inactive.data?.total), icon: ShieldCheck, tone: "slate" },
      { label: "Active users", value: metricValue(users, users.data?.active), icon: Users, tone: "green" },
      { label: "Pending subscriptions", value: metricValue(subscriptions, summary.pending.length), icon: CreditCard, tone: "amber" },
    ]} />
    {(inactive.isError || users.isError) && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 border border-warn/30 bg-warn-soft p-4 text-sm text-warn"><span>Some platform totals are unavailable.</span><button type="button" onClick={() => { if (inactive.isError) void inactive.refetch(); if (users.isError) void users.refetch(); }} className="font-semibold underline">Retry totals</button></div>}
    <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <div className="min-w-0 space-y-4">
        <DashboardPanel title="Subscription requests" tone="amber" icon={CreditCard} description="Pending requests awaiting review. Open subscriptions to approve or reject." action={<DashboardLink href="/subscriptions">Review requests</DashboardLink>}>
          <QueryContent query={subscriptions}>
            <PendingSubscriptionList subscriptions={summary.pending} tenantName={tenantName} />
          </QueryContent>
        </DashboardPanel>
        <DashboardPanel title="Active workspace directory" tone="blue" icon={Landmark} description="A preview of active tenants. Manage tenants to view the full directory." action={<DashboardLink href="/tenant-management">Manage tenants</DashboardLink>}>
          <QueryContent query={active}>
            <WorkspaceDirectoryList tenants={active.data?.data ?? []} total={active.data?.total ?? 0} />
          </QueryContent>
        </DashboardPanel>
      </div>
      <div className="min-w-0 space-y-4">
        <DashboardPanel variant="colored" title="Subscription health" tone="blue" icon={ShieldCheck} description="Current subscriptions across the platform.">
          <QueryContent query={subscriptions}>
            <div className="grid grid-cols-2 gap-3"><div className={cn("rounded-xl border border-t-[3px] border-white/20 bg-surface/5 p-4", getSubscriptionStatusVisual("ACTIVE").top)}><span className={cn("mb-3 inline-flex size-8 items-center justify-center", getSubscriptionStatusVisual("ACTIVE").icon)}><ShieldCheck className="size-4" /></span><p className="text-2xl font-bold text-white">{summary.active}</p><p className="mt-1 text-xs text-white">Active now</p></div><div className={cn("rounded-xl border border-t-[3px] border-white/20 bg-surface/5 p-4", summary.expiring.length > 0 && getSubscriptionStatusVisual("PENDING").top)}><span className={cn("mb-3 inline-flex size-8 items-center justify-center", summary.expiring.length > 0 ? getSubscriptionStatusVisual("PENDING").icon : "bg-surface/10 text-white")}><CreditCard className="size-4" /></span><p className="text-2xl font-bold text-white">{summary.expiring.length}</p><p className="mt-1 text-xs text-white">Ending in 7 days</p></div></div>
            <p className="mt-4 text-xs leading-relaxed text-white">Active subscriptions have started and have not reached their end date. Counts represent subscriptions, not unique tenants.</p>
            <div className="mt-4 border-t border-white/15 pt-4"><p className="mb-2 text-xs font-semibold text-white">Subscription status breakdown</p><DashboardFacts items={(["PENDING", "EXPIRED", "SUSPENDED"] as const).map((status) => ({ label: getSubscriptionStatusVisual(status).label, value: subscriptions.data?.filter((item) => item.status === status).length ?? 0, status }))} /></div>
          </QueryContent>
        </DashboardPanel>
        <DashboardPanel variant="colored" title="Renewals to watch" tone="green" icon={CircleAlert} description="Active subscriptions ending within the next seven days." action={<DashboardLink href="/subscriptions">View all</DashboardLink>}>
          <QueryContent query={subscriptions}>
            {!summary.expiring.length ? <EmptyDashboardState message="No active subscriptions ending in the next seven days." /> : <div className="space-y-4">{dashboardPreview(summary.expiring).map((subscription, index) => <div key={getSubscriptionId(subscription) || index} className="flex items-start gap-3"><CircleAlert className="mt-0.5 size-4 shrink-0 text-warn" /><div className="min-w-0"><p className="truncate text-sm font-semibold text-white">{tenantName(subscription)}</p><p className="mt-1 text-xs text-white">Ends {dashboardDateLabel(subscription.endDate!, true)}</p><p className="mt-1 text-xs text-white">{subscription.plan?.name || (typeof subscription.planId === "object" ? subscription.planId.name : "Workspace subscription")}</p>{subscription.autoRenew !== undefined && <p className="mt-1 text-[11px] text-white">{subscription.autoRenew ? "Automatic renewal enabled" : "Manual renewal"}</p>}</div></div>)}{summary.expiring.length > DASHBOARD_PREVIEW_LIMIT && <p className="text-xs text-white">Showing {DASHBOARD_PREVIEW_LIMIT} of {summary.expiring.length} upcoming renewals.</p>}</div>}
          </QueryContent>
        </DashboardPanel>
        <DashboardPanel variant="colored" title="Platform administration" tone="cyan" icon={Users}><div className="flex flex-col items-start gap-4 rounded-xl bg-surface/5 p-4"><div><DashboardLink href="/users">Manage user access</DashboardLink><p className="mt-1 text-xs leading-relaxed text-white">Review roles, tenant assignments and account status.</p></div><div><DashboardLink href="/tenant-management">Manage workspaces</DashboardLink><p className="mt-1 text-xs leading-relaxed text-white">Review tenant contact details and workspace access.</p></div><div><DashboardLink href="/subscriptions">Manage subscriptions</DashboardLink><p className="mt-1 text-xs leading-relaxed text-white">Approve requests and review expiring subscriptions.</p></div></div></DashboardPanel>
      </div>
    </div>
  </div>;
}
