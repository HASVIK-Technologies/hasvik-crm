export type FollowUpType = "CALL" | "MEETING" | "EMAIL" | "WHATSAPP";
export type FollowUpStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED";

export const FOLLOW_UP_REMINDER_OPTIONS = [
  "10 minutes",
  "15 minutes",
  "30 minutes",
  "45 minutes",
  "1 hour",
] as const;

export type FollowUpReminder = (typeof FOLLOW_UP_REMINDER_OPTIONS)[number];

export interface FollowUpOption {
  id: string;
  label: string;
  subtitle?: string;
}

export interface FollowUpItem {
  id: string;
  businessId: string;
  businessName: string;
  businessCity?: string;
  businessPhone?: string;
  assignedToId?: string;
  assignedToName: string;
  type: FollowUpType | string;
  status: FollowUpStatus | string;
  scheduledAt: string;
  notes?: string;
  reminder?: string;
}

export interface FollowUpFilters {
  page: number;
  limit: number;
  search: string;
  businessId: string;
  businessName: string;
  assignedTo: string;
  assignedToName: string;
  status: string;
  type: string;
  fromDate: string;
  toDate: string;
  tab: "all" | "today" | "upcoming" | "overdue";
}

export interface FollowUpKpis {
  total: number;
  today: number;
  upcoming: number;
  overdue: number;
}

export interface CreateFollowUpPayload {
  businessId: string;
  assignedTo: string;
  type: FollowUpType;
  scheduledAt: string;
  status: "SCHEDULED";
  notes: string;
  reminder?: string;
}

export interface UpdateFollowUpPayload {
  id?: string;
  followUpId?: string;
  businessId: string;
  assignedTo: string;
  type: FollowUpType;
  scheduledAt: string;
  status: FollowUpStatus | string;
  notes: string;
  reminder?: string;
}

