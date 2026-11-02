/** Normalised records the analytics functions work on (independent of the raw API shapes). */
export type LeadStatus = "NEW" | "CONTACTED" | "PROPOSAL_AND_NEGOTIATION" | "INTERESTED" | "WON" | "LOST";

export interface LeadRecord {
  id: string;
  name: string;
  status: string;
  isActive: boolean;
  ownerId: string;
  ownerName: string;
  source: string;
  city: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  lastFollowUpAt?: string;
  nextFollowUpAt?: string;
}

export interface ActivityRecord {
  id: string;
  businessId: string;
  businessName: string;
  ownerId: string;
  ownerName: string;
  type: string;
  status: string;
  scheduledAt: string;
  completedAt?: string;
  createdAt: string;
}

export type RangePreset = "today" | "7d" | "30d" | "month" | "quarter" | "custom";

export interface DateRange {
  preset: RangePreset;
  /** Inclusive start, ISO string. */
  from: string;
  /** Inclusive end, ISO string. */
  to: string;
  /** The equally long period immediately before. */
  previous: { from: string; to: string };
  /** Human label such as "Last 7 days". */
  label: string;
  /** Wording used next to a comparison, e.g. "vs previous 7 days". */
  compareLabel: string;
}
