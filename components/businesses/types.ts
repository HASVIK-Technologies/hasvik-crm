export interface BusinessItem {
  id: string;
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
}

export interface BusinessStatsData {
  total: number;
  active: number;
  followUpToday: number;
  categoriesCount: number;
}
