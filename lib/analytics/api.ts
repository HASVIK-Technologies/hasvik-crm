import { apiClient } from "@/lib/api/api-client";
import type { ActivityRecord, LeadRecord } from "@/lib/analytics/types";

type Raw = Record<string, unknown>;

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
  const business = rec(raw.business);
  const assignee = rec(raw.assignee);
  return {
    id: text(raw._id ?? raw.id),
    businessId: text(business._id ?? business.id),
    businessName: text(business.name),
    ownerId: text(assignee._id ?? assignee.id),
    ownerName: text(assignee.fullName ?? assignee.name),
    type: text(raw.type).toUpperCase(),
    status: text(raw.status).toUpperCase(),
    scheduledAt: text(raw.scheduledAt),
    completedAt: text(raw.completedAt) || undefined,
    createdAt: text(raw.createdAt),
  };
}

const PAGE = 100;
const MAX_PAGES = 50;

/**
 * Reads every page of a list endpoint. The backend returns the whole collection for large `limit` values today,
 * but the loop keeps working if it starts honouring page sizes.
 */
async function fetchAll(path: string, signal?: AbortSignal): Promise<unknown[]> {
  const rows: unknown[] = [];
  let total = Infinity;
  for (let page = 1; page <= MAX_PAGES && rows.length < total; page++) {
    const response = await apiClient.get<{ data?: unknown[]; total?: number }>(path, { params: { page, limit: PAGE }, signal });
    const batch = Array.isArray(response.data?.data) ? response.data.data : [];
    total = typeof response.data?.total === "number" ? response.data.total : rows.length + batch.length;
    const known = new Set(rows.map((row) => text(rec(row)._id)));
    const fresh = batch.filter((row) => !known.has(text(rec(row)._id)));
    if (!fresh.length) break;
    rows.push(...fresh);
  }
  return rows;
}

export async function fetchAllLeads(signal?: AbortSignal): Promise<LeadRecord[]> {
  return (await fetchAll("/businesses", signal)).map(toLead);
}

export async function fetchAllActivities(signal?: AbortSignal): Promise<ActivityRecord[]> {
  return (await fetchAll("/follow-ups", signal)).map(toActivity);
}
