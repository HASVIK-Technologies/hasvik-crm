"use client";

import { Landmark } from "lucide-react";
import { dashboardDateLabel, dashboardPreview } from "@/lib/dashboard/model";
import { getSubscriptionId } from "@/lib/subscriptions/access";
import type { Subscription } from "@/types/subscription";
import type { Tenant } from "@/types/tenant";
import { EmptyDashboardState } from "./DashboardPrimitives";
import SubscriptionStatusBadge from "@/components/common/SubscriptionStatusBadge";

const columns = "grid-cols-2 gap-x-4 gap-y-3 @xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1.25fr)_minmax(0,0.8fr)_7rem]";
const fieldLabel = "mb-1 text-xs font-medium uppercase tracking-wide text-muted @xl:sr-only";

function ListHeading({ labels }: { labels: string[] }) {
  return <div aria-hidden="true" className={`${columns} hidden border-b border-line bg-surface-2 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted @xl:grid`}>
    {labels.map((label, index) => <span key={label} className={index === labels.length - 1 ? "text-right" : ""}>{label}</span>)}
  </div>;
}

export function PendingSubscriptionList({ subscriptions, tenantName }: {
  subscriptions: Subscription[];
  tenantName: (subscription: Subscription) => string;
}) {
  if (!subscriptions.length) return <EmptyDashboardState message="No subscription requests waiting for review." />;
  const rows = dashboardPreview([...subscriptions].sort((a, b) => (Date.parse(a.createdAt ?? "") || 0) - (Date.parse(b.createdAt ?? "") || 0)));

  return <div className="@container">
    <ListHeading labels={["Workspace", "Plan", "Requested", "Status"]} />
    <div className="divide-y divide-surface-2">
      {rows.map((subscription, index) => {
        const plan = subscription.plan ?? (subscription.planId && typeof subscription.planId === "object" ? subscription.planId : undefined);
        const name = tenantName(subscription);
        return <dl key={getSubscriptionId(subscription) || index} className={`${columns} grid items-start px-3 py-3 transition-colors hover:bg-surface-2/70`}>
          <div className="order-1 min-w-0">
            <dt className={fieldLabel}>Workspace</dt>
            <dd className="break-words text-sm font-semibold text-ink" title={name}>{name}</dd>
          </div>
          <div className="order-3 min-w-0 @xl:order-2">
            <dt className={fieldLabel}>Plan</dt>
            <dd className="break-words text-xs font-medium text-ink-soft">{plan?.name || "Plan not provided"}{plan?.billingCycle && <span className="mt-1 block text-xs font-normal capitalize text-muted">{plan.billingCycle.toLowerCase().replaceAll("_", " ")}</span>}</dd>
          </div>
          <div className="order-4 min-w-0 @xl:order-3">
            <dt className={fieldLabel}>Requested</dt>
            <dd className="text-xs leading-relaxed text-ink-soft">{subscription.createdAt ? dashboardDateLabel(subscription.createdAt, true) : "Not provided"}</dd>
          </div>
          <div className="order-2 text-right @xl:order-4">
            <dt className="sr-only">Status</dt>
            <dd><SubscriptionStatusBadge status="PENDING" label="Pending review" /></dd>
          </div>
        </dl>;
      })}
    </div>
    {subscriptions.length > rows.length && <p className="border-t border-surface-2 px-3 pt-3 text-xs text-muted">Showing {rows.length} of {subscriptions.length} pending requests.</p>}
  </div>;
}

export function WorkspaceDirectoryList({ tenants, total }: { tenants: Tenant[]; total: number }) {
  if (!tenants.length) return <EmptyDashboardState message="No active tenants yet." />;
  const rows = dashboardPreview(tenants);

  return <div className="@container">
    <p className="mb-3 text-xs text-muted">Showing {rows.length} of {total} active workspaces</p>
    <ListHeading labels={["Workspace", "Contact details", "Joined", "Status"]} />
    <div className="divide-y divide-surface-2">
      {rows.map((tenant) => <dl key={tenant.id} className={`${columns} grid items-start px-3 py-3 transition-colors hover:bg-surface-2/70`}>
        <div className="order-1 min-w-0">
          <dt className={fieldLabel}>Workspace</dt>
          <dd className="flex items-start gap-2.5"><span className="flex size-8 shrink-0 items-center justify-center bg-brand-soft text-brand-strong"><Landmark className="size-4" /></span><span className="min-w-0"><span className="block break-words text-sm font-semibold text-ink">{tenant.name}</span>{tenant.fullName && <span className="mt-1 block break-words text-xs text-muted">{tenant.fullName}</span>}</span></dd>
        </div>
        <div className="order-3 min-w-0 @xl:order-2">
          <dt className={fieldLabel}>Contact details</dt>
          <dd className="space-y-1 text-xs leading-relaxed text-ink-soft">{tenant.contactEmail && <span className="block break-all">{tenant.contactEmail}</span>}{tenant.contactPhone && <span className="block break-words">{tenant.contactPhone}</span>}{!tenant.contactEmail && !tenant.contactPhone && "No contact details"}</dd>
        </div>
        <div className="order-4 min-w-0 @xl:order-3">
          <dt className={fieldLabel}>Joined</dt>
          <dd className="text-xs leading-relaxed text-ink-soft">{tenant.createdAt ? dashboardDateLabel(tenant.createdAt) : "Not provided"}</dd>
        </div>
        <div className="order-2 text-right @xl:order-4">
          <dt className="sr-only">Status</dt>
          <dd><span className="inline-block bg-ok-soft px-2 py-1 text-xs font-semibold text-ok">Active</span></dd>
        </div>
      </dl>)}
    </div>
  </div>;
}
