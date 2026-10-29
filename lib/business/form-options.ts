export const CATEGORY_OPTIONS = [
  "Restaurant & Cafe",
  "Retail & Shopping",
  "Healthcare",
  "Education",
  "Real Estate",
  "Automobile",
  "Beauty & Wellness",
  "Professional Services",
  "Manufacturing",
  "Other",
];

export const CITY_OPTIONS = [
  "Mumbai",
  "Delhi",
  "Bengaluru",
  "Hyderabad",
  "Ahmedabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Indore",
  "Surat",
];

export const STATE_OPTIONS = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
] as const;

// Values match the backend's exact enum for `status` on POST/PATCH
// /businesses - sending anything else is rejected with a 400. Labels are
// just the friendly text shown in the dropdown.
export const STATUS_OPTIONS = [
  { value: "NEW", label: "New lead" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "INTERESTED", label: "Interested" },
  { value: "PROPOSAL_AND_NEGOTIATION", label: "Proposal & negotiation" },
  { value: "WON", label: "Won" },
  { value: "LOST", label: "Lost" },
];

/** Shared semantic palette for the sales lifecycle. */
export const LEAD_STATUS_VISUALS: Record<
  string,
  { badge: string; accent: string; dot: string }
> = {
  NEW: {
    badge: "border-brand/40 bg-brand-soft text-brand-strong",
    accent: "bg-brand",
    dot: "bg-brand",
  },
  CONTACTED: {
    badge: "border-info/40 bg-info-soft text-info",
    accent: "bg-info",
    dot: "bg-info",
  },
  INTERESTED: {
    badge: "border-warn/30 bg-warn-soft text-warn",
    accent: "bg-warn",
    dot: "bg-warn",
  },
  PROPOSAL_AND_NEGOTIATION: {
    badge: "border-line bg-surface-2 text-ink",
    accent: "bg-ink-soft",
    dot: "bg-ink-soft",
  },
  WON: {
    badge: "border-ok/30 bg-ok-soft text-ok",
    accent: "bg-ok",
    dot: "bg-ok",
  },
  LOST: {
    badge: "border-bad/30 bg-bad-soft text-bad",
    accent: "bg-bad",
    dot: "bg-bad",
  },
};

export function getLeadStatusVisual(status?: string | null) {
  const normalized = status?.trim().toUpperCase() ?? "";
  return LEAD_STATUS_VISUALS[normalized] ?? {
    badge: "border-line bg-surface-2 text-ink-soft",
    accent: "bg-muted",
    dot: "bg-muted",
  };
}

export const LEAD_STATUS_DISPLAY_NAMES: Record<string, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  INTERESTED: "Interested",
  PROPOSAL_AND_NEGOTIATION: "Proposal & negotiation",
  WON: "Won",
  LOST: "Lost",
};

export function getLeadStatusLabel(status?: string | null): string {
  if (!status || typeof status !== "string") return "-";

  const trimmed = status.trim();
  if (!trimmed || trimmed === "-") return "-";

  const upper = trimmed.toUpperCase();

  const option = STATUS_OPTIONS.find(
    (opt) =>
      opt.value.toUpperCase() === upper || opt.label.toUpperCase() === upper,
  );
  if (option) return option.label;

  if (LEAD_STATUS_DISPLAY_NAMES[upper]) {
    return LEAD_STATUS_DISPLAY_NAMES[upper];
  }

  return trimmed
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function formatLeadStatus(
  status?: string | null,
  statusMap?: Record<string, string>,
): string {
  if (!status || typeof status !== "string") return "-";

  const trimmed = status.trim();
  if (!trimmed || trimmed === "-") return "-";

  const upper = trimmed.toUpperCase();

  const option = STATUS_OPTIONS.find(
    (opt) =>
      opt.value.toUpperCase() === upper || opt.label.toUpperCase() === upper,
  );
  if (option) return option.label;

  if (statusMap) {
    if (statusMap[trimmed] && statusMap[trimmed] !== trimmed) return statusMap[trimmed];
    if (statusMap[upper] && statusMap[upper] !== upper) return statusMap[upper];
    const match = Object.keys(statusMap).find((k) => k.toUpperCase() === upper);
    if (match && statusMap[match] && statusMap[match] !== match) return statusMap[match];
  }

  if (LEAD_STATUS_DISPLAY_NAMES[upper]) {
    return LEAD_STATUS_DISPLAY_NAMES[upper];
  }

  return trimmed
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export const BUSINESS_TYPE_OPTIONS = [
  "Proprietorship",
  "Partnership",
  "Private Limited",
  "LLP",
  "Franchise",
];

export const FOLLOW_UP_TYPE_OPTIONS = [
  { value: "CALL", label: "Call" },
  { value: "MEETING", label: "Meeting" },
  { value: "EMAIL", label: "Email" },
  { value: "WHATSAPP", label: "WhatsApp" },
];

export function formatFollowUpType(type?: string | null): string {
  if (!type || typeof type !== "string") return "-";
  const trimmed = type.trim();
  if (!trimmed || trimmed === "-") return "-";

  const upper = trimmed.toUpperCase();
  const option = FOLLOW_UP_TYPE_OPTIONS.find(
    (opt) => opt.value.toUpperCase() === upper || opt.label.toUpperCase() === upper,
  );
  if (option) return option.label;

  return trimmed
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export const REMINDER_OPTIONS = [
  { value: "5", label: "5 mins" },
  { value: "10", label: "10 mins" },
  { value: "15", label: "15 mins" },
  { value: "30", label: "30 mins" },
  { value: "45", label: "45 mins" },
  { value: "60", label: "1 hr" },
];
