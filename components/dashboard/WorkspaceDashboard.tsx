"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlarmClockOff,
  CalendarCheck2,
  CalendarClock,
  CheckCircle2,
  Filter,
  Hourglass,
  Mail,
  MessageCircle,
  Phone,
  PlusCircle,
  RefreshCw,
  TrendingUp,
  Trophy,
  UserX,
  Video,
  type LucideIcon,
} from "lucide-react";
import BarList from "@/components/common/BarList";
import ColumnChart from "@/components/common/ColumnChart";
import ChartFrame from "@/components/common/ChartFrame";
import DateRangeControl from "@/components/common/DateRangeControl";
import KpiCards, { type KpiItem } from "@/components/common/KpiCards";
import { Button } from "@/components/ui/button";
import DashboardSection, { SectionEmpty } from "@/components/dashboard/DashboardSection";
import type { ReactNode } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardRefreshControls from "@/components/dashboard/DashboardRefreshControls";
import BottomSheet from "@/components/common/BottomSheet";
import { useActivitiesData, useDashboardCompletedActivities, useLeadsData } from "@/hooks/use-analytics";
import { useDashboardRefresh } from "@/hooks/use-dashboard-refresh";
import { useDateRange } from "@/hooks/use-date-range";
import { daysBetween, formatDateTime, formatMonth, greeting } from "@/lib/analytics/format";
import { followUpsHref, leadsHref } from "@/lib/analytics/lead-filters";
import {
  byOwner, countsOverTime, createdIn, pipelineByStage, STAGE_LABELS, staleLeads, wonIn,
} from "@/lib/analytics/metrics";
import { endOfDay, inRange, percentChange, startOfDay, zonedDay } from "@/lib/analytics/ranges";
import type { ActivityRecord, LeadRecord } from "@/lib/analytics/types";
import { buildForecast } from "@/lib/forecast/model";
import { dashboardConfig } from "@/lib/dashboard/model";
import { useAuthStore } from "@/store/auth-store";
import type { AuthUser } from "@/types/auth";
import { cn } from "@/lib/utils";

const STALE_DAYS = 14;
const TYPE_ICON: Record<string, LucideIcon> = { CALL: Phone, MEETING: Video, EMAIL: Mail, WHATSAPP: MessageCircle };
// Same colours as the pipeline board: one stage, one colour, everywhere.
const STAGE_TONE = { NEW: "brand", CONTACTED: "brand-strong", INTERESTED: "warn", PROPOSAL_AND_NEGOTIATION: "muted", WON: "accent", LOST: "bad" } as const;

type Scope = "mine" | "team";

function roleScopeDefault(role: string): Scope {
  return dashboardConfig(role)?.personal ? "mine" : "team";
}

export default function WorkspaceDashboard({ user, viewSwitcher }: { user: AuthUser; viewSwitcher?: ReactNode }) {
  const roleConfig = dashboardConfig(user.role);
  const personalOnly = roleConfig?.personal ?? false;
  const { range, preset, custom, choose } = useDateRange("30d");
  const [scope, setScope] = useState<Scope>(() => roleScopeDefault(user.role));
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const leadsQuery = useLeadsData();
  const activitiesQuery = useActivitiesData();
  const storeUser = useAuthStore((state) => state.user) ?? user;
  const dashboardRefresh = useDashboardRefresh();
  const now = useMemo(() => new Date(), []);
  const mine = scope === "mine";
  const ownerId = mine ? storeUser.userId : undefined;
  const completedActivitiesQuery = useDashboardCompletedActivities(range, ownerId);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeDrawer = () => { if (desktop.matches) setFilterDrawerOpen(false); };
    desktop.addEventListener("change", closeDrawer);
    return () => desktop.removeEventListener("change", closeDrawer);
  }, []);

  const loading = leadsQuery.isPending || activitiesQuery.isPending;
  const failed = leadsQuery.isError || activitiesQuery.isError;
  const retry = () => { void leadsQuery.refetch(); void activitiesQuery.refetch(); void completedActivitiesQuery.refetch(); };

  const data = useMemo(() => {
    const allLeads = (leadsQuery.data ?? []).filter((lead) => lead.isActive);
    const leads = ownerId ? allLeads.filter((lead) => lead.ownerId === ownerId) : allLeads;
    const activities = (activitiesQuery.data ?? []).filter((a) => !ownerId || a.ownerId === ownerId);
    const today = zonedDay(now);
    const todayFrom = new Date(startOfDay(today)).toISOString();
    const todayTo = new Date(endOfDay(today)).toISOString();
    const overdue = activities.filter((a) => a.status === "OVERDUE").sort((a, b) => Date.parse(a.scheduledAt) - Date.parse(b.scheduledAt));
    const stale = staleLeads(leads, STALE_DAYS, now);
    const unassigned = allLeads.filter((lead) => !lead.ownerId);
    const todays = activities.filter((a) => inRange(a.scheduledAt, todayFrom, todayTo)).sort((a, b) => Date.parse(a.scheduledAt) - Date.parse(b.scheduledAt));
    return {
      leads, allLeads, activities, overdue, stale, unassigned, todays, todayFrom, todayTo,
      newNow: createdIn(leads, range.from, range.to).length,
      newBefore: createdIn(leads, range.previous.from, range.previous.to).length,
      wonNow: wonIn(leads, range.from, range.to),
      wonBefore: wonIn(leads, range.previous.from, range.previous.to).length,
    };
  }, [leadsQuery.data, activitiesQuery.data, ownerId, range, now]);

  const forecast = useMemo(() => buildForecast(leadsQuery.data ?? [], { now, ownerId }), [leadsQuery.data, now, ownerId]);
  const doneNow = completedActivitiesQuery.data?.current.length ?? 0;
  const doneBefore = completedActivitiesQuery.data?.previous.length ?? 0;

  const assigned = mine ? { assignedTo: storeUser.userId, assignedToName: storeUser.fullName || storeUser.email } : {};
  const followUps = (filter: Parameters<typeof followUpsHref>[0]) => {
    const query = new URLSearchParams(followUpsHref(filter).split("?")[1] ?? "");
    if (mine) { query.set("assignedTo", assigned.assignedTo!); query.set("assignedToName", assigned.assignedToName!); }
    const text = query.toString();
    return text ? `/follow-ups?${text}` : "/follow-ups";
  };
  const owner = ownerId ? { owner: ownerId } : {};

  const kpis: KpiItem[] = [
    { label: "New leads", value: data.newNow, count: data.newNow, icon: PlusCircle, tone: "blue", hint: range.label, href: leadsHref({ createdFrom: range.from, createdTo: range.to, isActive: true, ...owner }), delta: { percent: percentChange(data.newNow, data.newBefore), label: range.compareLabel } },
    { label: "Won", value: data.wonNow.length, count: data.wonNow.length, icon: Trophy, tone: "green", hint: range.label, href: leadsHref({ status: "WON", updatedFrom: range.from, updatedTo: range.to, isActive: true, ...owner }), delta: { percent: percentChange(data.wonNow.length, data.wonBefore), label: range.compareLabel } },
    { label: "Follow-ups done", value: doneNow, count: doneNow, icon: CheckCircle2, tone: "green", hint: range.label, href: followUps({ status: "COMPLETED", fromDate: range.from, toDate: range.to }), delta: { percent: percentChange(doneNow, doneBefore), label: range.compareLabel } },
    { label: "Overdue follow-ups", value: data.overdue.length, count: data.overdue.length, icon: AlarmClockOff, tone: "red", hint: "Needs action now", href: followUps({ status: "OVERDUE" }) },
    { label: `Stale leads (${STALE_DAYS}+ days)`, value: data.stale.length, count: data.stale.length, icon: Hourglass, tone: "amber", hint: "No activity recently", href: leadsHref({ staleDays: STALE_DAYS, isActive: true, ...owner }) },
    ...(mine ? [] : [{ label: "Unassigned leads", value: data.unassigned.length, count: data.unassigned.length, icon: UserX, tone: "slate" as const, hint: "Nobody owns these yet", href: leadsHref({ owner: "none", isActive: true }) }]),
  ];

  const stageRows = pipelineByStage(data.leads).map((stage) => ({
    key: stage.status, label: STAGE_LABELS[stage.status], value: stage.count, tone: STAGE_TONE[stage.status as keyof typeof STAGE_TONE],
    href: leadsHref({ status: stage.status, isActive: true, ...owner }),
  }));
  const created = countsOverTime(createdIn(data.leads, range.from, range.to).map((l) => l.createdAt), range, zonedDay);
  const leaderboard = byOwner(data.wonNow).filter((row) => row.won > 0).slice(0, 5);
  const recent = recentEvents(data.leads, data.activities).slice(0, 6);

  const scopeControl = personalOnly ? null : (
    <div role="group" aria-label="Whose numbers" className="inline-flex w-fit shrink-0 gap-1 rounded-lg border border-line bg-surface-2 p-1">
      {(["mine", "team"] as const).map((value) => (
        <button key={value} type="button" aria-pressed={scope === value} onClick={() => setScope(value)}
          className={cn("min-h-8 rounded-md px-3 text-xs font-semibold transition-colors", scope === value ? "bg-surface text-brand-strong shadow-card" : "text-ink-soft hover:bg-surface hover:text-ink")}>
          {value === "mine" ? "My numbers" : "Whole team"}
        </button>
      ))}
    </div>
  );

  const todayHref = followUps({ fromDate: data.todayFrom, toDate: data.todayTo });

  return (
    <div className="space-y-5">
      <DashboardHeader
        title={personalOnly && roleConfig ? roleConfig.title : `${greeting(now)}, ${(storeUser.fullName || "there").split(" ")[0]}`}
        description={personalOnly && roleConfig
          ? `${roleConfig.description} · ${loading
            ? "Loading today’s activity"
            : `${data.todays.length} today${data.overdue.length ? ` · ${data.overdue.length} overdue` : ""}`}`
          : loading
            ? "Loading today’s activity"
            : data.todays.length || data.overdue.length
              ? `${new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", weekday: "short", day: "numeric", month: "short" }).format(now)} · ${data.todays.length} today${data.overdue.length ? ` · ${data.overdue.length} overdue` : ""}`
              : `${new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", weekday: "short", day: "numeric", month: "short" }).format(now)} · Nothing due today`}
        viewSwitcher={viewSwitcher}
        actions={<DashboardRefreshControls mode={dashboardRefresh.mode} onModeChange={dashboardRefresh.setMode} onRefresh={() => { void dashboardRefresh.refresh(); }} isRefreshing={dashboardRefresh.isRefreshing} />}
      />

      <section aria-label="Dashboard filters and actions" className="flex flex-col gap-2 rounded-xl border border-line bg-surface p-2 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div className="hidden min-w-0 flex-col gap-2 lg:flex xl:flex-row xl:items-center">
          {scopeControl}
          <DateRangeControl key={`${custom.from}:${custom.to}`} preset={preset} custom={custom} onChange={choose} customPresentation="dialog" compact className="space-y-0" />
        </div>
        <div className="flex shrink-0 items-center justify-between gap-1 sm:justify-end">
          <button type="button" onClick={() => setFilterDrawerOpen(true)} aria-expanded={filterDrawerOpen} aria-label={`Open dashboard filters. ${scope === "mine" ? "My numbers" : "Whole team"}, ${range.label}.`} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-line bg-surface-2 px-3 text-sm font-semibold text-ink-soft hover:bg-brand-soft hover:text-brand-strong lg:hidden">
            <Filter className="size-4" aria-hidden />
            <span>Filters</span>
            <span className="text-xs font-medium text-muted">{range.label}</span>
          </button>
          <Link href={todayHref} aria-label="Today's follow-ups" title="Today's follow-ups" className="hidden min-h-9 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold text-brand-strong transition-colors hover:bg-brand-soft xl:inline-flex">
            <CalendarCheck2 className="size-4" aria-hidden />Today&apos;s follow-ups
          </Link>
          <button type="button" onClick={retry} aria-label="Refresh dashboard" title="Refresh dashboard" className="inline-flex size-9 items-center justify-center rounded-lg border border-line bg-surface text-ink-soft hover:bg-surface-2 hover:text-ink">
            <RefreshCw className={cn("size-4", (leadsQuery.isFetching || activitiesQuery.isFetching || completedActivitiesQuery.isFetching) && "animate-spin")} aria-hidden />
          </button>
        </div>
        <BottomSheet
          open={filterDrawerOpen}
          onOpenChange={setFilterDrawerOpen}
          title="Dashboard filters"
          description="Changes update the dashboard as soon as you select them."
          footer={<Button variant="outline" className="w-full" onClick={() => setFilterDrawerOpen(false)}>Done</Button>}
          className="lg:hidden"
        >
          <div className="space-y-6">
            {!personalOnly && <section aria-labelledby="mobile-scope-heading" className="space-y-2">
              <h2 id="mobile-scope-heading" className="text-sm font-semibold text-ink">Show numbers for</h2>
              {scopeControl}
            </section>}
            <section aria-labelledby="mobile-range-heading" className="space-y-2">
              <h2 id="mobile-range-heading" className="text-sm font-semibold text-ink">Date range</h2>
              <DateRangeControl key={`${custom.from}:${custom.to}`} preset={preset} custom={custom} onChange={choose} compact className="space-y-3" />
            </section>
          </div>
        </BottomSheet>
      </section>

      <section aria-labelledby="metrics-heading" className="space-y-3">
        <div>
          <h2 id="metrics-heading" className="text-base font-bold tracking-tight text-ink">Key metrics</h2>
        </div>
        {failed || completedActivitiesQuery.isError ? (
          <div role="alert" className="flex flex-wrap items-center gap-3 rounded-2xl border border-warn/30 bg-warn-soft p-4 text-sm text-warn">
            <span className="flex-1">We couldn&apos;t load your numbers. Check your connection and try again.</span>
            <Button variant="outline" onClick={retry}>Try again</Button>
          </div>
        ) : (
          <KpiCards variant="dashboard" items={kpis} loading={loading || completedActivitiesQuery.isPending} className="gap-4 lg:grid-cols-3 xl:grid-cols-6" />
        )}
      </section>

      <div className="grid items-start gap-4 lg:grid-cols-2 lg:gap-5">
        <div className="min-w-0 space-y-4 lg:space-y-5">
          <DashboardSection title="Pipeline" description="Active leads by stage. Select a stage to explore." href={leadsHref({ isActive: true, ...owner })} loading={loading} error={failed} onRetry={retry}>
            {data.leads.length ? <BarList ariaLabel="Active leads by stage" rows={stageRows} /> : <SectionEmpty title="No leads yet" hint="Add your first business and it will appear here, stage by stage." />}
          </DashboardSection>

          <ChartFrame
            title="New leads over time"
            description={range.label}
            table={{ columns: ["Period", "New leads"], rows: created.map((p) => [p.label, p.value]) }}
          >
            {loading ? <div className="skeleton h-40" /> : <ColumnChart ariaLabel="New leads over time" points={created} unit="new leads" />}
          </ChartFrame>

          <DashboardSection title={personalOnly ? "My recent activity" : "Recent activity"} loading={loading} error={failed} onRetry={retry}>
            {recent.length ? (
              <ul className="divide-y divide-line">
                {recent.map((event) => (
                  <li key={event.key} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0 text-sm">
                    <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-surface-2 text-brand-strong"><event.icon className="size-4" aria-hidden /></span>
                    <span className="min-w-0 flex-1">
                      <Link href={event.href} className="block truncate font-semibold text-ink hover:text-brand-strong">{event.title}</Link>
                      <span className="block text-xs text-muted">{event.detail} · {formatDateTime(event.at)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : <SectionEmpty title="No activity yet" hint="New leads and completed follow-ups will be listed here." />}
          </DashboardSection>
        </div>

        <div className="min-w-0 space-y-4 lg:space-y-5">
          <DashboardSection title="Today" description="Follow-ups scheduled for today." href={followUps({ fromDate: data.todayFrom, toDate: data.todayTo })} loading={loading} error={failed} onRetry={retry}>
            {data.todays.length ? (
              <ul className="divide-y divide-line">
                {data.todays.slice(0, 5).map((a) => <ActivityRow key={a.id} activity={a} />)}
              </ul>
            ) : <SectionEmpty title="Nothing scheduled today" hint="Follow-ups you schedule for today will show up here." />}
          </DashboardSection>

          <DashboardSection title="Needs attention" description="Priority items that need a next step." loading={loading} error={failed} onRetry={retry}>
            <AttentionList overdue={data.overdue} stale={data.stale} unassigned={mine ? [] : data.unassigned} now={now} />
          </DashboardSection>

          {!personalOnly && <DashboardSection title="Top owners" description={`Leads won, ${range.label.toLowerCase()}.`} loading={loading} error={failed} onRetry={retry}>
            {leaderboard.length ? (
              <BarList ariaLabel="Leads won by owner" rows={leaderboard.map((row) => ({ key: row.ownerId, label: row.ownerName, value: row.won, tone: "accent", href: leadsHref({ status: "WON", updatedFrom: range.from, updatedTo: range.to, isActive: true, owner: row.ownerId }) }))} />
            ) : <SectionEmpty title="No wins in this period" hint="When leads are marked Won, the people who closed them are ranked here." />}
          </DashboardSection>}

          <ForecastTile loading={loading} forecast={forecast} />
        </div>
      </div>
    </div>
  );
}

function ForecastTile({ loading, forecast }: { loading: boolean; forecast: ReturnType<typeof buildForecast> }) {
  const next = forecast.trend[0];
  return (
    <DashboardSection title="Forecast" description="An estimate, not a promise." loading={loading}>
      {forecast.enough ? (
        <div className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-strong"><TrendingUp className="size-5" aria-hidden /></span>
          <p className="text-sm text-ink-soft">
            About <span className="font-bold text-ink tabular">{forecast.weighted.expectedWins}</span> of your {forecast.weighted.openLeads} open leads are expected to be won
            {next ? <>, and roughly <span className="font-bold text-ink tabular">{next.expected}</span> wins in {formatMonth(next.month)}</> : null}.
          </p>
        </div>
      ) : (
        <p className="rounded-xl bg-surface-2 px-4 py-3 text-sm text-ink-soft">
          <span className="font-semibold text-ink">Not enough data yet.</span> A forecast needs {forecast.needs.join(" and ")}.
        </p>
      )}
    </DashboardSection>
  );
}

function ActivityRow({ activity }: { activity: ActivityRecord }) {
  const Icon = TYPE_ICON[activity.type] ?? CalendarClock;
  return (
    <li>
      <Link href={`/follow-ups/${encodeURIComponent(activity.id)}`} className="flex min-h-14 items-center gap-3 py-2 hover:text-brand-strong">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand-strong"><Icon className="size-4" aria-hidden /></span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-ink">{activity.businessName || "Business"}</span>
          <span className="block text-xs text-muted capitalize">{activity.type.toLowerCase()} · {formatDateTime(activity.scheduledAt)} · {activity.status.toLowerCase()}</span>
        </span>
      </Link>
    </li>
  );
}

function AttentionList({ overdue, stale, unassigned, now }: { overdue: ActivityRecord[]; stale: LeadRecord[]; unassigned: LeadRecord[]; now: Date }) {
  if (!overdue.length && !stale.length && !unassigned.length) {
    return <SectionEmpty title="You're all caught up" hint="Overdue follow-ups, stale leads and unassigned leads will be listed here when they need you." />;
  }
  const total = overdue.length + stale.length + unassigned.length;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 border border-line bg-surface-2 px-3 py-2.5">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink">{total} priority signal{total === 1 ? "" : "s"}</p>
          <p className="mt-0.5 text-xs text-ink-soft">
            {[overdue.length > 0 && `${overdue.length} overdue`, stale.length > 0 && `${stale.length} idle`, unassigned.length > 0 && `${unassigned.length} unassigned`].filter(Boolean).join(" · ")}
          </p>
        </div>
        <span className="grid size-9 shrink-0 place-items-center border border-bad/20 bg-bad-soft text-sm font-bold text-bad tabular">{total}</span>
      </div>
      {overdue.length > 0 && (
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <p className="text-xs font-semibold text-bad">Overdue follow-ups</p>
            <span className="text-xs font-semibold text-bad tabular">{overdue.length}</span>
          </div>
          <ul className="divide-y divide-line">
            {overdue.slice(0, 3).map((a) => (
              <li key={a.id}>
                <Link href={`/follow-ups/${encodeURIComponent(a.id)}`} className="group flex min-h-11 items-center justify-between gap-3 py-2.5 hover:text-brand-strong">
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span className="grid size-8 shrink-0 place-items-center bg-bad-soft text-bad"><AlarmClockOff className="size-4" aria-hidden /></span>
                    <span className="truncate text-sm font-semibold text-ink group-hover:text-brand-strong">{a.businessName || "Business"}</span>
                  </span>
                  <span className="shrink-0 bg-bad-soft px-2 py-1 text-xs font-semibold text-bad tabular">{daysBetween(a.scheduledAt, now)}d overdue</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      {stale.length > 0 && (
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <p className="text-xs font-semibold text-warn">No recent activity</p>
            <span className="text-xs font-semibold text-warn tabular">{stale.length}</span>
          </div>
          <ul className="divide-y divide-line">
            {stale.slice(0, 2).map((lead) => (
              <li key={lead.id}>
                <Link href={`/businesses/${lead.id}`} className="group flex min-h-11 items-center justify-between gap-3 py-2.5 hover:text-brand-strong">
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span className="grid size-8 shrink-0 place-items-center bg-warn-soft text-warn"><Hourglass className="size-4" aria-hidden /></span>
                    <span className="truncate text-sm font-semibold text-ink group-hover:text-brand-strong">{lead.name}</span>
                  </span>
                  <span className="shrink-0 text-xs font-medium text-ink-soft">{STAGE_LABELS[lead.status] ?? lead.status}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      {unassigned.length > 0 && (
        <Link href={leadsHref({ owner: "none", isActive: true })} className="group flex min-h-11 items-center justify-between gap-3 border border-brand-strong/15 bg-brand-soft px-3 text-sm font-semibold text-brand-strong hover:border-brand-strong/30">
          <span className="flex min-w-0 items-center gap-2.5">
            <UserX className="size-4 shrink-0" aria-hidden />
            <span>{unassigned.length} lead{unassigned.length === 1 ? "" : "s"} without an owner</span>
          </span>
          <span className="shrink-0 underline-offset-4 group-hover:underline">Assign leads</span>
        </Link>
      )}
      {(overdue.length > 3 || stale.length > 2) && (
        <p className="border-t border-line pt-3 text-xs text-ink-soft">
          Showing the most urgent follow-ups and a short list of inactive leads.
        </p>
      )}
    </div>
  );
}

function recentEvents(leads: LeadRecord[], activities: ActivityRecord[]) {
  const events: { key: string; title: string; detail: string; at: string; href: string; icon: LucideIcon }[] = [];
  for (const lead of leads) if (lead.createdAt) events.push({ key: `l-${lead.id}`, title: lead.name, detail: `New lead · ${lead.ownerName || "Unassigned"}`, at: lead.createdAt, href: `/businesses/${lead.id}`, icon: PlusCircle });
  for (const a of activities) if (a.status === "COMPLETED" && a.completedAt) events.push({ key: `a-${a.id}`, title: a.businessName || "Business", detail: `${a.type.charAt(0)}${a.type.slice(1).toLowerCase()} completed · ${a.ownerName || "Unassigned"}`, at: a.completedAt, href: `/follow-ups/${encodeURIComponent(a.id)}`, icon: CalendarCheck2 });
  return events.sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
}
