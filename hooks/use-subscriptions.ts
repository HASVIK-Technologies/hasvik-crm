import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createSubscription,
  getSubscriptionPlans,
  getSubscriptions,
  getSubscriptionsPage,
  renewSubscription,
  updateSubscriptionStatus,
} from "@/lib/subscriptions/api";
import type {
  CreateSubscriptionPayload,
  RenewSubscriptionPayload,
  SubscriptionStatus,
  SubscriptionQueryParams,
} from "@/types/subscription";

export const subscriptionQueryKeys = {
  all: ["subscriptions"] as const,
  plans: () => [...subscriptionQueryKeys.all, "plans"] as const,
  list: (scopeKey?: string) =>
    [...subscriptionQueryKeys.all, "list", scopeKey ?? "all"] as const,
};

export function useSubscriptionPlansQuery() {
  return useQuery({
    queryKey: subscriptionQueryKeys.plans(),
    queryFn: ({ signal }) => getSubscriptionPlans(signal),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSubscriptionsQuery(scopeKey?: string, enabled = true) {
  return useQuery({
    queryKey: subscriptionQueryKeys.list(scopeKey),
    enabled,
    queryFn: ({ signal }) => getSubscriptions(signal),
  });
}

export function useSubscriptionsPageQuery(params: SubscriptionQueryParams, scopeKey?: string, enabled = true) {
  return useQuery({
    queryKey: [...subscriptionQueryKeys.list(scopeKey), "page", params],
    enabled,
    queryFn: ({ signal }) => getSubscriptionsPage(params, signal),
  });
}

function useRefreshSubscriptions() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.all });
}

export function useCreateSubscription() {
  const refreshSubscriptions = useRefreshSubscriptions();
  return useMutation({
    mutationFn: (payload: CreateSubscriptionPayload) =>
      createSubscription(payload),
    onSuccess: (subscription) => {
      void refreshSubscriptions();
      toast.success(
        subscription.status?.toUpperCase() === "ACTIVE"
          ? "Subscription activated."
          : subscription.status?.toUpperCase() === "PENDING"
            ? "Subscription request created."
            : "Subscription created.",
      );
    },
  });
}

export function useRenewSubscription() {
  const refreshSubscriptions = useRefreshSubscriptions();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload?: RenewSubscriptionPayload;
    }) => renewSubscription(id, payload),
    onSuccess: async (subscription) => {
      await refreshSubscriptions();
      toast.success(subscription.status === "PENDING" ? "Renewal submitted for approval." : "Subscription renewed.");
    },
  });
}

export function useUpdateSubscriptionStatus() {
  const refreshSubscriptions = useRefreshSubscriptions();
  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: SubscriptionStatus;
    }) => updateSubscriptionStatus(id, status),
    onSuccess: async (_, variables) => {
      await refreshSubscriptions();
      toast.success(
        variables.status === "ACTIVE"
          ? "Subscription activated."
          : variables.status === "CANCELLED"
            ? "Subscription cancelled. Access remains available until the current term ends."
            : variables.status === "REJECTED"
              ? "Subscription request rejected."
              : variables.status === "SUSPENDED"
                ? "Subscription suspended. It no longer grants workspace access."
                : "Subscription status updated.",
      );
    },
  });
}
