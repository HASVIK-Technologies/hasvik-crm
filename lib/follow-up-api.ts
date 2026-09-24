import { apiClient } from "@/lib/api-client";
import type {
  CreateFollowUpPayload,
  FollowUpFilters,
  FollowUpItem,
  FollowUpKpis,
  FollowUpOption,
  UpdateFollowUpPayload,
} from "@/types/follow-up";

export type FollowUpStatusOption = Record<string, string>;

function unwrap<T>(payload: unknown): T {
  const body = payload as { data?: unknown };
  return (body?.data ?? payload) as T;
}

function optionFromApi(value: Record<string, unknown>): FollowUpOption {
  const id = String(
    value._id ?? value.id ?? value.userId ?? value.businessId ?? "",
  );
  const label = String(
    value.name ?? value.businessName ?? value.fullName ?? value.email ?? id,
  );
  return {
    id,
    label,
    subtitle: value.email
      ? String(value.email)
      : value.city
        ? String(value.city)
        : undefined,
  };
}

export async function getFollowUpOptions(
  path: string,
  search: string,
  signal?: AbortSignal,
) {
  const response = await apiClient.get(path, { params: { search }, signal });
  const payload = unwrap<unknown>(response.data);
  const rows = Array.isArray(payload)
    ? payload
    : ((payload as { data?: unknown[] })?.data ?? []);
  return rows
    .filter((item): item is Record<string, unknown> =>
      Boolean(item && typeof item === "object"),
    )
    .map(optionFromApi);
}

function toFollowUpItem(value: Record<string, unknown>): FollowUpItem {
  const business = (value.business ?? {}) as Record<string, unknown>;
  const assignee = (value.assignedTo ?? {}) as Record<string, unknown>;
  return {
    id: String(value._id ?? value.id ?? ""),
    businessId: String(value.businessId ?? business._id ?? business.id ?? ""),
    businessName: String(
      value.businessName ?? business.name ?? "Unknown business",
    ),
    businessCity: business.city ? String(business.city) : undefined,
    businessPhone: String(
      value.businessPhone ?? business.phone ?? business.phoneNumber ?? "",
    ),
    assignedToId:
      assignee._id || assignee.id
        ? String(assignee._id ?? assignee.id)
        : typeof value.assignedTo === "string"
          ? value.assignedTo
          : undefined,
    assignedToName:
      typeof value.assignedTo === "string"
        ? value.assignedTo
        : String(
            value.assignedToName ??
              assignee.name ??
              assignee.fullName ??
              "Unassigned",
          ),
    type: String(value.type ?? "CALL"),
    status: String(value.status ?? "SCHEDULED"),
    scheduledAt: String(value.scheduledAt ?? value.followUpDate ?? ""),
    notes: value.notes ? String(value.notes) : undefined,
  };
}

export async function getFollowUps(
  filters: FollowUpFilters,
  signal?: AbortSignal,
) {
  const params: Record<string, string | number> = {
    page: filters.page,
    limit: filters.limit,
  };
  if (filters.search.trim()) params.search = filters.search.trim();
  if (filters.businessId) params.businessId = filters.businessId;
  if (filters.assignedTo) params.assignedTo = filters.assignedTo;
  if (filters.status) params.status = filters.status;
  if (filters.type) params.type = filters.type;
  if (filters.fromDate) params.fromDate = filters.fromDate;
  if (filters.toDate) params.toDate = filters.toDate;

  const response = await apiClient.get("/follow-ups", { params, signal });
  const root = response.data as {
    data?: unknown;
    total?: number;
    totalPages?: number;
  };
  const nested = root.data as
    | { data?: unknown[]; total?: number; totalPages?: number }
    | unknown[]
    | undefined;
  const rows = Array.isArray(nested)
    ? nested
    : Array.isArray(nested?.data)
      ? nested.data
      : Array.isArray(root.data)
        ? root.data
        : [];
  const total =
    root.total ??
    (!Array.isArray(nested) ? nested?.total : undefined) ??
    rows.length;
  const totalPages =
    root.totalPages ??
    (!Array.isArray(nested) ? nested?.totalPages : undefined) ??
    Math.max(1, Math.ceil(total / filters.limit));
  return {
    items: rows.map((item) => toFollowUpItem(item as Record<string, unknown>)),
    total,
    totalPages,
  };
}

export async function getFollowUpKpis(signal?: AbortSignal) {
  const response = await apiClient.get<FollowUpKpis>("/follow-ups/kpis", {
    signal,
  });
  const value = unwrap<Partial<FollowUpKpis>>(response.data);
  return {
    total: value.total ?? 0,
    today: value.today ?? 0,
    upcoming: value.upcoming ?? 0,
    overdue: value.overdue ?? 0,
  };
}

export async function getFollowUpStatuses(signal?: AbortSignal) {
  const response = await apiClient.get<FollowUpStatusOption | string[]>("/follow-ups/statuses", { signal });
  const payload = unwrap<FollowUpStatusOption | string[]>(response.data);
  if (Array.isArray(payload)) {
    return Object.fromEntries(payload.map((status) => [status, status])) as FollowUpStatusOption;
  }
  return payload ?? {};
}

export async function createFollowUp(payload: CreateFollowUpPayload) {
  const response = await apiClient.post("/follow-ups", payload);
  return unwrap<FollowUpItem>(response.data);
}

export async function getFollowUp(id: string, signal?: AbortSignal) {
  const response = await apiClient.get(`/follow-ups/${id}`, { signal });
  return toFollowUpItem(unwrap<Record<string, unknown>>(response.data));
}

export async function updateFollowUp(payload: UpdateFollowUpPayload) {
  const response = await apiClient.patch("/follow-ups", payload);
  return unwrap<FollowUpItem>(response.data);
}

export async function cancelFollowUp(id: string) {
  const response = await apiClient.delete("/follow-ups", { data: { id } });
  return response.data;
}
