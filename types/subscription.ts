export type BillingCycle = "MONTHLY" | "QUARTERLY" | "HALF_YEARLY" | "YEARLY" | "LIFETIME";

export interface SubscriptionPlanFeature {
  code: string;
  name: string;
  description?: string;
}

export interface SubscriptionPlanLimits {
  maxUsers: number;
  maxBusinesses: number;
  maxFollowUps: number;
  maxNotes: number;
}

export interface SubscriptionPlan {
  _id?: string;
  id?: string;
  name: string;
  code: string;
  description?: string;
  price: number;
  currency?: string;
  billingCycle: BillingCycle;
  features?: SubscriptionPlanFeature[];
  limits?: SubscriptionPlanLimits;
  isActive?: boolean;
}

export interface SubscriptionReference {
  isActive?: boolean;
  _id?: string;
  id?: string;
  name?: string;
  businessName?: string;
  code?: string;
}

export type SubscriptionStatus =
  | "PENDING"
  | "ACTIVE"
  | "CANCELLED"
  | "REJECTED"
  | "SUSPENDED"
  | "EXPIRED";

export interface Subscription {
  _id?: string;
  id?: string;
  subscriptionId?: string;
  tenantId?: string | SubscriptionReference;
  tenant?: SubscriptionReference;
  businessId?: string | SubscriptionReference;
  business?: SubscriptionReference;
  businessName?: string;
  planId?: string | SubscriptionPlan;
  plan?: SubscriptionPlan;
  status?: SubscriptionStatus;
  startDate?: string;
  endDate?: string;
  autoRenew?: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSubscriptionPayload {
  tenantId: string;
  planId: string;
  startDate?: string;
  endDate?: string;
  autoRenew?: boolean;
}

export interface RenewSubscriptionPayload {
  endDate?: string;
  notes?: string;
}
