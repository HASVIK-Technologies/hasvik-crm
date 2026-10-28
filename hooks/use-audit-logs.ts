import { useQuery } from "@tanstack/react-query";
import { getAuditLog, getAuditLogsPage, getEntityAuditLogs, type AuditLogQuery } from "@/lib/audit-logs/api";
import { auditLogQueryKeys } from "@/lib/audit-logs/query-keys";
import type { AuditEntityType } from "@/types/audit-log";

export function useEntityAuditLogsQuery(entityType: AuditEntityType, entityId: string) {
  return useQuery({
    queryKey: auditLogQueryKeys.entity(entityType, entityId),
    queryFn: ({ signal }) => getEntityAuditLogs(entityType, entityId, signal),
    enabled: Boolean(entityId),
    staleTime: 15_000,
  });
}

export function useBusinessAuditLogsQuery(businessId: string) {
  return useEntityAuditLogsQuery("BUSINESS", businessId);
}

export function useAuditLogQuery(entityType: AuditEntityType, entityId: string, logId: string, enabled: boolean) {
  return useQuery({
    queryKey: [...auditLogQueryKeys.entity(entityType, entityId), "record", logId],
    queryFn: ({ signal }) => getAuditLog(logId, signal),
    enabled: enabled && Boolean(logId) && !logId.startsWith("audit-log-"),
    staleTime: 15_000,
  });
}

export function useAuditLogsPageQuery(query: AuditLogQuery) {
  return useQuery({
    queryKey: ["audit-logs", "page", query],
    queryFn: ({ signal }) => getAuditLogsPage(query, signal),
    placeholderData: (previous) => previous,
    staleTime: 15_000,
  });
}
