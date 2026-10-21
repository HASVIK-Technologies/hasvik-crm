import type { BusinessItem } from "@/types/business";
import type { FollowUpType } from "@/types/follow-up";

export type PhoneNumber = {
  number?: string;
  isPrimary?: boolean;
};

export type ApiBusiness = {
  _id: string;
  name: string;
  categoryId?: string | null;
  businessType?: string;
  location?: { url?: string } | null;
  locationUrl?: string;
  status?: string;
  isActive?: boolean;
  phoneNumbers?: PhoneNumber[];
  whatsappNumbers?: PhoneNumber[];
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  category?: string | { _id?: string; name?: string } | null;
  assignedTo?: string;
  leadSource?: string;
  followUp?:
    | FollowUpPayload
    | {
        assignedTo?: string;
        type?: FollowUpType | string;
        scheduledAt?: string;
        completedAt?: string;
        status?: string;
        reminderInMinutes?: number;
      };
  followUps?: Array<{
    _id?: string;
    id?: string;
    status?: string;
    type?: string;
    scheduledAt?: string;
    completedAt?: string;
    updatedAt?: string;
    createdAt?: string;
    date?: string;
    followUpDate?: string;
    isCompleted?: boolean;
  }>;
  completedFollowUps?: Array<{
    _id?: string;
    id?: string;
    status?: string;
    type?: string;
    scheduledAt?: string;
    completedAt?: string;
    updatedAt?: string;
    createdAt?: string;
    date?: string;
    followUpDate?: string;
    isCompleted?: boolean;
  }>;
  lastFollowupDate?: string;
  lastFollowUpDate?: string;
  lastCompletedFollowupDate?: string;
  lastCompletedFollowUpDate?: string;
  latestCompletedFollowUpDate?: string;
  lastFollowup?:
    | string
    | {
        scheduledAt?: string;
        completedAt?: string;
        status?: string;
        date?: string;
        followUpDate?: string;
        updatedAt?: string;
        createdAt?: string;
      }
    | Array<unknown>;
  lastFollowUp?:
    | string
    | {
        scheduledAt?: string;
        completedAt?: string;
        status?: string;
        date?: string;
        followUpDate?: string;
        updatedAt?: string;
        createdAt?: string;
      }
    | Array<unknown>;
  lastFollowups?:
    | string
    | Array<unknown>
    | {
        scheduledAt?: string;
        completedAt?: string;
        status?: string;
        date?: string;
        followUpDate?: string;
      };
  nextFollowups?:
    | string
    | Array<{
        _id?: string;
        id?: string;
        status?: string;
        type?: string;
        scheduledAt?: string;
        completedAt?: string;
        date?: string;
        followUpDate?: string;
        createdAt?: string;
      }>
    | {
        scheduledAt?: string;
        date?: string;
        followUpDate?: string;
        status?: string;
      };
  nextFollowup?:
    | string
    | {
        scheduledAt?: string;
        date?: string;
        followUpDate?: string;
        status?: string;
      }
    | Array<unknown>;
  nextFollowUp?:
    | string
    | {
        scheduledAt?: string;
        date?: string;
        followUpDate?: string;
        status?: string;
      }
    | Array<unknown>;
  nextFollowupDate?: string;
  nextFollowUpDate?: string;
  reminder?: string | number;
  description?: string;
  notes?: string;
  createdAt?: string;
};

export type BusinessesResponse = {
  data: ApiBusiness[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type BusinessQueryParams = {
  page?: number;
  limit?: number;
  sortBy?: string;
  search?: string;
  categoryId?: string;
  city?: string;
  status?: string;
  isActive?: boolean;
  businessType?: string;
  assignedTo?: string;
  state?: string;
};

export type BusinessKpiParams = {
  search?: string;
  status?: string;
  categoryId?: string;
  city?: string;
  isActive?: boolean;
};

export type BusinessKpisResponse = {
  total: number;
  active: number;
  new: number;
  interested: number;
  won: number;
  deactivated?: number;
  followUpToday?: number;
  categoriesCount?: number;
};

export type BusinessStatusOption = string;

export type CategoryAutocompleteItem = {
  _id: string;
  name: string;
};

export type CityAutocompleteItem = {
  city: string;
};

export type BusinessesResult = {
  businesses: BusinessItem[];
  total: number;
  totalPages: number;
};

export type FollowUpPayload = {
  assignedTo: string;
  type: FollowUpType;
  scheduledAt: string;
  reminderInMinutes?: number;
};

// Matches the request body documented for POST /businesses.
export type CreateBusinessPayload = {
  name: string;
  categoryId: string;
  status: string;
  phoneNumbers: { number: string; name: string; isPrimary: boolean }[];
  whatsappNumbers: { number: string; name: string; isPrimary: boolean }[];
  email?: string;
  website?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  assignedTo?: string;
  leadSource?: string;
  followUp?: FollowUpPayload;
  location?: { url?: string } | null;
};
