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
  { value: "PROPOSAL_AND_NEGOTIATION", label: "Proposal & Negotiation" },
  { value: "INTERESTED", label: "Interested" },
  { value: "WON", label: "Won" },
  { value: "LOST", label: "Lost" },
];

/** Shared semantic palette for the sales lifecycle. */
export const LEAD_STATUS_VISUALS: Record<
  string,
  { badge: string; accent: string; dot: string }
> = {
  NEW: {
    badge: "border-blue-200 bg-blue-50 text-blue-700",
    accent: "bg-blue-500",
    dot: "bg-blue-500",
  },
  CONTACTED: {
    badge: "border-cyan-200 bg-cyan-50 text-cyan-800",
    accent: "bg-cyan-500",
    dot: "bg-cyan-500",
  },
  INTERESTED: {
    badge: "border-amber-200 bg-amber-50 text-amber-800",
    accent: "bg-amber-500",
    dot: "bg-amber-500",
  },
  PROPOSAL_AND_NEGOTIATION: {
    badge: "border-violet-200 bg-violet-50 text-violet-700",
    accent: "bg-violet-500",
    dot: "bg-violet-500",
  },
  WON: {
    badge: "border-emerald-200 bg-emerald-50 text-emerald-800",
    accent: "bg-emerald-500",
    dot: "bg-emerald-500",
  },
  LOST: {
    badge: "border-rose-200 bg-rose-50 text-rose-800",
    accent: "bg-rose-500",
    dot: "bg-rose-500",
  },
};

export function getLeadStatusVisual(status?: string | null) {
  const normalized = status?.trim().toUpperCase() ?? "";
  return LEAD_STATUS_VISUALS[normalized] ?? {
    badge: "border-slate-200 bg-slate-100 text-slate-700",
    accent: "bg-slate-400",
    dot: "bg-slate-400",
  };
}

export const LEAD_STATUS_DISPLAY_NAMES: Record<string, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  INTERESTED: "Interested",
  PROPOSAL_AND_NEGOTIATION: "Proposal & Negotiation",
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
