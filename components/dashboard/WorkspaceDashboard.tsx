"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlarmClockOff,
  CalendarCheck2,
  CalendarClock,
  CheckCircle2,
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
import { useActivitiesData, useLeadsData } from "@/hooks/use-analytics";
import { useDateRange } from "@/hooks/use-date-range";
import { daysBetween, formatDateTime, formatMonth, greeting } from "@/lib/analytics/format";
import { followUpsHref, leadsHref } from "@/lib/analytics/lead-filters";
import {
  byOwner, countsOverTime, createdIn, pipelineByStage, STAGE_LABELS, staleLeads, wonIn,
} from "@/lib/analytics/metrics";
import { endOfDay, inRange, percentChange, startOfDay, zonedDay } from "@/lib/analytics/ranges";
import type { ActivityRecord, LeadRecord } from "@/lib/analytics/types";
import { buildForecast } from "@/lib/forecast/model";
import { useAuthStore } from "@/store/auth-store";
import type { AuthUser } from "@/types/auth";
import { cn } from "@/lib/utils";

const STALE_DAYS = 14;
const TYPE_ICON: Record<string, LucideIcon> = { CALL: Phone, MEETING: Video, EMAIL: Mail, WHATSAPP: MessageCircle };
const STAGE_TONE = { NEW: "brand", CONTACTED: "brand-strong", INTERESTED: "accent", PROPOSAL_AND_NEGOTIATION: "growth", WON: "accent", LOST: "muted" } as const;

type Scope = "mine" | "team";

function roleScopeDefault(role: string): Scope {
  return ["SALES", "USER"].includes(role.trim().toUpperCase()) ? "mine" : "team";
}

export default function WorkspaceDashboard({ user }: { user: AuthUser }) {
  const { range, preset, custom, choose } = useDateRange("30d");
  const [scope, setScope] = useState<Scope>(() => roleScopeDefault(user.role));
  const leadsQuery = useLeadsData();
  const activitiesQuery = useActivitiesData();
  const storeUser = useAuthStore((state) => state.user) ?? user;
  const now = useMemo(() => new Date(), []);
  const mine = scope === "mine";
  const ownerId = mine ? storeUser.userId : undefined;

  const loading = leadsQuery.isPending || activitiesQuery.isPending;
  const failed = leadsQuery.isError || activitiesQuery.isError;
  const retry = () => { void leadsQuery.refetch(); void activitiesQuery.refetch(); };

  const data = useMemo(() => {
    const allLeads = (leadsQuery.data ?? []).filter((lead) => lead.isActive);
    const leads = ownerId ? allLeads.filter((lead) => lead.ownerId === ownerId) : allLeads;
    const activities = (activitiesQuery.data ?? []).filter((a) => !ownerId || a.ownerId === ownerId);
    const today = zonedDay(now);
    const todayFrom = new Date(startOfDay(today)).toISOString();
    const todayTo = new Date(endOfDay(today)).toISOString();
    const completedIn = (from: string, to: string) => activities.filter((a) => a.status === "COMPLETED" && inRange(a.scheduledAt, from, to));
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
      doneNow: completedIn(range.from, range.to).length,
      doneBefore: completedIn(range.previous.from, range.previous.to).length,
    };
  }, [leadsQuery.data, activitiesQuery.data, ownerId, range, now]);

  const forecast = useMemo(() => buildForecast(leadsQuery.data ?? [], { now, ownerId }), [leadsQuery.data, now, ownerId]);

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
    { label: "Follow-ups done", value: data.doneNow, count: data.doneNow, icon: CheckCircle2, tone: "green", hint: range.label, href: followUps({ status: "COMPLETED", fromDate: range.from, toDate: range.to }), delta: { percent: percentChange(data.doneNow, data.doneBefore), label: range.compareLabel } },
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

  return (
    <div className="space-y-5">
      <section aria-label="Today at a glance" className="hero-surface fade-up relative overflow-hidden rounded-3xl p-5 text-white shadow-float sm:p-7">
        <div aria-hidden className="pointer-events-none absolute -top-20 -right-16 size-64 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-white/80">{new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", weekday: "long", day: "numeric", month: "long" }).format(now)}</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-[1.9rem]">{greeting(now)}, {(storeUser.fullName || "there").split(" ")[0]}</h1>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-white/90">
              {loading
                ? "Getting your day ready…"
                : data.todays.length || data.overdue.length
                  ? `You have ${data.todays.length} follow-up${data.todays.length === 1 ? "" : "s"} today${data.overdue.length ? ` and ${data.overdue.length} waiting from earlier` : ""}.`
                  : "Nothing is due today. A good moment to reach out to a new lead."}
            </p>
          </div>
          <div role="group" aria-label="Whose numbers" className="inline-flex gap-1 rounded-xl bg-white/15 p-1 ring-1 ring-white/25 backdrop-blur ring-inset">
            {(["mine", "team"] as const).map((value) => (
              <button key={value} type="button" aria-pressed={scope === value} onClick={() => setScope(value)}
                className={cn("min-h-10 rounded-lg px-3.5 text-sm font-semibold transition-all", scope === value ? "bg-white text-brand-strong shadow-card" : "text-white hover:bg-white/10")}>
                {value === "mine" ? "My numbers" : "Whole team"}
              </button>
            ))}
          </div>
        </div>
        <div className="relative mt-5 flex flex-wrap gap-2">
          <Link href={followUps({ fromDate: data.todayFrom, toDate: data.todayTo })} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-brand-strong shadow-card transition-transform hover:-translate-y-0.5 active:scale-[0.98]">
            <CalendarCheck2 className="size-4" aria-hidden />See today&apos;s follow-ups
          </Link>
          <Link href="/businesses/form" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white/15 px-4 text-sm font-semibold text-white ring-1 ring-white/30 transition-colors ring-inset hover:bg-white/25">
            <PlusCircle className="size-4" aria-hidden />Add a business
          </Link>
          <button type="button" onClick={retry} aria-label="Refresh dashboard" className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-white/90 hover:bg-white/10">
            <RefreshCw className={cn("size-4", (leadsQuery.isFetching || activitiesQuery.isFetching) && "animate-spin")} aria-hidden /><span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </section>

      <DateRangeControl preset={preset} custom={custom} onChange={choose} />

      {failed ? (
        <div role="alert" className="flex flex-wrap items-center gap-3 rounded-2xl border border-warn/30 bg-warn-soft p-4 text-sm text-warn">
          <span className="flex-1">We couldn&apos;t load your numbers. Check your connection and try again.</span>
          <Button variant="outline" onClick={retry}>Try again</Button>
        </div>
      ) : (
        <KpiCards items={kpis} loading={loading} />
      )}

      <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        <div className="space-y-5">
          <DashboardSection title="Pipeline" description="Active leads by stage. Tap a stage to open those leads." href={leadsHref({ isActive: true, ...owner })} loading={loading} error={failed} onRetry={retry}>
            {data.leads.length ? <BarList ariaLabel="Active leads by stage" rows={stageRows} /> : <SectionEmpty title="No leads yet" hint="Add your first business and it will appear here, stage by stage." />}
          </DashboardSection>

          <ChartFrame
            title="New leads over time"
            description={range.label}
            table={{ columns: ["Date", "New leads"], rows: created.map((p) => [p.label, p.value]) }}
          >
            {loading ? <div className="skeleton h-48" /> : <ColumnChart ariaLabel="New leads over time" points={created} unit="new leads" />}
          </ChartFrame>

          <DashboardSection title="Needs attention" description="The quickest wins to clear first." loading={loading} error={failed} onRetry={retry}>
            <AttentionList overdue={data.overdue} stale={data.stale} unassigned={mine ? [] : data.unassigned} now={now} />
          </DashboardSection>
        </div>

        <div className="space-y-5">
          <DashboardSection title="Today" description="Follow-ups scheduled for today." href={followUps({ fromDate: data.todayFrom, toDate: data.todayTo })} loading={loading} error={failed} onRetry={retry}>
            {data.todays.length ? (
              <ul className="divide-y divide-line">
                {data.todays.slice(0, 5).map((a) => <ActivityRow key={a.id} activity={a} />)}
              </ul>
            ) : <SectionEmpty title="Nothing scheduled today" hint="Follow-ups you schedule for today will show up here." />}
          </DashboardSection>

          <DashboardSection title="Top owners" description={`Leads won, ${range.label.toLowerCase()}.`} loading={loading} error={failed} onRetry={retry}>
            {leaderboard.length ? (
              <BarList ariaLabel="Leads won by owner" rows={leaderboard.map((row) => ({ key: row.ownerId, label: row.ownerName, value: row.won, tone: "accent", href: leadsHref({ status: "WON", updatedFrom: range.from, updatedTo: range.to, isActive: true, owner: row.ownerId }) }))} />
            ) : <SectionEmpty title="No wins in this period" hint="When leads are marked Won, the people who closed them are ranked here." />}
          </DashboardSection>

          <DashboardSection title="Recent activity" loading={loading} error={failed} onRetry={retry}>
            {recent.length ? (
              <ul className="space-y-3">
                {recent.map((event) => (
                  <li key={event.key} className="flex items-start gap-3 text-sm">
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

          <ForecastTile loading={loading} forecast={forecast} />
        </div>
      </div>
    </div>
  );
}

function ForecastTile({ loading, forecast }: { loading: boolean; forecast: ReturnType<typeof buildForecast> }) {
  const next = forecast.trend[0];
  return (
    <DashboardSection title="Forecast" description="An estimate, not a promise." href="/forecast" linkLabel="Open forecast" loading={loading}>
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
  return (
    <div className="space-y-4">
      {overdue.length > 0 && (
        <div>
          <p className="mb-1 text-xs font-semibold tracking-wide text-bad uppercase">Overdue follow-ups · {overdue.length}</p>
          <ul className="divide-y divide-line">
            {overdue.slice(0, 4).map((a) => (
              <li key={a.id}>
                <Link href={`/follow-ups/${encodeURIComponent(a.id)}`} className="flex min-h-12 items-center justify-between gap-3 py-2 hover:text-brand-strong">
                  <span className="min-w-0 truncate text-sm font-semibold text-ink">{a.businessName || "Business"}</span>
                  <span className="shrink-0 text-xs font-semibold text-bad tabular">{daysBetween(a.scheduledAt, now)} days overdue</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      {stale.length > 0 && (
        <div>
          <p className="mb-1 text-xs font-semibold tracking-wide text-warn uppercase">Leads with no recent activity · {stale.length}</p>
          <ul className="divide-y divide-line">
            {stale.slice(0, 3).map((lead) => (
              <li key={lead.id}>
                <Link href={`/businesses/${lead.id}`} className="flex min-h-12 items-center justify-between gap-3 py-2 hover:text-brand-strong">
                  <span className="min-w-0 truncate text-sm font-semibold text-ink">{lead.name}</span>
                  <span className="shrink-0 text-xs text-muted">{STAGE_LABELS[lead.status] ?? lead.status}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      {unassigned.length > 0 && (
        <Link href={leadsHref({ owner: "none", isActive: true })} className="flex min-h-12 items-center justify-between gap-3 rounded-xl bg-surface-2 px-3 text-sm font-semibold text-ink hover:text-brand-strong">
          <span>{unassigned.length} lead{unassigned.length === 1 ? "" : "s"} without an owner</span>
          <span className="text-brand-strong">Assign</span>
        </Link>
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

