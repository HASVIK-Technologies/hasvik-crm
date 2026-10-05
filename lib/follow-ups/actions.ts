import type { FollowUpItem } from "@/types/follow-up";

function getStatus(followUp: FollowUpItem): string {
  return followUp.status.toUpperCase();
}

export function canEditFollowUp(followUp: FollowUpItem): boolean {
  const status = getStatus(followUp);
  return status === "SCHEDULED" || status === "OVERDUE";
}

export function canCancelFollowUp(followUp: FollowUpItem): boolean {
  const status = getStatus(followUp);
  return status === "SCHEDULED" || status === "OVERDUE";
}

export function canCompleteFollowUp(followUp: FollowUpItem): boolean {
  const status = getStatus(followUp);
  return status === "SCHEDULED" || status === "OVERDUE" || status === "CANCELLED";
}

export function canCreateNextFollowUp(followUp: FollowUpItem): boolean {
  return getStatus(followUp) === "COMPLETED";
}
