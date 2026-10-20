import type { BusinessItem } from "@/types/business";
import type {
  ApiBusiness,
  CreateBusinessPayload,
} from "@/types/business-api";
import { toFollowUpPayload } from "./form-types.ts";
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

export function formatFollowUpDate(dateVal?: string | Date | null): string {
  if (!dateVal) return "-";
  const date = typeof dateVal === "string" ? new Date(dateVal) : dateVal;
  if (Number.isNaN(date.getTime())) {
    const trimmed = typeof dateVal === "string" ? dateVal.trim() : "";
    return trimmed && trimmed !== "-" ? trimmed : "-";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function extractLatestCompletedFollowUpDate(
  business: ApiBusiness,
): string {
  // 1. Check list of completedFollowUps and followUps on the business object
  const followUpList = [
    ...(Array.isArray(business.completedFollowUps)
      ? business.completedFollowUps
      : []),
    ...(Array.isArray(business.followUps) ? business.followUps : []),
  ];

  if (followUpList.length > 0) {
    const completedItems = followUpList.filter((item) => {
      const status = String(item.status || "").toUpperCase();
      return status === "COMPLETED" || item.isCompleted === true;
    });

    if (completedItems.length > 0) {
      let latestTime = -Infinity;
      let latestDateStr: string | undefined;

      for (const item of completedItems) {
        const rawDate =
          item.completedAt ??
          item.scheduledAt ??
          item.followUpDate ??
          item.date ??
          item.updatedAt ??
          item.createdAt;

        if (rawDate) {
          const time = new Date(rawDate).getTime();
          if (!Number.isNaN(time) && time > latestTime) {
            latestTime = time;
            latestDateStr = rawDate;
          } else if (Number.isNaN(time) && !latestDateStr) {
            latestDateStr = rawDate;
          }
        }
      }

      if (latestDateStr) {
        return formatFollowUpDate(latestDateStr);
      }
    }
  }

  // 2. Check if single followUp on business is completed
  if (business.followUp) {
    const fu = business.followUp as Record<string, unknown>;
    const status = String(fu.status || "").toUpperCase();
    if (status === "COMPLETED" || fu.isCompleted === true) {
      const rawDate = (fu.completedAt ?? fu.scheduledAt ?? fu.date) as
        | string
        | undefined;
      if (rawDate) {
        return formatFollowUpDate(rawDate);
      }
    }
  }

  // 3. Check direct API response fields for completed follow-up date
  const explicitCompletedCandidates = [
    business.lastCompletedFollowupDate,
    business.lastCompletedFollowUpDate,
    business.latestCompletedFollowUpDate,
  ];

  for (const candidate of explicitCompletedCandidates) {
    if (
      candidate &&
      typeof candidate === "string" &&
      candidate.trim() &&
      candidate.trim() !== "-"
    ) {
      return formatFollowUpDate(candidate);
    }
  }

  if (business.lastFollowUp) {
    if (typeof business.lastFollowUp === "string") {
      const val = business.lastFollowUp.trim();
      if (val && val !== "-") {
        return formatFollowUpDate(val);
      }
    } else {
      const obj = business.lastFollowUp as Record<string, unknown>;
      const status = String(obj.status || "").toUpperCase();
      const isCompleted = status === "COMPLETED" || obj.isCompleted === true;
      if (obj.completedAt && typeof obj.completedAt === "string") {
        return formatFollowUpDate(obj.completedAt);
      }
      if (isCompleted) {
        const rawDate = (obj.scheduledAt ?? obj.date) as string | undefined;
        if (
          rawDate &&
          typeof rawDate === "string" &&
          rawDate.trim() &&
          rawDate.trim() !== "-"
        ) {
          return formatFollowUpDate(rawDate);
        }
      }
    }
  }

  const fallbackDates = [
    business.lastFollowupDate,
    business.lastFollowUpDate,
  ];

  for (const candidate of fallbackDates) {
    if (
      candidate &&
      typeof candidate === "string" &&
      candidate.trim() &&
      candidate.trim() !== "-"
    ) {
      return formatFollowUpDate(candidate);
    }
  }

  // 4. Missing follow-up data: gracefully return "-"; NEVER substitute creation date.
  return "-";
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
    lastFollowUp: extractLatestCompletedFollowUpDate(business),
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
    location: business.location,
    locationUrl:
      (typeof business.location === "object" ? business.location?.url : undefined) ||
      (typeof business.location === "string" ? business.location : undefined) ||
      business.locationUrl ||
      "",
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
  if (values.locationUrl?.trim()) {
    payload.location = { url: values.locationUrl.trim() };
  }
  if (values.assignTo) payload.assignedTo = values.assignTo;
  payload.followUp = toFollowUpPayload(values);

  return payload;
}
