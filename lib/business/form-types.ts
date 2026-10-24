import type { FollowUpType } from "@/types/follow-up";
import type { FollowUpPayload } from "@/types/business-api";
import { fromDateTimeLocalValue } from "../forms/date-time.ts";

export type NumberFieldValue = {
  value: string;
};

export type BusinessFormValues = {
  addAnother: boolean;
  businessName: string;
  category: string;
  /** Display name for `category`; only used to prefill the dropdown label in edit mode. Never sent to the API. */
  categoryName?: string;
  city: string;
  state: string;
  pincode: string;
  address: string;
  status: string;
  /** A direct link to the business location (e.g. a Google Maps URL). */
  locationUrl: string;
  phoneNumbers: NumberFieldValue[];
  whatsappNumbers: NumberFieldValue[];
  email: string;
  website: string;
  description: string;
  scheduleFollowUp: boolean;
  followUpType: FollowUpType | "";
  assignTo: string;
  /** Display name for the selected assignee; never sent to the API. */
  assignToName?: string;
  nextFollowupDate: string;
  reminder: string;
};

export const defaultBusinessFormValues: BusinessFormValues = {
  businessName: "",
  category: "",
  categoryName: "",
  city: "",
  state: "",
  pincode: "",
  address: "",
  status: "NEW",
  locationUrl: "",
  phoneNumbers: [{ value: "" }],
  whatsappNumbers: [{ value: "" }],
  email: "",
  website: "",
  description: "",
  scheduleFollowUp: false,
  followUpType: "",
  assignTo: "",
  assignToName: "",
  nextFollowupDate: "",
  reminder: "",
  addAnother: false,
};

// Field names validated per step of the mobile wizard. Phone/WhatsApp
// numbers are validated separately (their paths depend on how many rows
// currently exist), since they're field arrays rather than single fields.
export const STEP_FIELD_NAMES = {
  business: [
    "businessName",
    "category",
    "city",
    "state",
    "pincode",
    "address",
    "status",
  ] as const,
  additional: ["website", "description"] as const,
  followup: [
    "followUpType",
    "assignTo",
    "nextFollowupDate",
    "reminder",
  ] as const,
};

export function toFollowUpPayload(
  values: BusinessFormValues,
): FollowUpPayload {
  if (!values.assignTo || !values.followUpType || !values.nextFollowupDate) {
    throw new Error("Follow-up type, assignee, and date/time are required.");
  }

  const rawDate = values.nextFollowupDate.trim();
  const normalized =
    rawDate.includes(" ") && !rawDate.includes("T")
      ? rawDate.replace(" ", "T")
      : rawDate;

  // Avoid saving a date-only value as 12:00 AM UTC
  if (!normalized.includes("T") || !normalized.split("T")[1]?.trim()) {
    throw new Error("Both follow-up date and time are required.");
  }

  const scheduledAt = fromDateTimeLocalValue(normalized);
  if (!scheduledAt) {
    throw new Error("Follow-up date and time is invalid.");
  }

  return {
    assignedTo: values.assignTo,
    type: values.followUpType,
    scheduledAt,
    ...(values.reminder
      ? { reminderInMinutes: Number(values.reminder) }
      : {}),
  };
}
