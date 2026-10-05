import type { BusinessItem } from "@/types/business";
import type {
  ApiBusiness,
  CreateBusinessPayload,
} from "@/types/business-api";
import { toFollowUpPayload } from "@/lib/business/form-types";
import type {
  BusinessFormValues,
  NumberFieldValue,
} from "@/lib/business/form-types";

function getPrimaryNumber(
  numbers: ApiBusiness["phoneNumbers"],
): string {
  return (
    numbers?.find((number) => number.isPrimary)?.number ??
    numbers?.[0]?.number ??
    ""
  );
}

function formatCreatedAt(createdAt?: string): string {
  if (!createdAt) return "-";
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function parseFollowUp(dateStr?: string): {
  nextFollowUp: string;
  nextFollowUpType: BusinessItem["nextFollowUpType"];
} {
  if (!dateStr) return { nextFollowUp: "-", nextFollowUpType: "none" };

  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) {
    return { nextFollowUp: dateStr, nextFollowUpType: "none" };
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const daysFromToday = Math.round(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
  const formattedDate = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);

  if (daysFromToday === 0) {
    return { nextFollowUp: "Today", nextFollowUpType: "today" };
  }
  if (daysFromToday === 1) {
    return { nextFollowUp: "Tomorrow", nextFollowUpType: "tomorrow" };
  }
  if (daysFromToday < 0) {
    return { nextFollowUp: formattedDate, nextFollowUpType: "overdue" };
  }
  return { nextFollowUp: formattedDate, nextFollowUpType: "date" };
}

export function toBusinessItem(business: ApiBusiness): BusinessItem {
  const initials = business.name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const followUpInfo = parseFollowUp(business.nextFollowupDate);
  const rawCategory = business.category;
  const categoryName =
    rawCategory && typeof rawCategory === "object"
      ? rawCategory.name
      : rawCategory;
  const category =
    typeof categoryName === "string" && categoryName
      ? categoryName
      : business.categoryId || "Uncategorized";

  return {
    id: business._id,
    name: business.name,
    phone: getPrimaryNumber(business.phoneNumbers),
    initials: initials || "NB",
    avatarBg: "bg-[#e0eafe]",
    avatarTextColor: "text-[#2e90fa]",
    category,
    city: business.city ?? "-",
    state: business.state ?? "-",
    leadStatus: business.status ?? "-",
    status: business.isActive === false ? "Inactive" : "Active",
    isActive: business.isActive,
    lastFollowUp: formatCreatedAt(business.createdAt),
    nextFollowUp: followUpInfo.nextFollowUp,
    nextFollowUpType: followUpInfo.nextFollowUpType,
    nextFollowupDate: business.nextFollowupDate,
    reminder: business.reminder,
    description: business.description,
    notes: business.notes,
    owner: business.assignedTo,
    address: business.address,
    email: business.email,
    website: business.website,
    leadSource: business.leadSource,
    businessType: business.businessType,
    assignedTo: business.assignedTo,
    alternatePhone: getPrimaryNumber(business.whatsappNumbers),
  };
}

function toNumberEntries(
  numbers: NumberFieldValue[],
  contactName: string,
): CreateBusinessPayload["phoneNumbers"] {
  return numbers
    .filter((entry) => entry.value.trim().length > 0)
    .map((entry, index) => ({
      number: entry.value.trim(),
      name: contactName,
      isPrimary: index === 0,
    }));
}

export function toCreateBusinessPayload(
  values: BusinessFormValues,
): CreateBusinessPayload {
  const businessName = values.businessName.trim();
  const payload: CreateBusinessPayload = {
    name: businessName,
    categoryId: values.category,
    status: values.status,
    phoneNumbers: toNumberEntries(values.phoneNumbers, businessName),
    whatsappNumbers: toNumberEntries(values.whatsappNumbers, businessName),
    address: values.address.trim(),
    city: values.city,
    state: values.state.trim(),
    pincode: values.pincode.trim(),
  };

  if (values.email.trim()) payload.email = values.email.trim();
  if (values.website.trim()) payload.website = values.website.trim();
  if (values.assignTo) payload.assignedTo = values.assignTo;
  payload.followUp = toFollowUpPayload(values);

  return payload;
}
