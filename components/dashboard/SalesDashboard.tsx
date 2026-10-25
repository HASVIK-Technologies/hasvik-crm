"use client";

import { ArrowUpRight, Building2, CalendarCheck2, ChartNoAxesCombined, Clock3, CircleAlert, Layers3, Target, Trophy, Users } from "lucide-react";
import Link from "next/link";
import SubscriptionStatusBadge from "@/components/common/SubscriptionStatusBadge";
import KpiCards from "@/components/common/KpiCards";
import { useDashboardFollowUps, useDashboardPipeline, useDashboardSubscriptions, useDashboardUserCount } from "@/hooks/use-dashboard";
import { DASHBOARD_PREVIEW_LIMIT, dashboardDateLabel, dashboardPreview, followUpWorkload, pipelineSummary, type DashboardRole } from "@/lib/dashboard/model";
import { STATUS_OPTIONS, getLeadStatusVisual } from "@/lib/business/form-options";
import { getSubscriptionTenantId } from "@/lib/subscriptions/access";
import type { AuthUser } from "@/types/auth";
import { cn } from "@/lib/utils";
import { DashboardFacts, DashboardLink, DashboardPanel, EmptyDashboardState, FollowUpQueue, FollowUpQueueLink, QueryContent, metricValue } from "./DashboardPrimitives";

function PipelineOverview() {
  const queries = useDashboardPipeline();
  const pending = queries.some((query) => query.isPending);
  const error = queries.some((query) => query.isError);
  const counts = queries.flatMap((query) => query.data ? [query.data] : []);
  const summary = pipelineSummary(counts);
  const maximum = Math.max(1, ...counts.map((stage) => stage.count));
  return <DashboardPanel title="Sales pipeline" tone="blue" icon={ChartNoAxesCombined} description="Current stage of active businesses across this workspace." action={<DashboardLink href="/businesses">Open pipeline</DashboardLink>}>
    <QueryContent query={{ isPending: pending, isError: error, refetch: () => queries.forEach((query) => void query.refetch()) }}>
      <div className="mb-6 grid grid-cols-3 gap-3 border-b border-slate-100 pb-5">
        {[{ label: "Open opportunities", value: summary.open, color: "border-blue-100 bg-blue-50 text-blue-800" }, { label: "Won", value: summary.won, color: "border-emerald-100 bg-emerald-50 text-emerald-800" }, { label: "Win rate", value: summary.winRate === null ? "—" : `${summary.winRate}%`, color: "border-cyan-100 bg-cyan-50 text-cyan-800" }].map((item) => <div key={item.label} className={cn("rounded-none border p-2.5 sm:p-3", item.color)}><p className="text-xl font-bold sm:text-2xl">{item.value}</p><p className="mt-1 text-[11px] leading-relaxed">{item.label}</p></div>)}
      </div>
      <div className="space-y-4">{STATUS_OPTIONS.map((stage) => {
        const count = counts.find((item) => item.status === stage.value)?.count ?? 0;
        return <Link key={stage.value} href={`/businesses?status=${stage.value}&isActive=true`} className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-blue">
          <span className="mb-1.5 flex items-center justify-between gap-3 text-xs"><span className="flex items-center gap-2 font-medium text-slate-600 group-hover:text-brand-blue"><span className={cn("size-2 rounded-full", getLeadStatusVisual(stage.value).accent)} />{stage.label}</span><span className="font-bold tabular-nums text-slate-800">{count.toLocaleString("en-IN")}</span></span>
          <span className="block h-2.5 overflow-hidden rounded-full bg-slate-100"><span className={cn("block h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none", getLeadStatusVisual(stage.value).accent)} style={{ width: `${count / maximum * 100}%` }} /></span>
        </Link>;
      })}</div>
      <p className="mt-5 text-[11px] leading-relaxed text-slate-400">Win rate = won ÷ (won + lost). Counts reflect current stages, rather than historical stage changes.</p>
    </QueryContent>
  </DashboardPanel>;
}

function WorkspaceHealth({ user }: { user: AuthUser }) {
  const users = useDashboardUserCount(user.tenantId);
  const subscriptions = useDashboardSubscriptions(user.userId);
  const current = subscriptions.data?.filter((subscription) => getSubscriptionTenantId(subscription) === user.tenantId);
  return <DashboardPanel variant="colored" title="Workspace health" tone="green" icon={Users} description="Access and subscription information for administrators.">
    <div className="flex items-center justify-between gap-3 rounded-none border border-white/15 bg-white/5 p-4"><span className="flex items-center gap-2 text-sm font-medium text-white"><Users className="size-4" />Active users</span><strong className="text-2xl text-white">{metricValue(users, users.data?.total)}</strong></div>
    {users.isError && <p className="mt-2 text-xs text-amber-100">User count unavailable. <button type="button" onClick={() => void users.refetch()} className="underline">Retry</button></p>}
    <div className="mt-4"><DashboardLink href="/users">Manage users</DashboardLink></div>
    <div className="mt-5 border-t border-white/15 pt-4"><QueryContent query={subscriptions}>
      {!current?.length ? <p className="text-xs text-white">No subscription information available.</p> : dashboardPreview(current).map((subscription, index) => <div key={subscription._id ?? subscription.id ?? index} className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs"><span className="font-semibold text-white">{subscription.plan?.name || (typeof subscription.planId === "object" ? subscription.planId.name : "Workspace subscription")}</span><span className="text-white"><SubscriptionStatusBadge status={subscription.status} />{subscription.endDate && ` · Ends ${dashboardDateLabel(subscription.endDate)}`}</span></div>)}
    </QueryContent><div className="mt-3"><DashboardLink href="/subscriptions">Manage subscription</DashboardLink></div></div>
  </DashboardPanel>;
}

export default function SalesDashboard({ role, user, now }: { role: Exclude<DashboardRole, "SUPERADMIN">; user: AuthUser; now: Date }) {
  const personal = role === "SALES" || role === "USER";
  const assignedTo = personal ? user.userId : "";
  const { kpis, agenda, late, next, dates } = useDashboardFollowUps(assignedTo, now);
  const workload = followUpWorkload(next.data?.items ?? []);
  const shared = !personal;
  const metrics = [
    { label: personal ? "My follow-ups" : "Workspace follow-ups", value: metricValue(kpis, kpis.data?.total), icon: CalendarCheck2, tone: "blue" as const },
    { label: "Today", value: metricValue(kpis, kpis.data?.today), icon: Clock3, tone: "green" as const },
    { label: "Overdue", value: metricValue(kpis, kpis.data?.overdue), icon: CircleAlert, tone: "red" as const },
    { label: "Upcoming", value: metricValue(kpis, kpis.data?.upcoming), icon: Target, tone: "cyan" as const },
  ];
  return <div className="space-y-4">
    <KpiCards className="gap-4 sm:gap-4" items={metrics} variant="solid" />
    {kpis.isError && <p role="alert" className="text-sm text-amber-800">Follow-up totals could not be loaded. <button type="button" onClick={() => void kpis.refetch()} className="font-semibold underline">Retry totals</button></p>}
    <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <div className="min-w-0 space-y-4">
        {shared && <PipelineOverview />}
        <DashboardPanel title={personal ? "My overdue follow-ups" : "Overdue follow-ups"} tone="rose" icon={CircleAlert} description="Resolve missed conversations before moving on to new work." action={<FollowUpQueueLink assignedTo={assignedTo} filters={{ status: "OVERDUE" }} />}>
          <QueryContent query={late}><FollowUpQueue items={late.data?.items ?? []} total={late.data?.total} shared={shared} emptyMessage="No overdue follow-ups. Keep the momentum going." /></QueryContent>
        </DashboardPanel>
        <DashboardPanel title="Today's agenda" tone="green" icon={CalendarCheck2} description="Follow-ups scheduled for today, including their current status." action={<FollowUpQueueLink assignedTo={assignedTo} filters={{ fromDate: dates.fromDate, toDate: dates.toDate }} />}>
          <QueryContent query={agenda}><FollowUpQueue items={agenda.data?.items ?? []} total={agenda.data?.total} shared={shared} emptyMessage="No follow-ups scheduled for today." /></QueryContent>
        </DashboardPanel>
        {role === "SALES" && <DashboardPanel title="Keep your pipeline moving" tone="blue" icon={Target} description="Review customer context before each conversation, then record the outcome.">
          <div className="grid gap-3 sm:grid-cols-2"><Link href="/businesses" className="group rounded-none border border-blue-100 bg-linear-to-br from-blue-50 to-cyan-50/50 p-4 transition-colors hover:border-blue-300"><span className="mb-3 flex items-center justify-between"><Building2 className="size-5 text-brand-blue" /><ArrowUpRight className="size-4 text-blue-400" /></span><span className="block text-sm font-semibold text-blue-900">Review businesses</span><span className="mt-1 block text-xs leading-relaxed text-slate-600">Open contact details, past notes, and lead stages.</span></Link><Link href="/businesses/form" className="group rounded-none border border-emerald-100 bg-linear-to-br from-emerald-50 to-cyan-50/50 p-4 transition-colors hover:border-emerald-300"><span className="mb-3 flex items-center justify-between"><Trophy className="size-5 text-emerald-600" /><ArrowUpRight className="size-4 text-emerald-400" /></span><span className="block text-sm font-semibold text-emerald-900">Add a new lead</span><span className="mt-1 block text-xs leading-relaxed text-slate-600">Capture a prospect and plan the first conversation.</span></Link></div>
        </DashboardPanel>}
      </div>
      <div className="min-w-0 space-y-4">
        <DashboardPanel variant="colored" title="Coming up next" tone="cyan" icon={Clock3} description="Scheduled follow-ups over the next seven calendar days." action={<FollowUpQueueLink assignedTo={assignedTo} filters={{ status: "SCHEDULED", fromDate: dates.upcomingFrom, toDate: dates.upcomingTo }} />}>
          <QueryContent query={next}><FollowUpQueue items={next.data?.items ?? []} total={next.data?.total} shared={shared} emptyMessage="No follow-ups scheduled for the next seven days." /></QueryContent>
        </DashboardPanel>
        {role === "MANAGER" && <DashboardPanel variant="colored" title="Upcoming workload by assignee" tone="blue" icon={Users} description={`Workspace assignments for the next seven days${next.data && next.data.total > next.data.items.length ? ` · based on ${next.data.items.length} of ${next.data.total} follow-ups` : ""}.`}>
          <QueryContent query={next}><div className="mb-4"><DashboardFacts items={[{ label: "Scheduled follow-ups", value: next.data?.total ?? 0 }, { label: "Assignees represented", value: workload.filter((owner) => owner.id !== "unassigned").length }]} /></div>{!workload.length ? <EmptyDashboardState message="No upcoming workload to display." /> : <div className="space-y-4">{dashboardPreview(workload).map((owner, index) => <div key={owner.id} className="flex items-center gap-3"><span className={cn("flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold", ["bg-blue-100 text-blue-700", "bg-emerald-100 text-emerald-700", "bg-cyan-100 text-cyan-700"][index % 3])}>{owner.name.slice(0, 1).toUpperCase()}</span><div className="min-w-0 flex-1"><div className="mb-1.5 flex items-center justify-between gap-3 text-xs"><span className="truncate font-medium text-white">{owner.name}</span><strong className="text-white">{owner.count}</strong></div><div className="h-2 overflow-hidden rounded-full bg-white/15"><div className={cn("h-full rounded-full", ["bg-blue-500", "bg-emerald-500", "bg-cyan-500"][index % 3])} style={{ width: `${owner.count / workload[0].count * 100}%` }} /></div></div></div>)}{workload.length > DASHBOARD_PREVIEW_LIMIT && <p className="text-xs text-white">Showing {DASHBOARD_PREVIEW_LIMIT} of {workload.length} assignees. Open follow-ups for the full workload.</p>}</div>}</QueryContent>
          <div className="mt-5"><FollowUpQueueLink assignedTo="" filters={{ status: "SCHEDULED", fromDate: dates.upcomingFrom, toDate: dates.upcomingTo }}>Review assignments</FollowUpQueueLink></div>
        </DashboardPanel>}
        {role === "ADMIN" && <WorkspaceHealth user={user} />}
        {role === "USER" && <DashboardPanel variant="colored" title="Your workspace" tone="blue" icon={Layers3}><div className="space-y-4 rounded-none bg-white/5 p-4"><p className="text-sm leading-relaxed text-white">Open a follow-up to review contact information, add notes, and update its outcome.</p><ol className="list-inside list-decimal space-y-2 text-xs leading-relaxed text-white"><li>Review the customer details and previous notes.</li><li>Record the conversation and update its outcome.</li><li>Plan the next follow-up when needed.</li></ol><DashboardLink href="/businesses">Browse businesses</DashboardLink><div><DashboardLink href="/profile">My profile</DashboardLink></div></div></DashboardPanel>}
      </div>
    </div>
  </div>;
}
