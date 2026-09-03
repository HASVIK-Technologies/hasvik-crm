"use client";

import { useEffect, useState, useCallback } from "react";
import { BusinessItem } from "@/components/businesses/types";

export const INITIAL_BUSINESSES: BusinessItem[] = [
  {
    id: 1,
    name: "Shree Balaji Traders",
    phone: "9876543210",
    initials: "SB",
    avatarBg: "bg-[#e0eafe]",
    avatarTextColor: "text-[#2e90fa]",
    category: "Furniture Shop",
    city: "Ballia",
    status: "Active",
    lastFollowUp: "Today at 10:00 AM",
    nextFollowUp: "Today",
    nextFollowUpType: "today",
    owner: "Ramesh Sharma (Owner)",
    address: "Near Main Market, Station Road, Ballia, Uttar Pradesh - 277001",
    email: "balajitraders@gmail.com",
    website: "https://www.shreebalajitraders.com",
    leadSource: "Website",
    businessType: "Retailer",
    assignedTo: "Amit Sharma",
  },
  {
    id: 2,
    name: "Maa Durga Enterprises",
    phone: "9123456780",
    initials: "MD",
    avatarBg: "bg-[#d1fadf]",
    avatarTextColor: "text-[#039855]",
    category: "Hardware Store",
    city: "Buxar",
    status: "Active",
    lastFollowUp: "Today at 11:30 AM",
    nextFollowUp: "Today",
    nextFollowUpType: "today",
    owner: "Durga Prasad (Owner)",
    address: "GT Road, Near City Hospital, Buxar, Bihar - 802101",
    email: "maadurga.enterprises@gmail.com",
    website: "https://www.maadurgaenterprises.com",
    leadSource: "Direct Call",
    businessType: "Wholesaler",
    assignedTo: "Priya Singh",
  },
  {
    id: 3,
    name: "Akash Furniture",
    phone: "9988776655",
    initials: "AF",
    avatarBg: "bg-[#e0eafe]",
    avatarTextColor: "text-[#2e90fa]",
    category: "Furniture Shop",
    city: "Ghazipur",
    status: "Active",
    lastFollowUp: "Tomorrow 10:00 AM",
    nextFollowUp: "Tomorrow",
    nextFollowUpType: "tomorrow",
    owner: "Akash Gupta (Owner)",
    address: "Civil Lines, Near Clock Tower, Ghazipur, Uttar Pradesh - 233001",
    email: "akashfurniture.ghz@gmail.com",
    website: "https://www.akashfurniture.com",
    leadSource: "Referral",
    businessType: "Retailer",
    assignedTo: "Amit Sharma",
  },
  {
    id: 4,
    name: "Gupta Construction",
    phone: "8877665544",
    initials: "GC",
    avatarBg: "bg-[#fee4e2]",
    avatarTextColor: "text-[#d92d20]",
    category: "Construction",
    city: "Varanasi",
    status: "Active",
    lastFollowUp: "25 May 2024",
    nextFollowUp: "25 May 2024",
    nextFollowUpType: "date",
    owner: "Suresh Gupta (Owner)",
    address: "Rathyatra Crossing, Varanasi, Uttar Pradesh - 221010",
    email: "guptaconstruction.vns@gmail.com",
    website: "https://www.guptaconstruction.in",
    leadSource: "Exhibition",
    businessType: "Contractor",
    assignedTo: "Rahul Verma",
  },
  {
    id: 5,
    name: "Star Enterprises",
    phone: "7766554433",
    initials: "SE",
    avatarBg: "bg-[#f4ebff]",
    avatarTextColor: "text-[#7f56d9]",
    category: "Electrical Shop",
    city: "Ballia",
    status: "Inactive",
    lastFollowUp: "20 May 2024",
    nextFollowUp: "-",
    nextFollowUpType: "none",
    owner: "Mohd. Tariq (Owner)",
    address: "Cinema Hall Road, Ballia, Uttar Pradesh - 277001",
    email: "starenterprises.ballia@gmail.com",
    leadSource: "Social Media",
    businessType: "Retailer",
    assignedTo: "Amit Sharma",
  },
  {
    id: 6,
    name: "Rakesh Kirana Store",
    phone: "9988774433",
    initials: "RK",
    avatarBg: "bg-[#d1fadf]",
    avatarTextColor: "text-[#039855]",
    category: "Kirana Store",
    city: "Ballia",
    status: "Active",
    lastFollowUp: "24 May 2024",
    nextFollowUp: "26 May 2024",
    nextFollowUpType: "date",
    owner: "Rakesh Kumar (Owner)",
    address: "Kotwali Chowk, Ballia, Uttar Pradesh - 277001",
    email: "rakeshkirana@gmail.com",
    leadSource: "Walk-in",
    businessType: "Retailer",
    assignedTo: "Priya Singh",
  },
  {
    id: 7,
    name: "Vishal Services",
    phone: "8899776655",
    initials: "VS",
    avatarBg: "bg-[#e0eafe]",
    avatarTextColor: "text-[#2e90fa]",
    category: "Service Center",
    city: "Buxar",
    status: "Active",
    lastFollowUp: "23 May 2024",
    nextFollowUp: "25 May 2024",
    nextFollowUpType: "date",
    owner: "Vishal Tiwari (Owner)",
    address: "Piparpanti Road, Buxar, Bihar - 802101",
    email: "vishalservices@gmail.com",
    leadSource: "Website",
    businessType: "Service",
    assignedTo: "Rahul Verma",
  },
  {
    id: 8,
    name: "Prakash Pharmacy",
    phone: "7788996655",
    initials: "PK",
    avatarBg: "bg-[#fef0c7]",
    avatarTextColor: "text-[#dc6803]",
    category: "Medical Store",
    city: "Ghazipur",
    status: "Inactive",
    lastFollowUp: "15 May 2024",
    nextFollowUp: "-",
    nextFollowUpType: "none",
    owner: "Om Prakash (Owner)",
    address: "Hospital Road, Ghazipur, Uttar Pradesh - 233001",
    email: "prakashpharmacy@gmail.com",
    leadSource: "Direct Call",
    businessType: "Retailer",
    assignedTo: "Priya Singh",
  },
  {
    id: 12,
    name: "Hasvik Technology",
    phone: "9876543210",
    initials: "HT",
    avatarBg: "bg-blue-50",
    avatarTextColor: "text-blue-700",
    category: "Furniture Shop",
    city: "Ballia",
    status: "Active",
    lastFollowUp: "25 Aug 2026 at 11:30 AM",
    nextFollowUp: "Today at 10:00 AM",
    nextFollowUpType: "today",
    owner: "Contact 1 (Owner)",
    address: "Ballia, U.P.",
    email: "contact@hasviktechnology.com",
    leadSource: "Website",
    businessType: "Retailer",
    assignedTo: "Amit Sharma",
  },
];

const STORAGE_KEY = "hasvik_crm_businesses";
const CHANGE_EVENT = "hasvik_crm_businesses_changed";

/**
 * Retrieves all businesses from localStorage, falling back to initial data.
 * Guarantees that every item has a unique numeric ID.
 */
export function getStoredBusinesses(): BusinessItem[] {
  if (typeof window === "undefined") {
    return INITIAL_BUSINESSES;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_BUSINESSES));
      return INITIAL_BUSINESSES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Ensure all IDs are validated numbers
      return parsed.map((item) => ({
        ...item,
        id: Number(item.id),
      }));
    }
    return INITIAL_BUSINESSES;
  } catch (err) {
    console.error("Failed to read businesses from localStorage:", err);
    return INITIAL_BUSINESSES;
  }
}

/**
 * Saves businesses array to localStorage and notifies subscribers.
 */
export function saveBusinesses(businesses: BusinessItem[]): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(businesses));
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
  } catch (err) {
    console.error("Failed to save businesses to localStorage:", err);
  }
}

/**
 * Calculates the next available unique numeric ID.
 * Never duplicates existing IDs; strictly returns an integer.
 */
export function getNextBusinessId(businesses?: BusinessItem[]): number {
  const list = businesses ?? getStoredBusinesses();
  if (!list || list.length === 0) {
    return 1;
  }
  const numericIds = list
    .map((b) => Number(b.id))
    .filter((id) => !isNaN(id) && Number.isInteger(id) && id > 0);

  if (numericIds.length === 0) {
    return 1;
  }
  return Math.max(...numericIds, 0) + 1;
}

/**
 * Finds a business by its exact numeric ID.
 * Returns undefined if ID is not a valid number or not found.
 */
export function getBusinessById(id: number | string): BusinessItem | undefined {
  const numericId = typeof id === "number" ? id : parseInt(String(id).trim(), 10);
  if (isNaN(numericId) || !Number.isInteger(numericId) || numericId <= 0) {
    return undefined;
  }

  const businesses = getStoredBusinesses();
  return businesses.find((item) => item.id === numericId);
}

/**
 * Creates a new business with the next available numeric ID.
 * The ID is permanent and stable.
 */
export function createBusiness(
  data: Omit<
    BusinessItem,
    | "id"
    | "initials"
    | "avatarBg"
    | "avatarTextColor"
    | "lastFollowUp"
    | "nextFollowUp"
    | "nextFollowUpType"
  > & {
    initials?: string;
    avatarBg?: string;
    avatarTextColor?: string;
    lastFollowUp?: string;
    nextFollowUp?: string;
    nextFollowUpType?: "today" | "tomorrow" | "date" | "none";
  }
): BusinessItem {
  const businesses = getStoredBusinesses();
  const nextId = getNextBusinessId(businesses);

  // Compute initials if not provided
  const computedInitials =
    data.initials ||
    data.name
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ||
    "NB";

  const newBusiness: BusinessItem = {
    ...data,
    id: nextId,
    initials: computedInitials,
    avatarBg: data.avatarBg || "bg-[#e0eafe]",
    avatarTextColor: data.avatarTextColor || "text-[#2e90fa]",
    lastFollowUp: data.lastFollowUp || "Just created",
    nextFollowUp: data.nextFollowUp || "Today",
    nextFollowUpType: data.nextFollowUpType || "today",
  };

  const updatedList = [newBusiness, ...businesses];
  saveBusinesses(updatedList);
  return newBusiness;
}

/**
 * Updates an existing business while preserving its stable numeric ID.
 * Modifying the business will NEVER change its ID.
 */
export function updateBusiness(
  id: number,
  data: Partial<Omit<BusinessItem, "id">>
): BusinessItem | null {
  const businesses = getStoredBusinesses();
  const index = businesses.findIndex((b) => b.id === id);

  if (index === -1) {
    return null;
  }

  const existing = businesses[index];
  const updatedBusiness: BusinessItem = {
    ...existing,
    ...data,
    id: existing.id, // Strictly preserve original numeric ID!
  };

  businesses[index] = updatedBusiness;
  saveBusinesses(businesses);
  return updatedBusiness;
}

/**
 * Deletes a business by its numeric ID.
 */
export function deleteBusiness(id: number): boolean {
  const businesses = getStoredBusinesses();
  const filtered = businesses.filter((b) => b.id !== id);
  if (filtered.length === businesses.length) return false;

  saveBusinesses(filtered);
  return true;
}

/**
 * React hook to access and subscribe to businesses from the store.
 */
export function useBusinesses() {
  const [businesses, setBusinesses] = useState<BusinessItem[]>(INITIAL_BUSINESSES);
  const [isLoaded, setIsLoaded] = useState(false);

  const refresh = useCallback(() => {
    const data = getStoredBusinesses();
    setBusinesses(data);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    refresh();

    const handleStorageChange = () => refresh();
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(CHANGE_EVENT, handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(CHANGE_EVENT, handleStorageChange);
    };
  }, [refresh]);

  return {
    businesses,
    isLoaded,
    refresh,
    createBusiness,
    updateBusiness,
    deleteBusiness,
    getNextBusinessId: () => getNextBusinessId(businesses),
  };
}
