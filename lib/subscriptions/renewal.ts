import type { RenewSubscriptionPayload, Subscription } from "../../types/subscription.ts";

export function buildRenewalPayload(
  subscription: Subscription,
  endDate: string,
  notes: string,
  now = Date.now(),
): RenewSubscriptionPayload {
  const payload: RenewSubscriptionPayload = {};
  if (endDate) {
    const end = Date.parse(endDate);
    const currentEnd = Date.parse(subscription.endDate ?? "");
    if (!Number.isFinite(end) || end <= Math.max(now, Number.isFinite(currentEnd) ? currentEnd : now)) {
      throw new Error("Choose a renewal end date after today and the current subscription end date.");
    }
    payload.endDate = new Date(end).toISOString();
  }
  const trimmedNotes = notes.trim();
  if (trimmedNotes.length > 1000) throw new Error("Renewal notes must be 1,000 characters or fewer.");
  if (trimmedNotes) payload.notes = trimmedNotes;
  return payload;
}
