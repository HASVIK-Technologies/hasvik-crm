import type { BusinessItem } from "@/types/business";

export type PhoneNumber = {
  number?: string;
  isPrimary?: boolean;
};

export type ApiBusiness = {
  _id: string;
  name: string;
  categoryId?: string | null;
  businessType?: string;
  status?: string;
  isDeleted?: boolean;
  isActive?: boolean;
  phoneNumbers?: PhoneNumber[];
  whatsappNumbers?: PhoneNumber[];
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  category?: string | null;
  assignedTo?: string;
  leadSource?: string;
  nextFollowupDate?: string;
  reminder?: string;
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
  isDeleted?: boolean;
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
  isDeleted?: boolean;
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
};
