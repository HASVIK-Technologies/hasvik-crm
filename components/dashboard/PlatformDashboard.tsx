"use client";

import { CircleAlert, CreditCard, Landmark, ShieldCheck, Users } from "lucide-react";
import type { ReactNode } from "react";
import KpiCards from "@/components/common/KpiCards";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useDashboardSubscriptions, useDashboardTenants, useDashboardUserCount } from "@/hooks/use-dashboard";
import { DASHBOARD_PREVIEW_LIMIT, dashboardDateLabel, dashboardPreview, subscriptionSummary } from "@/lib/dashboard/model";
import { getSubscriptionId, getSubscriptionTenantId } from "@/lib/subscriptions/access";
import type { AuthUser } from "@/types/auth";
import type { Subscription } from "@/types/subscription";
import { cn } from "@/lib/utils";
import { getSubscriptionStatusVisual } from "@/lib/subscriptions/status";
import { DashboardFacts, DashboardLink, DashboardPanel, EmptyDashboardState, QueryContent, metricValue } from "./DashboardPrimitives";
import { PendingSubscriptionList, WorkspaceDirectoryList } from "./PlatformOverviewLists";

export default function PlatformDashboard({ user, now, viewSwitcher }: { user: AuthUser; now: Date; viewSwitcher?: ReactNode }) {
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

  return <div className="space-y-5">
    <DashboardHeader
      title="Platform overview"
      description={`${dashboardDateLabel(now.toISOString())} · Workspaces and subscription health`}
      viewSwitcher={viewSwitcher}
    />
    <KpiCards className="gap-4" items={[
      { label: "Active tenants", value: metricValue(active, active.data?.total), icon: Landmark, tone: "blue", href: "/tenant-management?status=ACTIVE" },
      { label: "Inactive tenants", value: metricValue(inactive, inactive.data?.total), icon: ShieldCheck, tone: "slate", href: "/tenant-management?status=INACTIVE" },
      { label: "Active users", value: metricValue(users, users.data?.active), icon: Users, tone: "green", href: "/users?status=ACTIVE" },
      { label: "Pending subscriptions", value: metricValue(subscriptions, summary.pending.length), icon: CreditCard, tone: "amber", href: "/subscriptions?status=PENDING" },
    ]} />
    {(inactive.isError || users.isError) && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-warn/30 bg-warn-soft p-4 text-sm text-warn"><span>Some platform totals are unavailable.</span><button type="button" onClick={() => { if (inactive.isError) void inactive.refetch(); if (users.isError) void users.refetch(); }} className="font-semibold underline underline-offset-4">Retry totals</button></div>}
    <div className="grid items-stretch gap-4 lg:grid-cols-12 lg:gap-5">
      <DashboardPanel className="lg:col-span-7" title="Subscription requests" tone="amber" icon={CreditCard} description="Pending requests awaiting review. Open subscriptions to approve or reject." action={<DashboardLink href="/subscriptions">Review requests</DashboardLink>}>
        <QueryContent query={subscriptions}>
          <PendingSubscriptionList subscriptions={summary.pending} tenantName={tenantName} />
        </QueryContent>
      </DashboardPanel>
      <DashboardPanel className="lg:col-span-5" title="Subscription health" tone="blue" icon={ShieldCheck} description="Current subscriptions across the platform.">
        <QueryContent query={subscriptions}>
          <div className="grid grid-cols-2 gap-3">
            <div className={cn("rounded-xl border border-line border-t-[3px] bg-surface-2 p-4", getSubscriptionStatusVisual("ACTIVE").top)}>
              <span className={cn("mb-3 inline-flex size-8 items-center justify-center rounded-lg", getSubscriptionStatusVisual("ACTIVE").icon)}><ShieldCheck className="size-4" /></span>
              <p className="text-2xl font-bold text-ink">{summary.active}</p>
              <p className="mt-1 text-xs text-muted">Active now</p>
            </div>
            <div className={cn("rounded-xl border border-line border-t-[3px] bg-surface-2 p-4", summary.expiring.length > 0 && getSubscriptionStatusVisual("PENDING").top)}>
              <span className={cn("mb-3 inline-flex size-8 items-center justify-center rounded-lg", summary.expiring.length > 0 ? getSubscriptionStatusVisual("PENDING").icon : "bg-surface text-muted")}><CreditCard className="size-4" /></span>
              <p className="text-2xl font-bold text-ink">{summary.expiring.length}</p>
              <p className="mt-1 text-xs text-muted">Ending in 7 days</p>
            </div>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-muted">Active subscriptions have started and have not reached their end date. Counts represent subscriptions, not unique tenants.</p>
          <div className="mt-4 border-t border-line pt-4"><p className="mb-2 text-xs font-semibold text-ink">Subscription status breakdown</p><DashboardFacts items={(["PENDING", "EXPIRED", "SUSPENDED"] as const).map((status) => ({ label: getSubscriptionStatusVisual(status).label, value: subscriptions.data?.filter((item) => item.status === status).length ?? 0, status }))} /></div>
        </QueryContent>
      </DashboardPanel>
      <DashboardPanel className="lg:col-span-7" title="Active workspace directory" tone="blue" icon={Landmark} description="A preview of active tenants. Manage tenants to view the full directory." action={<DashboardLink href="/tenant-management">Manage tenants</DashboardLink>}>
        <QueryContent query={active}>
          <WorkspaceDirectoryList tenants={active.data?.data ?? []} total={active.data?.total ?? 0} />
        </QueryContent>
      </DashboardPanel>
      <DashboardPanel className="lg:col-span-5" title="Renewals to watch" tone="green" icon={CircleAlert} description="Active subscriptions ending within the next seven days." action={<DashboardLink href="/subscriptions">View all</DashboardLink>}>
        <QueryContent query={subscriptions}>
          {!summary.expiring.length ? <EmptyDashboardState message="No active subscriptions ending in the next seven days." /> : <div className="space-y-4">{dashboardPreview(summary.expiring).map((subscription, index) => <div key={getSubscriptionId(subscription) || index} className="flex items-start gap-3"><CircleAlert className="mt-0.5 size-4 shrink-0 text-warn" /><div className="min-w-0"><p className="truncate text-sm font-semibold text-ink">{tenantName(subscription)}</p><p className="mt-1 text-xs text-muted">Ends {dashboardDateLabel(subscription.endDate!, true)}</p><p className="mt-1 text-xs text-muted">{subscription.plan?.name || (typeof subscription.planId === "object" ? subscription.planId.name : "Workspace subscription")}</p>{subscription.autoRenew !== undefined && <p className="mt-1 text-xs text-muted">{subscription.autoRenew ? "Automatic renewal enabled" : "Manual renewal"}</p>}</div></div>)}{summary.expiring.length > DASHBOARD_PREVIEW_LIMIT && <p className="text-xs text-muted">Showing {DASHBOARD_PREVIEW_LIMIT} of {summary.expiring.length} upcoming renewals.</p>}</div>}
        </QueryContent>
      </DashboardPanel>
      <DashboardPanel className="lg:col-span-12" title="Platform administration" tone="cyan" icon={Users}>
        <div className="grid gap-3 rounded-xl bg-surface-2 p-4 sm:grid-cols-3">
          <div><DashboardLink href="/users">Manage user access</DashboardLink><p className="mt-1 text-xs leading-relaxed text-muted">Review roles, tenant assignments and account status.</p></div>
          <div><DashboardLink href="/tenant-management">Manage workspaces</DashboardLink><p className="mt-1 text-xs leading-relaxed text-muted">Review tenant contact details and workspace access.</p></div>
          <div><DashboardLink href="/subscriptions">Manage subscriptions</DashboardLink><p className="mt-1 text-xs leading-relaxed text-muted">Approve requests and review expiring subscriptions.</p></div>
        </div>
      </DashboardPanel>
    </div>
  </div>;
}
