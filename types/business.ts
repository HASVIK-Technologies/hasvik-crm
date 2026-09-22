export interface BusinessItem {
  id: number | string;
  name: string;
  phone: string;
  initials: string;
  avatarBg: string;
  avatarTextColor: string;
  category: string;
  city: string;
  state?: string;
  leadStatus?: string;
  status: "Active" | "Inactive";
  lastFollowUp: string;
  nextFollowUp: string;
  nextFollowUpType: "today" | "tomorrow" | "date" | "none" | "overdue";
  nextFollowupDate?: string;
  reminder?: string;
  description?: string;
  notes?: string;
  owner?: string;
  address?: string;
  email?: string;
  website?: string;
  leadSource?: string;
  businessType?: string;
  assignedTo?: string;
  alternatePhone?: string;
}

export interface BusinessStatsData {
  total: number;
  active: number;
  deactivated?: number;
  followUpToday?: number;
  categoriesCount?: number;
  new?: number;
  interested?: number;
  won?: number;
}

export interface BusinessKpisData {
  total: number;
  active: number;
  new: number;
  interested: number;
  won: number;
}
