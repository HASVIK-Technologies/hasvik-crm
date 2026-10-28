import { inRange, percentChange } from "./ranges.ts";
import type { ActivityRecord, DateRange, LeadRecord } from "./types.ts";

export const STAGES = ["NEW", "CONTACTED", "INTERESTED", "PROPOSAL_AND_NEGOTIATION", "WON", "LOST"] as const;

/** Order used by the funnel. LOST leaves the funnel: the API does not record which stage a lead was lost from. */
export const FUNNEL_STAGES = ["NEW", "CONTACTED", "INTERESTED", "PROPOSAL_AND_NEGOTIATION", "WON"] as const;

export const STAGE_LABELS: Record<string, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  INTERESTED: "Interested",
  PROPOSAL_AND_NEGOTIATION: "Proposal & negotiation",
  WON: "Won",
  LOST: "Lost",
};

export const UNASSIGNED = "none";

export const isClosed = (status: string) => status === "WON" || status === "LOST";
export const isOpen = (lead: LeadRecord) => lead.isActive && !isClosed(lead.status);

export interface StageCount {
  status: string;
  count: number;
}

export function pipelineByStage(leads: LeadRecord[]): StageCount[] {
  return STAGES.map((status) => ({ status, count: leads.filter((lead) => lead.isActive && lead.status === status).length }));
}

export interface WinLoss {
  won: number;
  lost: number;
  open: number;
  /** Won / (won + lost), or null when nothing has closed. */
  winRate: number | null;
}

export function winLoss(leads: LeadRecord[]): WinLoss {
  const active = leads.filter((lead) => lead.isActive);
  const won = active.filter((lead) => lead.status === "WON").length;
  const lost = active.filter((lead) => lead.status === "LOST").length;
  return { won, lost, open: active.length - won - lost, winRate: won + lost ? Math.round((won / (won + lost)) * 100) : null };
}

/** Leads created inside the range. */
export const createdIn = (leads: LeadRecord[], from: string, to: string) => leads.filter((lead) => inRange(lead.createdAt, from, to));

/** Leads currently WON whose record was last updated inside the range (the API stores no close date). */
export const wonIn = (leads: LeadRecord[], from: string, to: string) =>
  leads.filter((lead) => lead.status === "WON" && lead.isActive && inRange(lead.updatedAt, from, to));

/** Open leads with no completed or scheduled activity since `days` ago. */
export function staleLeads(leads: LeadRecord[], days: number, now: Date): LeadRecord[] {
  const cutoff = now.getTime() - days * 86_400_000;
  return leads.filter((lead) => {
    if (!isOpen(lead)) return false;
    const touched = Math.max(
      Date.parse(lead.lastFollowUpAt ?? "") || 0,
      Date.parse(lead.nextFollowUpAt ?? "") || 0,
      Date.parse(lead.createdAt) || 0,
    );
    return touched < cutoff;
  });
}

export interface OwnerRow {
  ownerId: string;
  ownerName: string;
  total: number;
  open: number;
  won: number;
  lost: number;
  winRate: number | null;
}

export function byOwner(leads: LeadRecord[]): OwnerRow[] {
  const rows = new Map<string, OwnerRow>();
  for (const lead of leads.filter((l) => l.isActive)) {
    const id = lead.ownerId || UNASSIGNED;
    const row = rows.get(id) ?? { ownerId: id, ownerName: lead.ownerName || "Unassigned", total: 0, open: 0, won: 0, lost: 0, winRate: null };
    row.total++;
    if (lead.status === "WON") row.won++;
    else if (lead.status === "LOST") row.lost++;
    else row.open++;
    rows.set(id, row);
  }
  return [...rows.values()]
    .map((row) => ({ ...row, winRate: row.won + row.lost ? Math.round((row.won / (row.won + row.lost)) * 100) : null }))
    .sort((a, b) => b.won - a.won || b.total - a.total || a.ownerName.localeCompare(b.ownerName));
}

export interface SourceRow {
  source: string;
  total: number;
  won: number;
  lost: number;
  winRate: number | null;
}

export const NO_SOURCE = "Not recorded";

export function bySource(leads: LeadRecord[]): SourceRow[] {
  const rows = new Map<string, SourceRow>();
  for (const lead of leads.filter((l) => l.isActive)) {
    const key = lead.source.trim() || NO_SOURCE;
    const row = rows.get(key) ?? { source: key, total: 0, won: 0, lost: 0, winRate: null };
    row.total++;
    if (lead.status === "WON") row.won++;
    if (lead.status === "LOST") row.lost++;
    rows.set(key, row);
  }
  return [...rows.values()]
    .map((row) => ({ ...row, winRate: row.won + row.lost ? Math.round((row.won / (row.won + row.lost)) * 100) : null }))
    .sort((a, b) => b.total - a.total || a.source.localeCompare(b.source));
}

export interface FunnelStep {
  status: string;
  /** Leads currently at this stage or any later stage of the funnel. */
  reached: number;
  /** Share of the first step. */
  percentOfStart: number;
}

export function conversionFunnel(leads: LeadRecord[]): FunnelStep[] {
  const active = leads.filter((l) => l.isActive && l.status !== "LOST");
  const rank = (status: string) => (FUNNEL_STAGES as readonly string[]).indexOf(status);
  const start = active.length;
  return FUNNEL_STAGES.map((status, index) => {
    const reached = active.filter((lead) => rank(lead.status) >= index).length;
    return { status, reached, percentOfStart: start ? Math.round((reached / start) * 100) : 0 };
  });
}

export interface AgingRow {
  lead: LeadRecord;
  daysOpen: number;
  daysSinceActivity: number;
}

export function dealAging(leads: LeadRecord[], now: Date): AgingRow[] {
  const day = 86_400_000;
  return leads
    .filter(isOpen)
    .map((lead) => {
      const touched = Math.max(Date.parse(lead.lastFollowUpAt ?? "") || 0, Date.parse(lead.createdAt) || 0);
      return {
        lead,
        daysOpen: Math.max(0, Math.floor((now.getTime() - Date.parse(lead.createdAt)) / day)),
        daysSinceActivity: Math.max(0, Math.floor((now.getTime() - touched) / day)),
      };
    })
    .sort((a, b) => b.daysSinceActivity - a.daysSinceActivity);
}

export interface ActivityOwnerRow {
  ownerId: string;
  ownerName: string;
  calls: number;
  meetings: number;
  messages: number;
  other: number;
  total: number;
}

/** Completed activity per owner; WhatsApp and email are grouped as messages. */
export function activityByOwner(activities: ActivityRecord[], range: Pick<DateRange, "from" | "to">): ActivityOwnerRow[] {
  const rows = new Map<string, ActivityOwnerRow>();
  for (const activity of activities) {
    if (activity.status !== "COMPLETED" || !inRange(activity.completedAt ?? activity.scheduledAt, range.from, range.to)) continue;
    const id = activity.ownerId || UNASSIGNED;
    const row = rows.get(id) ?? { ownerId: id, ownerName: activity.ownerName || "Unassigned", calls: 0, meetings: 0, messages: 0, other: 0, total: 0 };
    if (activity.type === "CALL") row.calls++;
    else if (activity.type === "MEETING") row.meetings++;
    else if (activity.type === "WHATSAPP" || activity.type === "EMAIL") row.messages++;
    else row.other++;
    row.total++;
    rows.set(id, row);
  }
  return [...rows.values()].sort((a, b) => b.total - a.total || a.ownerName.localeCompare(b.ownerName));
}

export interface SeriesPoint {
  key: string;
  label: string;
  value: number;
}

/** Counts per day (ranges up to 45 days) or per month, using the workspace calendar. */
export function countsOverTime(dates: string[], range: Pick<DateRange, "from" | "to">, zonedDay: (d: Date) => string): SeriesPoint[] {
  const from = Date.parse(range.from);
  const to = Date.parse(range.to);
  const days = Math.round((to - from) / 86_400_000) + 1;
  const monthly = days > 45;
  const buckets = new Map<string, number>();
  for (let t = from; t <= to; t += 86_400_000) {
    const day = zonedDay(new Date(t));
    buckets.set(monthly ? day.slice(0, 7) : day, 0);
  }
  for (const value of dates) {
    const time = Date.parse(value);
    if (!(time >= from && time <= to)) continue;
    const day = zonedDay(new Date(time));
    const key = monthly ? day.slice(0, 7) : day;
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  return [...buckets.entries()].map(([key, value]) => ({ key, label: key, value }));
}

export { percentChange };
