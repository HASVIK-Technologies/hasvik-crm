import { apiClient } from "@/lib/api/api-client";
import type { AuditLogItem, AuditLogsResult } from "@/types/audit-log";

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" ? (value as UnknownRecord) : {};
}

function asText(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function toAuditLog(value: unknown, index: number): AuditLogItem {
  const item = asRecord(value);
  const actor = asRecord(item.user ?? item.actor ?? item.userId ?? item.createdBy);
  const changes = asRecord(item.changes ?? item.changeSet ?? item.details);
  const metadata = asRecord(item.metadata);

  return {
    id: asText(item.id ?? item._id) ?? `audit-log-${index}`,
    action: asText(item.action ?? item.eventType ?? item.type) ?? "UPDATE",
    entityType: asText(item.entityType),
    entityId: asText(item.entityId),
    createdAt: asText(item.createdAt ?? item.timestamp ?? item.date),
    userName: asText(actor.fullName ?? actor.name ?? item.userName),
    userEmail: asText(actor.email ?? item.userEmail),
    changes: Object.keys(changes).length ? changes : undefined,
    metadata: Object.keys(metadata).length ? metadata : undefined,
  };
}

export async function getBusinessAuditLogs(
  businessId: string,
  signal?: AbortSignal,
): Promise<AuditLogsResult> {
  const response = await apiClient.get<unknown>("/audit-logs", {
    params: {
      entityType: "BUSINESS",
      entityId: businessId,
      page: 1,
      limit: 30,
      sortOrder: "desc",
    },
    signal,
  });
  const payload = asRecord(response.data);
  const rawLogs = Array.isArray(response.data)
    ? response.data
    : Array.isArray(payload.data)
      ? payload.data
      : Array.isArray(payload.logs)
        ? payload.logs
      : Array.isArray(payload.items)
        ? payload.items
        : Array.isArray(payload.results)
          ? payload.results
        : [];

  return {
    logs: rawLogs.map(toAuditLog),
    total: typeof payload.total === "number" ? payload.total : rawLogs.length,
  };
}
