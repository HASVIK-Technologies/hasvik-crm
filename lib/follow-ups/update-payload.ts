import { changedFields } from "../forms/changed-fields.ts";
import { fromDateTimeLocalValue, toDateTimeLocalValue } from "../forms/date-time.ts";

interface EditableFollowUp {
  assignedTo: string;
  type: string;
  scheduledAt: string;
  reminderInMinutes: number;
}

export function toFollowUpUpdatePayload(values: EditableFollowUp, original: EditableFollowUp) {
  const { scheduledAt, ...fields } = values;
  const { scheduledAt: originalSchedule, ...baseline } = original;
  const updates: Partial<EditableFollowUp> = changedFields(fields, baseline);
  // Compare at the form's minute precision so an unrelated edit never truncates
  // seconds from the saved schedule or overwrites a concurrent reschedule.
  if (scheduledAt !== toDateTimeLocalValue(originalSchedule)) {
    const instant = fromDateTimeLocalValue(scheduledAt);
    if (!instant) throw new Error("Enter a valid date and time.");
    updates.scheduledAt = instant;
  }
  return updates;
}
