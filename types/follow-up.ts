export type FollowUpType = "CALL" | "MEETING" | "EMAIL" | "WHATSAPP";
export type FollowUpStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED";

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
}

export interface UpdateFollowUpPayload {
  businessId: string;
  assignedTo: string;
  type: FollowUpType;
  scheduledAt: string;
  status: FollowUpStatus | string;
  notes: string;
}
