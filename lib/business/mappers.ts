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
  }).format(date);
}

function extractDateFromFollowUpEntry(entry: unknown): string | undefined {
  if (!entry) return undefined;
  if (typeof entry === "string") {
    const trimmed = entry.trim();
    return trimmed && trimmed !== "-" ? trimmed : undefined;
  }
  if (entry instanceof Date && !Number.isNaN(entry.getTime())) {
    return entry.toISOString();
  }
  if (typeof entry === "object") {
    const obj = entry as Record<string, unknown>;
    const raw =
      obj.scheduledAt ??
      obj.nextFollowupDate ??
      obj.nextFollowUpDate ??
      obj.followUpDate ??
      obj.date ??
      obj.completedAt;
    if (typeof raw === "string") {
      const trimmed = raw.trim();
      return trimmed && trimmed !== "-" ? trimmed : undefined;
    }
    if (raw instanceof Date && !Number.isNaN(raw.getTime())) {
      return raw.toISOString();
    }
  }
  return undefined;
}

export function extractNextFollowUpDate(
  business: ApiBusiness,
): string | undefined {
  const b = business as Record<string, unknown>;

  const candidates = [
    b.nextFollowups,
    b.nextFollowup,
    b.nextFollowUp,
    b.nextFollowupDate,
    b.nextFollowUpDate,
    b.nextFollowUpDateTime,
    b.nextFollowupDateTime,
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;

    // 1. Direct string
    if (typeof candidate === "string") {
      const trimmed = candidate.trim();
      if (trimmed && trimmed !== "-") return trimmed;
    }

    // 2. Array of follow-ups
    if (Array.isArray(candidate) && candidate.length > 0) {
      const pendingItems = candidate.filter((item: unknown) => {
        if (!item || typeof item !== "object") return true;
        const status = String((item as Record<string, unknown>).status || "").toUpperCase();
        return status !== "COMPLETED" && status !== "CANCELLED";
      });

      const listToSearch = pendingItems.length > 0 ? pendingItems : candidate;

      let earliestTime = Infinity;
      let earliestDateStr: string | undefined;

      for (const item of listToSearch) {
        const rawDate = extractDateFromFollowUpEntry(item);
        if (rawDate) {
          const cleaned = rawDate.replace(/\s+at\s+/i, " ");
          const time = new Date(cleaned).getTime();
          if (!Number.isNaN(time)) {
            if (time < earliestTime) {
              earliestTime = time;
              earliestDateStr = rawDate;
            }
          } else if (!earliestDateStr) {
            earliestDateStr = rawDate;
          }
        }
      }

      if (earliestDateStr) return earliestDateStr;
    }

    // 3. Single object
    if (typeof candidate === "object") {
      const dateStr = extractDateFromFollowUpEntry(candidate);
      if (dateStr) return dateStr;
    }
  }

  // Fallback 1: check business.followUps array for scheduled follow-ups
  if (Array.isArray(business.followUps) && business.followUps.length > 0) {
    const scheduled = business.followUps.filter((item) => {
      const status = String(item.status || "").toUpperCase();
      return status === "SCHEDULED" || (!status && !item.isCompleted);
    });

    let earliestTime = Infinity;
    let earliestDateStr: string | undefined;

    for (const item of scheduled) {
      const rawDate = extractDateFromFollowUpEntry(item);
      if (rawDate) {
        const cleaned = rawDate.replace(/\s+at\s+/i, " ");
        const time = new Date(cleaned).getTime();
        if (!Number.isNaN(time) && time < earliestTime) {
          earliestTime = time;
          earliestDateStr = rawDate;
        } else if (Number.isNaN(time) && !earliestDateStr) {
          earliestDateStr = rawDate;
        }
      }
    }

    if (earliestDateStr) return earliestDateStr;
  }

  // Fallback 2: check single business.followUp object
  if (business.followUp) {
    const fu = business.followUp as Record<string, unknown>;
    const status = String(fu.status || "").toUpperCase();
    if (status !== "COMPLETED" && status !== "CANCELLED") {
      const dateStr = extractDateFromFollowUpEntry(fu);
      if (dateStr) return dateStr;
    }
  }

  return undefined;
}

export function extractLatestCompletedFollowUpDate(
  business: ApiBusiness,
): string {
  const b = business as Record<string, unknown>;

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
          item.followUpDate ??
          item.date ??
          item.scheduledAt;

        if (rawDate) {
          const cleaned = typeof rawDate === "string" ? rawDate.replace(/\s+at\s+/i, " ") : rawDate;
          const time = new Date(cleaned).getTime();
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
      const rawDate = (fu.completedAt ?? fu.followUpDate ?? fu.date ?? fu.scheduledAt) as
        | string
        | undefined;
      if (rawDate) {
        return formatFollowUpDate(rawDate);
      }
    }
  }

  // 3. Check direct API response fields for completed follow-up date
  const explicitCompletedCandidates = [
    b.lastCompletedFollowupDate,
    b.lastCompletedFollowUpDate,
    b.latestCompletedFollowUpDate,
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

  // 4. Check lastFollowup / lastFollowUp / lastFollowups from API response
  const lastFollowUpCandidates = [
    b.lastFollowup,
    b.lastFollowUp,
    b.lastFollowups,
  ];

  for (const candidate of lastFollowUpCandidates) {
    if (!candidate) continue;

    if (typeof candidate === "string") {
      const val = candidate.trim();
      if (val && val !== "-") {
        return formatFollowUpDate(val);
      }
    } else if (Array.isArray(candidate) && candidate.length > 0) {
      const completedCandidateItems = candidate.filter((item: unknown) => {
        if (!item || typeof item !== "object") return true;
        const status = String((item as Record<string, unknown>).status || "").toUpperCase();
        return (
          status === "COMPLETED" ||
          (item as Record<string, unknown>).isCompleted === true ||
          Boolean((item as Record<string, unknown>).completedAt)
        );
      });

      let latestTime = -Infinity;
      let latestDateStr: string | undefined;

      for (const item of completedCandidateItems) {
        if (!item) continue;
        let rawDate: string | undefined;
        if (typeof item === "string") {
          rawDate = item.trim();
        } else if (typeof item === "object") {
          const obj = item as Record<string, unknown>;
          const d =
            obj.completedAt ??
            obj.followUpDate ??
            obj.date ??
            obj.scheduledAt;
          if (typeof d === "string") rawDate = d.trim();
          else if (d instanceof Date && !Number.isNaN(d.getTime())) {
            rawDate = d.toISOString();
          }
        }

        if (rawDate && rawDate !== "-") {
          const cleaned = rawDate.replace(/\s+at\s+/i, " ");
          const time = new Date(cleaned).getTime();
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
    } else if (typeof candidate === "object") {
      const obj = candidate as Record<string, unknown>;
      const status = String(obj.status || "").toUpperCase();
      const isCompleted =
        status === "COMPLETED" ||
        obj.isCompleted === true ||
        Boolean(obj.completedAt);

      if (status && status !== "COMPLETED" && !obj.completedAt && !obj.isCompleted) {
        continue;
      }

      const rawDate =
        obj.completedAt ??
        obj.followUpDate ??
        obj.date ??
        (isCompleted || !status ? obj.scheduledAt : undefined);

      if (rawDate) {
        if (typeof rawDate === "string") {
          const val = rawDate.trim();
          if (val && val !== "-") return formatFollowUpDate(val);
        } else if (rawDate instanceof Date && !Number.isNaN(rawDate.getTime())) {
          return formatFollowUpDate(rawDate);
        }
      }
    }
  }

  // 5. Fallback date fields
  const fallbackDates = [
    b.lastFollowupDate,
    b.lastFollowUpDate,
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

  // 6. Missing follow-up data: gracefully return "-"; NEVER substitute creation date.
  return "-";
}

export function parseFollowUp(dateStr?: string): {
  nextFollowUp: string;
  nextFollowUpType: BusinessItem["nextFollowUpType"];
} {
  if (!dateStr || dateStr.trim() === "-") {
    return { nextFollowUp: "-", nextFollowUpType: "none" };
  }

  const trimmed = dateStr.trim();
  const lower = trimmed.toLowerCase();

  if (lower === "today" || lower.startsWith("today ")) {
    return { nextFollowUp: trimmed, nextFollowUpType: "today" };
  }
  if (lower === "tomorrow" || lower.startsWith("tomorrow ")) {
    return { nextFollowUp: trimmed, nextFollowUpType: "tomorrow" };
  }

  const cleaned = trimmed.replace(/\s+at\s+/i, " ");
  const date = new Date(cleaned);
  if (Number.isNaN(date.getTime())) {
    return { nextFollowUp: trimmed, nextFollowUpType: "date" };
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

function getFollowUpId(value: unknown): string | undefined {
  if (!value || typeof value !== "object") return undefined;
  const record = value as Record<string, unknown>;
  const id = record._id ?? record.id;
  return typeof id === "string" && id.trim() ? id : undefined;
}

function selectFollowUpId(
  values: unknown[],
  mode: "next" | "last",
): string | undefined {
  const entries = values.flatMap((value) => Array.isArray(value) ? value : [value]);
  const eligible = entries.filter((value) => {
    if (!value || typeof value !== "object" || !getFollowUpId(value)) return false;
    const record = value as Record<string, unknown>;
    const status = String(record.status ?? "").toUpperCase();
    return mode === "next"
      ? status !== "COMPLETED" && status !== "CANCELLED"
      : status === "COMPLETED" || record.isCompleted === true || Boolean(record.completedAt);
  });

  eligible.sort((left, right) => {
    const leftDate = extractDateFromFollowUpEntry(left);
    const rightDate = extractDateFromFollowUpEntry(right);
    const leftTime = leftDate ? new Date(leftDate.replace(/\s+at\s+/i, " ")).getTime() : NaN;
    const rightTime = rightDate ? new Date(rightDate.replace(/\s+at\s+/i, " ")).getTime() : NaN;
    const safeLeft = Number.isNaN(leftTime) ? (mode === "next" ? Infinity : -Infinity) : leftTime;
    const safeRight = Number.isNaN(rightTime) ? (mode === "next" ? Infinity : -Infinity) : rightTime;
    return mode === "next" ? safeLeft - safeRight : safeRight - safeLeft;
  });

  return getFollowUpId(eligible[0]);
}

function extractFollowUpIds(business: ApiBusiness) {
  const record = business as Record<string, unknown>;
  const explicitLastFollowUpId = [
    record.lastFollowup,
    record.lastFollowUp,
    record.lastFollowups,
  ]
    .flatMap((value) => Array.isArray(value) ? value : [value])
    .find((value) => {
      if (!value || typeof value !== "object" || !getFollowUpId(value)) return false;
      const status = String((value as Record<string, unknown>).status ?? "").toUpperCase();
      return !status || status === "COMPLETED";
    });

  return {
    nextFollowUpId: selectFollowUpId(
      [record.nextFollowups, record.nextFollowup, record.nextFollowUp, record.followUps],
      "next",
    ),
    lastFollowUpId: getFollowUpId(explicitLastFollowUpId) ?? selectFollowUpId(
      [record.completedFollowUps, record.completedFollowups, record.lastFollowup, record.lastFollowUp, record.lastFollowups, record.followUps],
      "last",
    ),
  };
}

export function toBusinessItem(business: ApiBusiness): BusinessItem {
  const initials = business.name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const nextDateRaw = extractNextFollowUpDate(business);
  const followUpInfo = parseFollowUp(nextDateRaw);
  const followUpIds = extractFollowUpIds(business);
  const rawCategory = business.category;
  const categoryName =
    rawCategory && typeof rawCategory === "object"
      ? rawCategory.name
      : rawCategory;
  const category =
    typeof categoryName === "string" && categoryName
      ? categoryName
      : business.categoryId || "Uncategorized";
  const rawAssignee = business.assignee ?? business.assignedTo;
  const assignedToId =
    rawAssignee && typeof rawAssignee === "object"
      ? String(rawAssignee._id ?? rawAssignee.id ?? "")
      : typeof rawAssignee === "string"
        ? rawAssignee
        : "";
  const assignedToName =
    rawAssignee && typeof rawAssignee === "object"
      ? String(rawAssignee.fullName ?? rawAssignee.name ?? "")
      : "";

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
    lastFollowUpId: followUpIds.lastFollowUpId,
    nextFollowUp: followUpInfo.nextFollowUp,
    nextFollowUpId: followUpIds.nextFollowUpId,
    nextFollowUpType: followUpInfo.nextFollowUpType,
    nextFollowupDate: nextDateRaw ?? business.nextFollowupDate,
    reminder: business.reminder,
    description: business.description,
    notes: business.notes,
    owner: assignedToName || undefined,
    address: business.address,
    email: business.email,
    website: business.website,
    leadSource: business.leadSource,
    businessType: business.businessType,
    assignedToId: assignedToId || undefined,
    assignedToName: assignedToName || undefined,
    assignedTo: assignedToName || undefined,
    alternatePhone: getPrimaryNumber(business.whatsappNumbers),
    phoneNumbers: business.phoneNumbers,
    whatsappNumbers: business.whatsappNumbers,
    location: business.location,
    locationUrl:
      (typeof business.location === "object" ? business.location?.url : undefined) ||
      (typeof business.location === "string" ? business.location : undefined) ||
      business.locationUrl ||
      "",
  };
}

export type WhatsAppNumberEntry = {
  number: string;
  label: string;
  type: "whatsapp" | "phone";
  isPrimary?: boolean;
};

export function formatWhatsAppUrl(numberStr: string): string {
  const clean = numberStr.replace(/\D/g, "");
  if (!clean) return "";
  return clean.length === 10 ? `https://wa.me/91${clean}` : `https://wa.me/${clean}`;
}

export function getWhatsAppNumbers(business: {
  name?: string;
  phone?: string;
  alternatePhone?: string;
  whatsappNumbers?: Array<{ number?: string; name?: string; isPrimary?: boolean; type?: string }>;
  phoneNumbers?: Array<{ number?: string; name?: string; isPrimary?: boolean; type?: string }>;
}): WhatsAppNumberEntry[] {
  const result: WhatsAppNumberEntry[] = [];
  const seenDigits = new Set<string>();

  const addNumber = (
    rawNumber: string | undefined | null,
    sourceType: "whatsapp" | "phone",
    isPrimary?: boolean,
    customName?: string,
  ) => {
    if (!rawNumber) return;
    const trimmed = rawNumber.trim();
    if (!trimmed) return;
    const digits = trimmed.replace(/\D/g, "");
    if (!digits || seenDigits.has(digits)) return;
    seenDigits.add(digits);

    let label: string;
    const hasCustomName = Boolean(
      customName &&
        customName.trim() &&
        customName.trim().toLowerCase() !== (business.name || "").trim().toLowerCase(),
    );

    if (sourceType === "whatsapp") {
      if (hasCustomName) {
        label = isPrimary
          ? `${customName!.trim()} (WhatsApp • Primary)`
          : `${customName!.trim()} (WhatsApp)`;
      } else {
        label = isPrimary ? "WhatsApp (Primary)" : "WhatsApp";
      }
    } else {
      if (hasCustomName) {
        label = isPrimary
          ? `${customName!.trim()} (Phone • Primary)`
          : `${customName!.trim()} (Phone)`;
      } else {
        label = isPrimary ? "Phone (Primary)" : "Phone";
      }
    }

    result.push({
      number: trimmed,
      label,
      type: sourceType,
      isPrimary,
    });
  };

  if (Array.isArray(business.whatsappNumbers)) {
    for (const w of business.whatsappNumbers) {
      addNumber(w.number, "whatsapp", w.isPrimary, w.name);
    }
  }

  if (Array.isArray(business.phoneNumbers)) {
    for (const p of business.phoneNumbers) {
      addNumber(p.number, "phone", p.isPrimary, p.name);
    }
  }

  if (business.alternatePhone) {
    addNumber(business.alternatePhone, "whatsapp", false);
  }

  if (business.phone) {
    addNumber(business.phone, "phone", true);
  }

  return result;
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
  if (values.scheduleFollowUp) {
    payload.followUp = toFollowUpPayload(values);
  }

  return payload;
}
