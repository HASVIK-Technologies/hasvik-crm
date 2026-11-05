import type { FollowUpItem } from "@/types/follow-up";

export interface SelectPreviousFollowUpsOptions {
  currentFollowUpId?: string;
  currentScheduledAt?: string;
  limit?: number;
}

/**
 * Extracts and returns up to `limit` (default: 10) previous follow-ups for a business,
 * excluding the current follow-up being viewed.
 * Follow-ups are sorted by scheduledAt descending (newest first).
 */
export function selectPreviousFollowUps(
  allFollowUps: FollowUpItem[],
  options: SelectPreviousFollowUpsOptions = {},
): FollowUpItem[] {
  const { currentFollowUpId, currentScheduledAt, limit = 10 } = options;

  if (!Array.isArray(allFollowUps) || allFollowUps.length === 0) {
    return [];
  }

  // Exclude the current follow-up
  const candidates = allFollowUps.filter(
    (item) => item && item.id && item.id !== currentFollowUpId,
  );

  if (candidates.length === 0) {
    return [];
  }

  // Sort candidates by scheduledAt descending (newest first)
  const sorted = [...candidates].sort((a, b) => {
    const timeA = a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0;
    const timeB = b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0;
    const safeA = Number.isNaN(timeA) ? 0 : timeA;
    const safeB = Number.isNaN(timeB) ? 0 : timeB;
    return safeB - safeA;
  });

  // If a current scheduledAt timestamp is provided, prioritize follow-ups that occurred
  // prior to or on the current follow-up (or are completed/cancelled)
  if (currentScheduledAt) {
    const currentTime = new Date(currentScheduledAt).getTime();
    if (!Number.isNaN(currentTime)) {
      const prior = sorted.filter((item) => {
        if (item.status === "COMPLETED" || item.status === "CANCELLED") return true;
        const itemTime = item.scheduledAt ? new Date(item.scheduledAt).getTime() : NaN;
        if (!Number.isNaN(itemTime)) {
          return itemTime <= currentTime;
        }
        return true;
      });

      if (prior.length > 0) {
        return prior.slice(0, limit);
      }
    }
  }

  return sorted.slice(0, limit);
}
