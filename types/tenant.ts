export interface Tenant {
  id: string;
  name: string;
  fullName?: string;
  contactEmail?: string;
  contactPhone?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TenantQueryParams {
  page?: number;
  limit?: number;
  isActive?: boolean;
}

export interface TenantsPage {
  data: Tenant[];
  total: number;
}

export interface TenantResponse {
  _id?: string;
  id?: string;
  name?: string;
  fullName?: string;
  contactEmail?: string;
  contactPhone?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTenantPayload {
  name: string;
  fullName: string;
  password: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface UpdateTenantPayload {
  name?: string;
  contactEmail?: string;
  contactPhone?: string;
}
