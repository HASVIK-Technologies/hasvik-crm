export type AuthUser = {
  userId: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phoneNumber?: string;
  tenantId?: string;
};

export function isSuperAdmin(user?: Pick<AuthUser, "role"> | null) {
  return user?.role?.trim().toUpperCase() === "SUPERADMIN";
}

export function isTenantAdmin(user?: Pick<AuthUser, "role"> | null) {
  return !isSuperAdmin(user) && user?.role?.trim().toUpperCase() === "ADMIN";
}

export type TokenResponse = {
  accessToken: string;
};

export type AuthSession = {
  accessToken: string;
  user: AuthUser;
};

export type LoginFormValues = {
  email: string;
  password: string;
};
