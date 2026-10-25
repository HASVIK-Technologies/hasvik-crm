import type { FollowUpItem } from "@/types/follow-up";

function getStatus(followUp: FollowUpItem): string {
  return followUp.status.toUpperCase();
}

export function isFollowUpReadOnly(followUp: FollowUpItem): boolean {
  return followUp.isActive === false || followUp.businessIsActive === false || followUp.tenantIsActive === false || getStatus(followUp) === "INACTIVE";
}

export function canEditFollowUp(followUp: FollowUpItem): boolean {
  if (isFollowUpReadOnly(followUp)) return false;
  const status = getStatus(followUp);
  return status === "SCHEDULED" || status === "OVERDUE";
}

export function canCancelFollowUp(followUp: FollowUpItem): boolean {
  if (isFollowUpReadOnly(followUp)) return false;
  const status = getStatus(followUp);
  return status === "SCHEDULED" || status === "OVERDUE";
}

export function canCompleteFollowUp(followUp: FollowUpItem): boolean {
  if (isFollowUpReadOnly(followUp)) return false;
  const status = getStatus(followUp);
  return status === "SCHEDULED" || status === "OVERDUE";
}

export function canCreateNextFollowUp(followUp: FollowUpItem): boolean {
  if (isFollowUpReadOnly(followUp)) return false;
  return getStatus(followUp) === "COMPLETED";
}
