import type { FollowUpItem } from "../../types/follow-up.ts";

/** History is relative to the selected follow-up and never includes future appointments. */
export function getPreviousFollowUps(items: FollowUpItem[], current: FollowUpItem, now = Date.now()) {
  const cutoff = Math.min(Date.parse(current.scheduledAt), now);
  if (!current.businessId || !Number.isFinite(cutoff)) return [];
  return items.filter((item) => item.id && item.id !== current.id
    && item.businessId === current.businessId
    && Date.parse(item.scheduledAt) < cutoff)
    .sort((a, b) => Date.parse(b.scheduledAt) - Date.parse(a.scheduledAt) || a.id.localeCompare(b.id));
}
