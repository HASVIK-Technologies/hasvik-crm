export type AuthUser = {
  userId: string;
  email: string;
  role: string;
  isSuperAdmin: boolean;
  firstName: string;
  lastName: string;
  fullName: string;
  phoneNumber?: string;
  tenantId?: string;
};

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