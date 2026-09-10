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
  phoneNumbers?: PhoneNumber[];
  whatsappNumbers?: PhoneNumber[];
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  assignedTo?: string;
  leadSource?: string;
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
  search?: string;
  status?: string;
  businessType?: string;
  categoryId?: string;
  assignedTo?: string;
  city?: string;
  state?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
};

export type BusinessesResult = {
  businesses: BusinessItem[];
  total: number;
  totalPages: number;
};
