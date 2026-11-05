import { apiClient } from "@/lib/api/api-client";
import type { ActivityRecord, LeadRecord } from "@/lib/analytics/types";
import { pageFromResponse } from "@/lib/analytics/pagination";
import type { FollowUpQueryFilters } from "@/types/follow-up";

type Raw = Record<string, unknown>;
export type AnalyticsActivityFilters = Partial<Pick<FollowUpQueryFilters, "assignedTo" | "status" | "fromDate" | "toDate">>;

const rec = (value: unknown): Raw => (value && typeof value === "object" ? (value as Raw) : {});
const text = (value: unknown): string => (typeof value === "string" ? value : "");

export function toLead(value: unknown): LeadRecord {
  const raw = rec(value);
  const assignee = rec(raw.assignee ?? raw.assignedTo);
  const category = rec(raw.category);
  return {
    id: text(raw._id ?? raw.id),
    name: text(raw.name),
    status: text(raw.status).toUpperCase(),
    isActive: raw.isActive !== false,
    ownerId: text(assignee._id ?? assignee.id ?? (typeof raw.assignedTo === "string" ? raw.assignedTo : "")),
    ownerName: text(assignee.fullName ?? assignee.name),
    source: text(raw.leadSource),
    city: text(raw.city),
    category: typeof raw.category === "string" ? raw.category : text(category.name),
    createdAt: text(raw.createdAt),
    updatedAt: text(raw.updatedAt) || text(raw.createdAt),
    lastFollowUpAt: text(rec(raw.lastFollowUp).scheduledAt) || undefined,
    nextFollowUpAt: text(rec(raw.nextFollowUp).scheduledAt) || undefined,
  };
}

export function toActivity(value: unknown): ActivityRecord {
  const raw = rec(value);
  const business = rec(raw.business ?? raw.businessId);
  const assignee = rec(raw.assignee ?? raw.assignedTo);
  return {
    id: text(raw._id ?? raw.id),
    businessId: text(business._id ?? business.id ?? (typeof raw.businessId === "string" ? raw.businessId : "")),
    businessName: text(business.name ?? raw.businessName),
    ownerId: text(assignee._id ?? assignee.id ?? (typeof raw.assignedTo === "string" ? raw.assignedTo : "")),
    ownerName: text(assignee.fullName ?? assignee.name ?? raw.assignedToName),
    type: text(raw.type).toUpperCase(),
    status: text(raw.status).toUpperCase(),
    scheduledAt: text(raw.scheduledAt),
    completedAt: text(raw.completedAt) || undefined,
    createdAt: text(raw.createdAt),
  };
}

const PAGE = 100;
const MAX_PAGES = 50;

async function fetchAll(path: string, signal?: AbortSignal, filters: Record<string, string> = {}): Promise<unknown[]> {
  const rows: unknown[] = [];
  const seen = new Set<string>();
  let total: number | undefined;

  for (let page = 1; page <= MAX_PAGES; page++) {
    const response = await apiClient.get<unknown>(path, { params: { ...filters, page, limit: PAGE }, signal });
    const { rows: batch, total: pageTotal } = pageFromResponse(response.data);
    if (pageTotal !== undefined) total = pageTotal;

    const fresh = batch.filter((row) => {
      const raw = rec(row);
      const id = text(raw._id ?? raw.id);
      if (!id) return true;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
    if (!fresh.length && batch.length) {
      throw new Error("Analytics pagination did not advance. Please try again.");
    }
    rows.push(...fresh);

    if (total !== undefined && rows.length >= total) return rows;
    if (batch.length < PAGE) {
      if (total !== undefined && rows.length < total) {
        throw new Error("The analytics service returned fewer records than its total.");
      }
      return rows;
    }
    if (page === MAX_PAGES) {
      throw new Error(`The analytics result exceeds the ${PAGE * MAX_PAGES}-record dashboard limit.`);
    }
  }
  return rows;
}

export async function fetchAllLeads(signal?: AbortSignal): Promise<LeadRecord[]> {
  return (await fetchAll("/businesses", signal)).map(toLead);
}

export async function fetchAllActivities(signal?: AbortSignal, filters: AnalyticsActivityFilters = {}): Promise<ActivityRecord[]> {
  const params = Object.fromEntries(Object.entries(filters).filter((entry): entry is [string, string] => Boolean(entry[1])));
  return (await fetchAll("/follow-ups", signal, params)).map(toActivity);
}
