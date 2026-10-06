export type FollowUpType = "CALL" | "MEETING" | "EMAIL" | "WHATSAPP" | "OTHER";
export type FollowUpStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED" | "OVERDUE";

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
  businessCallingNumber?: string;
  businessWhatsappNumber?: string;
  businessEmail?: string;
  assignedToId?: string;
  assignedToName: string;
  type: FollowUpType | string;
  status: FollowUpStatus | string;
  scheduledAt: string;
  notes?: string;
  reminder?: string;
  reminderInMinutes?: number;
}

export interface FollowUpNote {
  id: string;
  entityType: "BUSINESS" | "FOLLOW_UP";
  entityId: string;
  content: string;
  createdBy: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FollowUpNotesPage {
  items: FollowUpNote[];
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
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
  type: FollowUpType | string;
  scheduledAt: string;
  notes?: string;
  reminder?: string;
  reminderInMinutes?: number;
}

export interface UpdateFollowUpPayload {
  id: string;
  followUpId?: string;
  businessId?: string;
  assignedTo?: string;
  type?: FollowUpType | string;
  scheduledAt?: string;
  status?: FollowUpStatus | string;
  notes?: string;
  reminder?: string;
  reminderInMinutes?: number;
}

export interface UpdateFollowUpStatusPayload {
  id: string;
  status: "COMPLETED" | "CANCELLED";
}
