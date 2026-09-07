export interface BusinessItem {
  id: number;
  name: string;
  phone: string;
  initials: string;
  avatarBg: string;
  avatarTextColor: string;
  category: string;
  city: string;
  status: "Active" | "Inactive";
  lastFollowUp: string;
  nextFollowUp: string;
  nextFollowUpType: "today" | "tomorrow" | "date" | "none";
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
  followUpToday: number;
  categoriesCount: number;
}

