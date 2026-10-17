import type { FollowUpType } from "@/types/follow-up";
import type { FollowUpPayload } from "@/types/business-api";
import { fromDateTimeLocalValue } from "@/lib/forms/date-time";

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
  followUpType: FollowUpType | "";
  assignTo: string;
  /** Display name for `assignTo`; used to display the user's full name in the dropdown. Never sent to the API. */
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
  status: "",
  locationUrl: "",
  phoneNumbers: [{ value: "" }],
  whatsappNumbers: [{ value: "" }],
  email: "",
  website: "",
  description: "",
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

  const scheduledAt = fromDateTimeLocalValue(values.nextFollowupDate);
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
