import { apiClient } from "@/lib/api-client";
import type {
  CreateFollowUpPayload,
  FollowUpFilters,
  FollowUpItem,
  FollowUpKpis,
  FollowUpOption,
  UpdateFollowUpPayload,
  UpdateFollowUpStatusPayload,
} from "@/types/follow-up";

export type FollowUpStatusOption = Record<string, string>;

function unwrap<T>(payload: unknown): T {
  const body = payload as { data?: unknown };
  return (body?.data !== undefined ? body.data : payload) as T;
}

export function parseReminderToMinutes(
  reminder?: string | number,
): number | undefined {
  if (typeof reminder === "number") {
    return reminder >= 0 ? reminder : undefined;
  }
  if (!reminder || reminder === "none") return undefined;
  if (reminder === "1 hour") return 60;
  const match = reminder.match(/^(\d+)/);
  if (match) {
    const mins = parseInt(match[1], 10);
    return isNaN(mins) ? undefined : mins;
  }
  return undefined;
}

export function minutesToReminder(
  minutes?: number | string,
): string | undefined {
  if (minutes === undefined || minutes === null || minutes === "") return undefined;
  const mins = Number(minutes);
  if (isNaN(mins) || mins <= 0) return undefined;
  if (mins === 60) return "1 hour";
  return `${mins} minutes`;
}

function optionFromApi(value: Record<string, unknown>): FollowUpOption {
  const id = String(
    value._id ?? value.id ?? value.userId ?? value.businessId ?? "",
  );
  const label = String(
    value.name ??
      value.businessName ??
      value.fullName ??
      value.userName ??
      value.email ??
      id,
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

function parseNotes(value: unknown): string | undefined {
  if (!value) return undefined;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (
      trimmed === "[object Object]" ||
      trimmed === "null" ||
      trimmed === "undefined"
    ) {
      return "";
    }
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);
        return parseNotes(parsed);
      } catch {
        return trimmed;
      }
    }
    return trimmed;
  }
  if (Array.isArray(value)) {
    return value
      .map((item) => parseNotes(item))
      .filter(Boolean)
      .join("\n");
  }
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const directContent =
      obj.text ??
      obj.note ??
      obj.content ??
      obj.message ??
      obj.body ??
      obj.comment ??
      obj.description;
    if (directContent !== undefined && directContent !== null) {
      return parseNotes(directContent);
    }
    const textValues = Object.entries(obj)
      .filter(
        ([k, v]) =>
          !k.startsWith("_") &&
          typeof v === "string" &&
          v !== "[object Object]",
      )
      .map(([, v]) => v as string);
    if (textValues.length > 0) {
      return textValues.join(" - ");
    }
    return "";
  }
  return String(value);
}

export function toFollowUpItem(value: Record<string, unknown>): FollowUpItem {
  const business = (value.business ?? {}) as Record<string, unknown>;
  const assignee = (value.assignee ?? value.assignedTo ?? {}) as Record<
    string,
    unknown
  >;
  const rawNotes =
    value.notes ?? value.note ?? value.comment ?? value.description;

  const rawMinutes =
    value.reminderInMinutes !== undefined && value.reminderInMinutes !== null
      ? Number(value.reminderInMinutes)
      : undefined;

  const formattedReminder =
    rawMinutes !== undefined
      ? minutesToReminder(rawMinutes)
      : value.reminder
        ? String(value.reminder)
        : undefined;

  return {
    id: String(value._id ?? value.id ?? ""),
    businessId: String(value.businessId ?? business._id ?? business.id ?? ""),
    businessName: String(
      value.businessName ?? business.name ?? "Unknown business",
    ),
    businessCity: (value.businessCity || business.city)
      ? String(value.businessCity || business.city)
      : undefined,
    businessPhone: String(
      value.businessPhone ?? business.phone ?? business.phoneNumber ?? "",
    ),
    assignedToId:
      assignee._id || assignee.id
        ? String(assignee._id ?? assignee.id)
        : typeof value.assignedTo === "string"
          ? value.assignedTo
          : undefined,
    assignedToName: String(
      assignee.fullName ??
        assignee.name ??
        value.assignedToName ??
        (typeof value.assignedTo === "string" ? value.assignedTo : null) ??
        "Unassigned",
    ),
    type: String(value.type ?? "CALL"),
    status: String(value.status ?? "SCHEDULED"),
    scheduledAt: String(value.scheduledAt ?? value.followUpDate ?? ""),
    notes: parseNotes(rawNotes),
    reminder: formattedReminder,
    reminderInMinutes: rawMinutes,
  };
}

/**
 * GET /api/follow-ups
 * Query parameters: page, limit, businessId, assignedTo, status, type, fromDate, toDate, search
 */
export async function getFollowUps(
  filters: FollowUpFilters,
  signal?: AbortSignal,
) {
  const params: Record<string, string | number> = {
    page: filters.page,
    limit: filters.limit,
  };
  if (filters.search && filters.search.trim()) {
    params.search = filters.search.trim();
  }
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

/**
 * GET /api/follow-ups/{id}
 */
export async function getFollowUp(id: string, signal?: AbortSignal) {
  const response = await apiClient.get(`/follow-ups/${id}`, { signal });
  return toFollowUpItem(unwrap<Record<string, unknown>>(response.data));
}

/**
 * POST /api/follow-ups
 * Body: CreateFollowUpDto { businessId, assignedTo, type, scheduledAt, reminderInMinutes?, notes? }
 */
export async function createFollowUp(payload: CreateFollowUpPayload) {
  const reminderMinutes =
    payload.reminderInMinutes !== undefined
      ? payload.reminderInMinutes
      : parseReminderToMinutes(payload.reminder);

  const body: Record<string, unknown> = {
    businessId: payload.businessId,
    assignedTo: payload.assignedTo,
    type: payload.type,
    scheduledAt: payload.scheduledAt,
  };

  if (reminderMinutes !== undefined) {
    body.reminderInMinutes = reminderMinutes;
  }

  if (payload.notes && payload.notes.trim()) {
    body.notes = payload.notes.trim();
  }

  const response = await apiClient.post("/follow-ups", body);
  return toFollowUpItem(unwrap<Record<string, unknown>>(response.data));
}

/**
 * PATCH /api/follow-ups/{id}
 * Body: UpdateFollowUpDto { businessId?, assignedTo?, type?, scheduledAt?, reminderInMinutes?, notes? }
 * If status is provided, also updates status via PATCH /api/follow-ups/{id}/status
 */
export async function updateFollowUp(payload: UpdateFollowUpPayload) {
  const id = payload.id || payload.followUpId;
  if (!id) {
    throw new Error("Follow-up ID is required for update.");
  }

  const reminderMinutes =
    payload.reminderInMinutes !== undefined
      ? payload.reminderInMinutes
      : parseReminderToMinutes(payload.reminder);

  const body: Record<string, unknown> = {};
  if (payload.businessId) body.businessId = payload.businessId;
  if (payload.assignedTo) body.assignedTo = payload.assignedTo;
  if (payload.type) body.type = payload.type;
  if (payload.scheduledAt) body.scheduledAt = payload.scheduledAt;
  if (reminderMinutes !== undefined) {
    body.reminderInMinutes = reminderMinutes;
  }
  if (payload.notes !== undefined) {
    body.notes = payload.notes.trim();
  }

  // Update details via PATCH /api/follow-ups/{id}
  let updatedRecord: Record<string, unknown> = {};
  if (Object.keys(body).length > 0) {
    const response = await apiClient.patch(`/follow-ups/${id}`, body);
    updatedRecord = unwrap<Record<string, unknown>>(response.data) || {};
  }

  // If status is specified as COMPLETED or CANCELLED, call status endpoint
  if (payload.status === "COMPLETED" || payload.status === "CANCELLED") {
    const statusResponse = await updateFollowUpStatus({
      id,
      status: payload.status,
    });
    return statusResponse;
  }

  return toFollowUpItem(updatedRecord);
}

/**
 * PATCH /api/follow-ups/{id}/status
 * Body: UpdateFollowUpStatusDto { status: "COMPLETED" | "CANCELLED" }
 */
export async function updateFollowUpStatus(
  payload: UpdateFollowUpStatusPayload,
) {
  const response = await apiClient.patch(`/follow-ups/${payload.id}/status`, {
    status: payload.status,
  });
  return toFollowUpItem(unwrap<Record<string, unknown>>(response.data));
}

/**
 * Cancel a follow-up via PATCH /api/follow-ups/{id}/status with status "CANCELLED"
 */
export async function cancelFollowUp(id: string) {
  return updateFollowUpStatus({ id, status: "CANCELLED" });
}

/**
 * Mark a follow-up as completed via PATCH /api/follow-ups/{id}/status with status "COMPLETED"
 */
export async function completeFollowUp(id: string) {
  return updateFollowUpStatus({ id, status: "COMPLETED" });
}

/**
 * GET /api/follow-ups/kpis
 * Query parameters: businessId, assignedTo, status, type, fromDate, toDate
 */
export async function getFollowUpKpis(
  params?: Partial<FollowUpFilters>,
  signal?: AbortSignal,
) {
  const queryParams: Record<string, string> = {};
  if (params?.businessId) queryParams.businessId = params.businessId;
  if (params?.assignedTo) queryParams.assignedTo = params.assignedTo;
  if (params?.status) queryParams.status = params.status;
  if (params?.type) queryParams.type = params.type;
  if (params?.fromDate) queryParams.fromDate = params.fromDate;
  if (params?.toDate) queryParams.toDate = params.toDate;

  const response = await apiClient.get<FollowUpKpis>("/follow-ups/kpis", {
    params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
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

/**
 * GET /api/follow-ups/statuses
 */
export async function getFollowUpStatuses(signal?: AbortSignal) {
  const response = await apiClient.get<FollowUpStatusOption | string[]>(
    "/follow-ups/statuses",
    { signal },
  );
  const payload = unwrap<FollowUpStatusOption | string[]>(response.data);
  if (Array.isArray(payload)) {
    return Object.fromEntries(
      payload.map((status) => [status, status]),
    ) as FollowUpStatusOption;
  }
  return payload ?? {};
}

/**
 * GET /api/follow-ups/business/{businessId}
 */
export async function getFollowUpsByBusiness(
  businessId: string,
  signal?: AbortSignal,
) {
  const response = await apiClient.get(
    `/follow-ups/business/${businessId}`,
    { signal },
  );
  const payload = unwrap<unknown>(response.data);
  const rows = Array.isArray(payload)
    ? payload
    : ((payload as { data?: unknown[] })?.data ?? []);
  return rows.map((item) => toFollowUpItem(item as Record<string, unknown>));
}

/**
 * GET /api/follow-ups/assigned/{userId}
 */
export async function getFollowUpsByUser(
  userId: string,
  signal?: AbortSignal,
) {
  const response = await apiClient.get(
    `/follow-ups/assigned/${userId}`,
    { signal },
  );
  const payload = unwrap<unknown>(response.data);
  const rows = Array.isArray(payload)
    ? payload
    : ((payload as { data?: unknown[] })?.data ?? []);
  return rows.map((item) => toFollowUpItem(item as Record<string, unknown>));
}
