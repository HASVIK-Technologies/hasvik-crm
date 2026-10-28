import { isOpen, staleLeads, UNASSIGNED } from "./metrics.ts";
import { inRange } from "./ranges.ts";
import type { LeadRecord } from "./types.ts";

/**
 * Filters the businesses API cannot apply itself (it has no owner, date or staleness parameters). They live in the
 * URL so a dashboard card or report row can deep-link to exactly the records behind its number.
 */
export interface LeadViewFilter {
  /** User id, or "none" for unassigned. */
  owner?: string;
  createdFrom?: string;
  createdTo?: string;
  updatedFrom?: string;
  updatedTo?: string;
  /** Open leads with no activity for this many days. */
  staleDays?: number;
  /** Only leads that are not won or lost. */
  open?: boolean;
  status?: string;
  isActive?: boolean;
  source?: string;
}

export const CLIENT_FILTER_KEYS = ["owner", "createdFrom", "createdTo", "updatedFrom", "updatedTo", "staleDays", "open", "source"] as const;

type Params = { get(name: string): string | null };

export function parseLeadViewFilter(params: Params): LeadViewFilter {
  const text = (key: string) => params.get(key)?.trim() || undefined;
  const stale = Number.parseInt(params.get("staleDays") ?? "", 10);
  const active = params.get("isActive");
  return {
    owner: text("owner"),
    createdFrom: text("createdFrom"),
    createdTo: text("createdTo"),
    updatedFrom: text("updatedFrom"),
    updatedTo: text("updatedTo"),
    staleDays: Number.isFinite(stale) && stale > 0 ? stale : undefined,
    open: params.get("open") === "1" ? true : undefined,
    status: text("status"),
    isActive: active === "true" ? true : active === "false" ? false : undefined,
    source: text("source"),
  };
}

/** True when the filter needs the client-side layer (anything beyond status / isActive / search / city / category). */
export function needsClientFilter(filter: LeadViewFilter): boolean {
  return Boolean(
    filter.owner || filter.createdFrom || filter.createdTo || filter.updatedFrom || filter.updatedTo || filter.staleDays || filter.open || filter.source,
  );
}

export function applyLeadViewFilter(leads: LeadRecord[], filter: LeadViewFilter, now: Date): LeadRecord[] {
  let rows = leads;
  if (filter.isActive !== undefined) rows = rows.filter((lead) => lead.isActive === filter.isActive);
  if (filter.status) rows = rows.filter((lead) => lead.status === filter.status);
  if (filter.open) rows = rows.filter(isOpen);
  if (filter.owner) rows = rows.filter((lead) => (filter.owner === UNASSIGNED ? !lead.ownerId : lead.ownerId === filter.owner));
  if (filter.source) rows = rows.filter((lead) => (lead.source.trim() || "Not recorded") === filter.source);
  if (filter.createdFrom || filter.createdTo) {
    rows = rows.filter((lead) => inRange(lead.createdAt, filter.createdFrom ?? "1970-01-01T00:00:00Z", filter.createdTo ?? "9999-12-31T00:00:00Z"));
  }
  if (filter.updatedFrom || filter.updatedTo) {
    rows = rows.filter((lead) => inRange(lead.updatedAt, filter.updatedFrom ?? "1970-01-01T00:00:00Z", filter.updatedTo ?? "9999-12-31T00:00:00Z"));
  }
  if (filter.staleDays) {
    const stale = new Set(staleLeads(rows, filter.staleDays, now).map((lead) => lead.id));
    rows = rows.filter((lead) => stale.has(lead.id));
  }
  return rows;
}

/** Link to the businesses list with the given filter applied. */
export function leadsHref(filter: LeadViewFilter): string {
  const params = new URLSearchParams();
  if (filter.status) params.set("status", filter.status);
  if (filter.isActive !== undefined) params.set("isActive", String(filter.isActive));
  if (filter.owner) params.set("owner", filter.owner);
  if (filter.source) params.set("source", filter.source);
  if (filter.createdFrom) params.set("createdFrom", filter.createdFrom);
  if (filter.createdTo) params.set("createdTo", filter.createdTo);
  if (filter.updatedFrom) params.set("updatedFrom", filter.updatedFrom);
  if (filter.updatedTo) params.set("updatedTo", filter.updatedTo);
  if (filter.staleDays) params.set("staleDays", String(filter.staleDays));
  if (filter.open) params.set("open", "1");
  const query = params.toString();
  return query ? `/businesses?${query}` : "/businesses";
}

export interface FollowUpViewFilter {
  status?: string;
  fromDate?: string;
  toDate?: string;
  assignedTo?: string;
  type?: string;
}

/** Link to the follow-ups list with the given filter applied. */
export function followUpsHref(filter: FollowUpViewFilter): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filter)) if (value) params.set(key, value);
  const query = params.toString();
  return query ? `/follow-ups?${query}` : "/follow-ups";
}
