export type AuthUser = {
  userId: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  fullName: string;
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