import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createSubscription,
  getSubscriptionPlans,
  getSubscriptions,
  renewSubscription,
  updateSubscriptionStatus,
} from "@/lib/subscriptions/api";
import type {
  CreateSubscriptionPayload,
  RenewSubscriptionPayload,
  SubscriptionStatus,
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
    onSuccess: () => {
      void refreshSubscriptions();
      toast.success("Subscription request created.");
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
    onSuccess: () => {
      void refreshSubscriptions();
      toast.success("Subscription renewed.");
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
    onSuccess: (_, variables) => {
      void refreshSubscriptions();
      toast.success(
        variables.status === "ACTIVE"
          ? "Subscription request approved."
          : variables.status === "CANCELLED"
            ? "Subscription cancelled. Access remains available until the current term ends."
            : variables.status === "REJECTED"
              ? "Subscription request rejected."
              : "Subscription status updated.",
      );
    },
  });
}
