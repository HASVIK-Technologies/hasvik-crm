export type UserRole = "ADMIN" | "MANAGER" | "SALES" | "USER";

export interface UserRecord {
  _id?: string;
  id?: string;
  userId?: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  role: UserRole | string;
  isActive?: boolean;
  tenantId?: string | { _id?: string; id?: string; name?: string; isActive?: boolean } | null;
  tenant?: { _id?: string; id?: string; name?: string; isActive?: boolean } | null;
  tenantName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserPayload {
  email: string;
  fullName: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserPayload {
  isActive?: boolean;
  email?: string;
  fullName?: string;
  phoneNumber?: string;
  password?: string;
  role?: UserRole;
}
