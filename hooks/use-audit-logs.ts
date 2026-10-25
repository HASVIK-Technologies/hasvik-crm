import { useQuery } from "@tanstack/react-query";
import { getBusinessAuditLogs } from "@/lib/audit-logs/api";

export function useBusinessAuditLogsQuery(businessId: string) {
  return useQuery({
    queryKey: ["audit-logs", "business", businessId],
    queryFn: ({ signal }) => getBusinessAuditLogs(businessId, signal),
    enabled: Boolean(businessId),
    staleTime: 15_000,
  });
}
