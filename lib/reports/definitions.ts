import { followUpsHref, leadsHref } from "../analytics/lead-filters.ts";
import {
  activityByOwner, bySource, byOwner, conversionFunnel, countsOverTime, createdIn, dealAging, isClosed, pipelineByStage,
  STAGE_LABELS, UNASSIGNED, winLoss,
} from "../analytics/metrics.ts";
import { inRange, percentChange, zonedDay } from "../analytics/ranges.ts";
import type { ActivityRecord, DateRange, LeadRecord } from "../analytics/types.ts";

export type ReportSlug =
  | "pipeline-by-stage" | "win-loss" | "sales-by-owner" | "sales-by-source"
  | "deal-aging" | "activity-volume" | "new-leads" | "conversion-funnel";

export type FilterKey = "owner" | "stage" | "source";

export interface ReportMeta {
  slug: ReportSlug;
  title: string;
  description: string;
  /** True when the date range changes the numbers; false for "as of today" snapshots. */
  usesRange: boolean;
  filters: FilterKey[];
}

export const REPORTS: ReportMeta[] = [
  { slug: "pipeline-by-stage", title: "Pipeline by stage", description: "How many active leads sit in each stage right now.", usesRange: false, filters: ["owner", "source"] },
  { slug: "win-loss", title: "Win / loss and win rate", description: "Leads won and lost in the period, and the share that were won.", usesRange: true, filters: ["owner", "source"] },
  { slug: "sales-by-owner", title: "Sales by owner", description: "Leads, wins and win rate for each person.", usesRange: false, filters: ["stage", "source"] },
  { slug: "sales-by-source", title: "Leads by source", description: "Which channels bring leads, and which of them convert.", usesRange: false, filters: ["owner", "stage"] },
  { slug: "deal-aging", title: "Lead aging and stale leads", description: "Open leads ranked by how long since anyone touched them.", usesRange: false, filters: ["owner", "stage", "source"] },
  { slug: "activity-volume", title: "Activity volume", description: "Calls, meetings and messages completed by each person.", usesRange: true, filters: ["owner"] },
  { slug: "new-leads", title: "New leads over time", description: "How many leads were added in each day or month.", usesRange: true, filters: ["owner", "source"] },
  { slug: "conversion-funnel", title: "Conversion funnel", description: "How many leads have reached each stage, and the drop between stages.", usesRange: false, filters: ["owner", "source"] },
];

export interface ReportFilters {
  owner?: string;
  stage?: string;
  source?: string;
}

export interface ReportContext {
  leads: LeadRecord[];
  activities: ActivityRecord[];
  range: DateRange;
  filters: ReportFilters;
  now: Date;
}

export type Cell = string | number;

export interface ReportKpi {
  label: string;
  value: string | number;
  count: number;
  hint?: string;
  href?: string;
  tone?: "default" | "ok" | "warn" | "bad" | "brand";
}

export interface ReportColumn {
  key: string;
  label: string;
  numeric?: boolean;
}

export interface ReportChart {
  kind: "bars" | "columns";
  ariaLabel: string;
  unit?: string;
  rows: { key: string; label: string; value: number; valueLabel?: string; href?: string }[];
}

export interface ReportResult {
  kpis: ReportKpi[];
  chart: ReportChart | null;
  columns: ReportColumn[];
  rows: Record<string, Cell>[];
  /** Link for a row's drill-through, when the record behind it can be opened. */
  rowHref?: (row: Record<string, Cell>) => string | undefined;
  note?: string;
}

const pct = (value: number | null) => (value === null ? "—" : `${value}%`);

export function scopeLeads(leads: LeadRecord[], filters: ReportFilters): LeadRecord[] {
  return leads.filter((lead) => {
    if (!lead.isActive) return false;
    if (filters.owner && (filters.owner === UNASSIGNED ? lead.ownerId : lead.ownerId !== filters.owner)) return false;
    if (filters.stage && lead.status !== filters.stage) return false;
    if (filters.source && (lead.source.trim() || "Not recorded") !== filters.source) return false;
    return true;
  });
}

function ownerParam(filters: ReportFilters) {
  return filters.owner ? { owner: filters.owner } : {};
}

export function buildReport(slug: ReportSlug, ctx: ReportContext): ReportResult {
  const { range, filters, now } = ctx;
  const leads = scopeLeads(ctx.leads, filters);
  const owner = ownerParam(filters);
  const source = filters.source ? { source: filters.source } : {};

  switch (slug) {
    case "pipeline-by-stage": {
      const stages = pipelineByStage(leads);
      const total = stages.reduce((sum, s) => sum + s.count, 0);
      const summary = winLoss(leads);
      return {
        kpis: [
          { label: "Active leads", value: total, count: total, href: leadsHref({ isActive: true, ...owner, ...source }), tone: "brand" },
          { label: "Open", value: summary.open, count: summary.open, href: leadsHref({ open: true, isActive: true, ...owner, ...source }) },
          { label: "Won", value: summary.won, count: summary.won, href: leadsHref({ status: "WON", isActive: true, ...owner, ...source }), tone: "ok" },
          { label: "Lost", value: summary.lost, count: summary.lost, href: leadsHref({ status: "LOST", isActive: true, ...owner, ...source }), tone: "bad" },
        ],
        chart: { kind: "bars", ariaLabel: "Active leads by stage", rows: stages.map((s) => ({ key: s.status, label: STAGE_LABELS[s.status], value: s.count, valueLabel: `${s.count} · ${total ? Math.round((s.count / total) * 100) : 0}%`, href: leadsHref({ status: s.status, isActive: true, ...owner, ...source }) })) },
        columns: [{ key: "stage", label: "Stage" }, { key: "leads", label: "Leads", numeric: true }, { key: "share", label: "Share of total", numeric: true }],
        rows: stages.map((s) => ({ stage: STAGE_LABELS[s.status], leads: s.count, share: pct(total ? Math.round((s.count / total) * 100) : 0), _status: s.status })),
        rowHref: (row) => (row.leads ? leadsHref({ status: String(row._status), isActive: true, ...owner, ...source }) : undefined),
      };
    }

    case "win-loss": {
      const closed = leads.filter((l) => isClosed(l.status) && inRange(l.updatedAt, range.from, range.to));
      const won = closed.filter((l) => l.status === "WON");
      const lost = closed.filter((l) => l.status === "LOST");
      const prev = leads.filter((l) => isClosed(l.status) && inRange(l.updatedAt, range.previous.from, range.previous.to));
      const rate = closed.length ? Math.round((won.length / closed.length) * 100) : null;
      const months = new Map<string, { won: number; lost: number }>();
      for (const lead of closed) {
        const key = zonedDay(new Date(lead.updatedAt)).slice(0, 7);
        const row = months.get(key) ?? { won: 0, lost: 0 };
        if (lead.status === "WON") row.won++; else row.lost++;
        months.set(key, row);
      }
      const monthRows = [...months.entries()].sort(([a], [b]) => a.localeCompare(b));
      return {
        kpis: [
          { label: "Won", value: won.length, count: won.length, tone: "ok", href: leadsHref({ status: "WON", updatedFrom: range.from, updatedTo: range.to, isActive: true, ...owner, ...source }), hint: `${pct(percentChange(won.length, prev.filter((l) => l.status === "WON").length))} vs previous period` },
          { label: "Lost", value: lost.length, count: lost.length, tone: "bad", href: leadsHref({ status: "LOST", updatedFrom: range.from, updatedTo: range.to, isActive: true, ...owner, ...source }) },
          { label: "Win rate", value: pct(rate), count: closed.length, tone: "brand", hint: closed.length ? `Based on ${closed.length} closed lead${closed.length === 1 ? "" : "s"}` : "Nothing closed in this period" },
        ],
        chart: { kind: "bars", ariaLabel: "Won and lost leads", rows: [{ key: "won", label: "Won", value: won.length }, { key: "lost", label: "Lost", value: lost.length }] },
        columns: [{ key: "month", label: "Month" }, { key: "won", label: "Won", numeric: true }, { key: "lost", label: "Lost", numeric: true }, { key: "rate", label: "Win rate", numeric: true }],
        rows: monthRows.map(([month, v]) => ({ month, won: v.won, lost: v.lost, rate: pct(Math.round((v.won / (v.won + v.lost)) * 100)) })),
        note: "A lead counts as closed in the period when it is Won or Lost and was last updated then. The API does not store a separate close date.",
      };
    }

    case "sales-by-owner": {
      const rows = byOwner(leads);
      const total = leads.length;
      return {
        kpis: [
          { label: "People with leads", value: rows.length, count: rows.length },
          { label: "Active leads", value: total, count: total, href: leadsHref({ isActive: true, ...(filters.stage ? { status: filters.stage } : {}), ...source }), tone: "brand" },
          { label: "Unassigned", value: rows.find((r) => r.ownerId === UNASSIGNED)?.total ?? 0, count: rows.find((r) => r.ownerId === UNASSIGNED)?.total ?? 0, href: leadsHref({ owner: "none", isActive: true }), tone: "warn" },
        ],
        chart: { kind: "bars", ariaLabel: "Leads won by owner", rows: rows.map((r) => ({ key: r.ownerId, label: r.ownerName, value: r.won, valueLabel: `${r.won} won of ${r.total}`, href: leadsHref({ owner: r.ownerId, status: "WON", isActive: true }) })) },
        columns: [{ key: "owner", label: "Owner" }, { key: "total", label: "Leads", numeric: true }, { key: "open", label: "Open", numeric: true }, { key: "won", label: "Won", numeric: true }, { key: "lost", label: "Lost", numeric: true }, { key: "rate", label: "Win rate", numeric: true }],
        rows: rows.map((r) => ({ owner: r.ownerName, total: r.total, open: r.open, won: r.won, lost: r.lost, rate: pct(r.winRate), _owner: r.ownerId })),
        rowHref: (row) => leadsHref({ owner: String(row._owner), isActive: true }),
      };
    }

    case "sales-by-source": {
      const rows = bySource(leads);
      return {
        kpis: [
          { label: "Sources", value: rows.length, count: rows.length },
          { label: "Top source", value: rows[0]?.source ?? "—", count: rows[0]?.total ?? 0, hint: rows[0] ? `${rows[0].total} leads` : undefined, href: rows[0] ? leadsHref({ source: rows[0].source, isActive: true, ...owner }) : undefined },
          { label: "Source not recorded", value: rows.find((r) => r.source === "Not recorded")?.total ?? 0, count: rows.find((r) => r.source === "Not recorded")?.total ?? 0, tone: "warn", href: leadsHref({ source: "Not recorded", isActive: true, ...owner }) },
        ],
        chart: { kind: "bars", ariaLabel: "Leads by source", rows: rows.map((r) => ({ key: r.source, label: r.source, value: r.total, valueLabel: `${r.total} · ${r.won} won`, href: leadsHref({ source: r.source, isActive: true, ...owner }) })) },
        columns: [{ key: "source", label: "Source" }, { key: "total", label: "Leads", numeric: true }, { key: "won", label: "Won", numeric: true }, { key: "lost", label: "Lost", numeric: true }, { key: "rate", label: "Win rate", numeric: true }],
        rows: rows.map((r) => ({ source: r.source, total: r.total, won: r.won, lost: r.lost, rate: pct(r.winRate) })),
        rowHref: (row) => leadsHref({ source: String(row.source), isActive: true, ...owner }),
      };
    }

    case "deal-aging": {
      const aging = dealAging(leads, now);
      const buckets = [["0–7 days", 0, 7], ["8–14 days", 8, 14], ["15–30 days", 15, 30], ["31–60 days", 31, 60], ["Over 60 days", 61, Infinity]] as const;
      const counts = buckets.map(([label, lo, hi]) => ({ label, value: aging.filter((a) => a.daysSinceActivity >= lo && a.daysSinceActivity <= hi).length }));
      const stale = aging.filter((a) => a.daysSinceActivity >= 14).length;
      return {
        kpis: [
          { label: "Open leads", value: aging.length, count: aging.length, href: leadsHref({ open: true, isActive: true, ...owner, ...source }), tone: "brand" },
          { label: "Stale (14+ days)", value: stale, count: stale, tone: "warn", href: leadsHref({ staleDays: 14, isActive: true, ...owner, ...source }) },
          { label: "Longest wait", value: aging[0] ? `${aging[0].daysSinceActivity} days` : "—", count: aging[0]?.daysSinceActivity ?? 0, hint: aging[0]?.lead.name },
        ],
        chart: { kind: "bars", ariaLabel: "Open leads by days since last activity", rows: counts.map((c) => ({ key: c.label, label: c.label, value: c.value })) },
        columns: [{ key: "lead", label: "Lead" }, { key: "stage", label: "Stage" }, { key: "owner", label: "Owner" }, { key: "open", label: "Days open", numeric: true }, { key: "quiet", label: "Days since activity", numeric: true }],
        rows: aging.map((a) => ({ lead: a.lead.name, stage: STAGE_LABELS[a.lead.status] ?? a.lead.status, owner: a.lead.ownerName || "Unassigned", open: a.daysOpen, quiet: a.daysSinceActivity, _id: a.lead.id })),
        rowHref: (row) => `/businesses/${row._id}`,
      };
    }

    case "activity-volume": {
      const acts = ctx.activities.filter((a) => !filters.owner || (filters.owner === UNASSIGNED ? !a.ownerId : a.ownerId === filters.owner));
      const rows = activityByOwner(acts, range);
      const total = rows.reduce((s, r) => s + r.total, 0);
      const previous = activityByOwner(acts, range.previous).reduce((s, r) => s + r.total, 0);
      return {
        kpis: [
          { label: "Completed activities", value: total, count: total, tone: "ok", href: followUpsHref({ status: "COMPLETED", fromDate: range.from, toDate: range.to, ...(filters.owner && filters.owner !== UNASSIGNED ? { assignedTo: filters.owner } : {}) }), hint: `${pct(percentChange(total, previous))} vs previous period` },
          { label: "Calls", value: rows.reduce((s, r) => s + r.calls, 0), count: rows.reduce((s, r) => s + r.calls, 0), href: followUpsHref({ status: "COMPLETED", type: "CALL", fromDate: range.from, toDate: range.to, ...(filters.owner && filters.owner !== UNASSIGNED ? { assignedTo: filters.owner } : {}) }) },
          { label: "Meetings", value: rows.reduce((s, r) => s + r.meetings, 0), count: rows.reduce((s, r) => s + r.meetings, 0), href: followUpsHref({ status: "COMPLETED", type: "MEETING", fromDate: range.from, toDate: range.to, ...(filters.owner && filters.owner !== UNASSIGNED ? { assignedTo: filters.owner } : {}) }) },
        ],
        chart: { kind: "bars", ariaLabel: "Completed activities by owner", rows: rows.map((r) => ({ key: r.ownerId, label: r.ownerName, value: r.total, valueLabel: `${r.total} (${r.calls} calls, ${r.meetings} meetings, ${r.messages} messages)` })) },
        columns: [{ key: "owner", label: "Owner" }, { key: "calls", label: "Calls", numeric: true }, { key: "meetings", label: "Meetings", numeric: true }, { key: "messages", label: "Messages", numeric: true }, { key: "other", label: "Other", numeric: true }, { key: "total", label: "Total", numeric: true }],
        rows: rows.map((r) => ({ owner: r.ownerName, calls: r.calls, meetings: r.meetings, messages: r.messages, other: r.other, total: r.total })),
        note: "Counts follow-ups marked Completed whose scheduled date falls in the period. Messages are WhatsApp and email.",
      };
    }

    case "new-leads": {
      const made = createdIn(leads, range.from, range.to);
      const previous = createdIn(leads, range.previous.from, range.previous.to).length;
      const series = countsOverTime(made.map((l) => l.createdAt), range, zonedDay);
      const best = series.reduce((a, b) => (b.value > a.value ? b : a), series[0] ?? { key: "", label: "", value: 0 });
      return {
        kpis: [
          { label: "New leads", value: made.length, count: made.length, tone: "brand", href: leadsHref({ createdFrom: range.from, createdTo: range.to, isActive: true, ...owner, ...source }), hint: `${pct(percentChange(made.length, previous))} vs previous period` },
          { label: "Average per day", value: series.length ? Math.round((made.length / Math.max(1, Math.round((Date.parse(range.to) - Date.parse(range.from)) / 86_400_000) + 1)) * 10) / 10 : 0, count: made.length },
          { label: "Busiest period", value: best.value ? best.label : "—", count: best.value, hint: best.value ? `${best.value} leads` : undefined },
        ],
        chart: { kind: "columns", ariaLabel: "New leads over time", unit: "new leads", rows: series.map((p) => ({ key: p.key, label: p.label, value: p.value })) },
        columns: [{ key: "period", label: "Period" }, { key: "leads", label: "New leads", numeric: true }],
        rows: series.map((p) => ({ period: p.label, leads: p.value })),
      };
    }

    case "conversion-funnel": {
      const funnel = conversionFunnel(leads);
      return {
        kpis: [
          { label: "Entered the funnel", value: funnel[0].reached, count: funnel[0].reached, tone: "brand", hint: "Active leads that are not lost" },
          { label: "Won", value: funnel[4].reached, count: funnel[4].reached, tone: "ok", href: leadsHref({ status: "WON", isActive: true, ...owner, ...source }) },
          { label: "Overall conversion", value: `${funnel[4].percentOfStart}%`, count: funnel[4].reached },
        ],
        chart: { kind: "bars", ariaLabel: "Leads that reached each stage", rows: funnel.map((s) => ({ key: s.status, label: STAGE_LABELS[s.status], value: s.reached, valueLabel: `${s.reached} · ${s.percentOfStart}%` })) },
        columns: [{ key: "stage", label: "Stage" }, { key: "reached", label: "Reached", numeric: true }, { key: "start", label: "% of start", numeric: true }, { key: "step", label: "From previous stage", numeric: true }],
        rows: funnel.map((s, i) => ({ stage: STAGE_LABELS[s.status], reached: s.reached, start: `${s.percentOfStart}%`, step: i === 0 ? "—" : pct(funnel[i - 1].reached ? Math.round((s.reached / funnel[i - 1].reached) * 100) : null) })),
        note: "Counts each lead at its current stage or beyond. The API does not keep stage history, so a lead that was lost is left out.",
      };
    }
  }
}

export function reportMeta(slug: string): ReportMeta | undefined {
  return REPORTS.find((report) => report.slug === slug);
}
