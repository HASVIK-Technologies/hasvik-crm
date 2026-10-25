import { apiClient } from "@/lib/api/api-client";
import { getBusinessRaw } from "@/lib/business/api";
import { isRecordInactive } from "@/lib/records/activity";
import { isFollowUpReadOnly } from "@/lib/follow-ups/actions";
import type {
  CreateFollowUpPayload,
  FollowUpFilters,
  FollowUpQueryFilters,
  FollowUpItem,
  FollowUpKpis,
  FollowUpOption,
  UpdateFollowUpPayload,
  UpdateFollowUpStatusPayload,
} from "@/types/follow-up";
import { formatFollowUpStatus } from "@/lib/follow-ups/status";

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
  const resolvedName =
    (value.fullName && String(value.fullName).trim()) ||
    ([value.firstName, value.lastName]
      .filter(Boolean)
      .map(String)
      .join(" ")
      .trim() ||
      undefined) ||
    (value.name && String(value.name).trim()) ||
    (value.businessName && String(value.businessName).trim()) ||
    (value.userName && String(value.userName).trim()) ||
    (value.email && String(value.email).trim()) ||
    id;

  const label = String(resolvedName);
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

function extractPhoneNumber(raw: unknown): string | undefined {
  if (!raw) return undefined;
  if (typeof raw === "string" && raw.trim()) return raw.trim();
  if (Array.isArray(raw) && raw.length > 0) {
    const primary = raw.find(
      (item) => typeof item === "object" && item !== null && (item as { isPrimary?: boolean }).isPrimary,
    ) as { number?: string; value?: string } | undefined;
    if (primary?.number && String(primary.number).trim()) return String(primary.number).trim();
    if (primary?.value && String(primary.value).trim()) return String(primary.value).trim();
    const first = raw[0];
    if (typeof first === "string" && first.trim()) return first.trim();
    if (typeof first === "object" && first !== null) {
      const obj = first as { number?: string; value?: string };
      if (obj.number && String(obj.number).trim()) return String(obj.number).trim();
      if (obj.value && String(obj.value).trim()) return String(obj.value).trim();
    }
  }
  return undefined;
}

function extractNumberEntries(raw: unknown) {
  if (!raw) return [];
  const values = Array.isArray(raw) ? raw : [raw];
  return values.flatMap((value) => {
    if (typeof value === "string" && value.trim()) return [{ number: value.trim() }];
    if (!value || typeof value !== "object") return [];
    const entry = value as Record<string, unknown>;
    const number = String(entry.number ?? entry.value ?? "").trim();
    if (!number) return [];
    return [{
      number,
      name: entry.name ? String(entry.name) : undefined,
      type: entry.type ? String(entry.type) : undefined,
      isPrimary: entry.isPrimary === true,
    }];
  });
}

function extractMeetingLink(value: Record<string, unknown>) {
  const meeting = value.meeting && typeof value.meeting === "object"
    ? value.meeting as Record<string, unknown>
    : {};
  const candidate = value.meetingLink ?? value.meetingUrl ?? value.meetingURL ?? value.joinUrl ?? value.joinLink ?? meeting.url ?? meeting.link ?? meeting.joinUrl;
  if (typeof candidate !== "string") return undefined;
  const trimmed = candidate.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : undefined;
}

export function toFollowUpItem(value: Record<string, unknown>): FollowUpItem {
  const business = (value.business ?? (typeof value.businessId === "object" ? value.businessId : {}) ?? {}) as Record<string, unknown>;
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

  const callingNumber =
    extractPhoneNumber(business.phoneNumbers) ||
    extractPhoneNumber(value.phoneNumbers) ||
    (business.phone ? String(business.phone) : undefined) ||
    (business.phoneNumber ? String(business.phoneNumber) : undefined) ||
    (value.businessPhone ? String(value.businessPhone) : undefined) ||
    (value.phone ? String(value.phone) : undefined);

  const whatsappNumber =
    extractPhoneNumber(business.whatsappNumbers) ||
    extractPhoneNumber(value.whatsappNumbers) ||
    (business.whatsapp ? String(business.whatsapp) : undefined) ||
    (business.whatsappNumber ? String(business.whatsappNumber) : undefined) ||
    (business.alternatePhone ? String(business.alternatePhone) : undefined) ||
    (value.whatsapp ? String(value.whatsapp) : undefined) ||
    (value.whatsappNumber ? String(value.whatsappNumber) : undefined);

  const phoneNumbers = extractNumberEntries(business.phoneNumbers ?? value.phoneNumbers);
  const whatsappNumbers = extractNumberEntries(business.whatsappNumbers ?? value.whatsappNumbers);

  const email =
    (business.email ? String(business.email) : undefined) ||
    (business.contactEmail ? String(business.contactEmail) : undefined) ||
    (value.email ? String(value.email) : undefined) ||
    (value.businessEmail ? String(value.businessEmail) : undefined);

  return {
    id: String(value._id ?? value.id ?? ""),
    isActive: typeof value.isActive === "boolean" ? value.isActive : undefined,
    businessIsActive: typeof business.isActive === "boolean" ? business.isActive : typeof value.businessIsActive === "boolean" ? value.businessIsActive : undefined,
    tenantIsActive: typeof value.tenantIsActive === "boolean" ? value.tenantIsActive : undefined,
    businessId: String(typeof value.businessId === "string" ? value.businessId : business._id ?? business.id ?? ""),
    businessName: String(
      value.businessName ?? business.name ?? "Unknown business",
    ),
    businessCity: (value.businessCity || business.city)
      ? String(value.businessCity || business.city)
      : undefined,
    businessPhone: callingNumber || whatsappNumber || "",
    businessCallingNumber: callingNumber,
    businessWhatsappNumber: whatsappNumber,
    businessPhoneNumbers: phoneNumbers.length ? phoneNumbers : callingNumber ? [{ number: callingNumber }] : [],
    businessWhatsappNumbers: whatsappNumbers.length ? whatsappNumbers : whatsappNumber ? [{ number: whatsappNumber }] : [],
    businessEmail: email,
    meetingLink: extractMeetingLink(value),
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
 * Query parameters: page, limit, businessId, assignedTo, status, type, fromDate, toDate, isCalendarView
 */
export async function getFollowUps(
  filters: FollowUpQueryFilters,
  signal?: AbortSignal,
) {
  const params: Record<string, string | number | boolean> = {};
  if (filters.page !== undefined) params.page = filters.page;
  if (filters.limit !== undefined) params.limit = filters.limit;
  if (filters.businessId) params.businessId = filters.businessId;
  if (filters.assignedTo) params.assignedTo = filters.assignedTo;
  if (filters.status) params.status = filters.status;
  if (filters.type) params.type = filters.type;
  if (filters.fromDate) params.fromDate = filters.fromDate;
  if (filters.toDate) params.toDate = filters.toDate;
  if (filters.isCalendarView !== undefined) {
    params.isCalendarView = filters.isCalendarView;
  }

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
    (filters.limit ? Math.max(1, Math.ceil(total / filters.limit)) : 1);

  return {
    items: rows.map((item) => toFollowUpItem(item as Record<string, unknown>)),
    total,
    totalPages,
  };
}

/**
 * POST /api/follow-ups
 * Body: CreateFollowUpDto { businessId, assignedTo, type, scheduledAt, reminderInMinutes?, notes? }
 */
export async function createFollowUp(payload: CreateFollowUpPayload) {
  await assertBusinessActive(payload.businessId);
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
    const trimmedNotes = payload.notes.trim();
    body.notes = trimmedNotes;
    body.note = trimmedNotes;
  }

  const response = await apiClient.post("/follow-ups", body);
  return toFollowUpItem(unwrap<Record<string, unknown>>(response.data));
}

/**
 * PATCH /api/follow-ups/{id}
 * Body: UpdateFollowUpDto { businessId?, assignedTo?, type?, scheduledAt?, reminderInMinutes?, notes?, note? }
 * If status is provided, also updates status via PATCH /api/follow-ups/{id}/status
 */
export async function updateFollowUp(payload: UpdateFollowUpPayload) {
  const id = payload.id || payload.followUpId;
  if (!id) {
    throw new Error("Follow-up ID is required for update.");
  }
  await assertFollowUpWritable(id);
  if (payload.businessId) await assertBusinessActive(payload.businessId);

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
    const trimmedNotes = payload.notes.trim();
    body.notes = trimmedNotes;
  }

  let updatedRecord: Record<string, unknown> = {};
  if (Object.keys(body).length > 0) {
    const response = await apiClient.patch(`/follow-ups/${id}`, body);
    updatedRecord = unwrap<Record<string, unknown>>(response.data) || {};
  }

  if (payload.status === "COMPLETED" || payload.status === "CANCELLED") {
    const statusResponse = await updateFollowUpStatus({ id, status: payload.status });
    if (payload.notes !== undefined) statusResponse.notes = payload.notes.trim();
    return statusResponse;
  }

  const item = toFollowUpItem({
    ...body,
    ...updatedRecord,
    id,
    _id: id,
  });
  if (payload.notes !== undefined) {
    item.notes = payload.notes.trim();
  }
  if (payload.reminder !== undefined) {
    item.reminder = payload.reminder;
  }
  if (payload.type) {
    item.type = payload.type;
  }
  if (payload.scheduledAt) {
    item.scheduledAt = payload.scheduledAt;
  }

  return item;
}

/**
 * PATCH /api/follow-ups/{id}/status
 * Body: UpdateFollowUpStatusDto { status: "COMPLETED" | "CANCELLED" }
 */
export async function updateFollowUpStatus(
  payload: UpdateFollowUpStatusPayload,
): Promise<ReturnType<typeof toFollowUpItem>>;
export async function updateFollowUpStatus(
  id: string,
  status: UpdateFollowUpStatusPayload["status"],
): Promise<ReturnType<typeof toFollowUpItem>>;
export async function updateFollowUpStatus(
  payloadOrId: UpdateFollowUpStatusPayload | string,
  status?: UpdateFollowUpStatusPayload["status"],
) {
  const payload: UpdateFollowUpStatusPayload =
    typeof payloadOrId === "string"
      ? { id: payloadOrId, status: status ?? "COMPLETED" }
      : payloadOrId;

  await assertFollowUpWritable(payload.id);

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
      payload.map((status) => [status, formatFollowUpStatus(status)]),
    ) as FollowUpStatusOption;
  }
  return Object.fromEntries(
    Object.entries(payload ?? {}).map(([key, label]) => [key, formatFollowUpStatus(label || key)]),
  );
}

export async function getFollowUp(id: string, signal?: AbortSignal) {
  const response = await apiClient.get(`/follow-ups/${id}`, { signal });
  return toFollowUpItem(unwrap<Record<string, unknown>>(response.data));
}

async function assertBusinessActive(id: string) {
  if (!id) throw new Error("A business is required to change follow-ups.");
  if (isRecordInactive(await getBusinessRaw(id))) throw new Error("This business is inactive. Activate it before changing follow-ups.");
}

export async function assertFollowUpWritable(id: string) {
  const followUp = await getFollowUp(id);
  if (isFollowUpReadOnly(followUp)) throw new Error("This follow-up is read-only because it or its parent record is inactive.");
  await assertBusinessActive(followUp.businessId);
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
