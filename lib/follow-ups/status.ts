export const FOLLOW_UP_STATUS_LABELS: Record<string, string> = {
  SCHEDULED: "Scheduled",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  CANCELED: "Cancelled",
  OVERDUE: "Overdue",
};

export function formatFollowUpStatus(status?: string | null): string {
  if (!status || typeof status !== "string") return "-";
  const trimmed = status.trim();
  if (!trimmed || trimmed === "-") return "-";
  const normalized = trimmed.toUpperCase();
  return FOLLOW_UP_STATUS_LABELS[normalized] ?? normalized
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}
