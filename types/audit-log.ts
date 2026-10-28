export type AuditEntityType = "TENANT" | "BUSINESS" | "FOLLOWUP" | "CATEGORY" | "SUBSCRIPTION" | "USER";

export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "APPROVE"
  | "REJECT"
  | "ASSIGN"
  | "NOTE"
  | "STATUS_CHANGE"
  | string;

export interface AuditLogItem {
  id: string;
  action: AuditAction;
  entityType?: string;
  entityId?: string;
  /** Plain-language summary written by the API, e.g. "Business updated". */
  message?: string;
  createdAt?: string;
  userName?: string;
  userEmail?: string;
  changes?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface AuditLogsResult {
  logs: AuditLogItem[];
  total: number;
}
