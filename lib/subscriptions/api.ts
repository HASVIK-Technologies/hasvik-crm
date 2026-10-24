import { apiClient } from "@/lib/api/api-client";
import type {
  CreateSubscriptionPayload,
  RenewSubscriptionPayload,
  Subscription,
  SubscriptionPlan,
  SubscriptionStatus,
} from "@/types/subscription";

type CollectionPayload<T> = T[] | { data: T[] };

function unwrap<T>(payload: T | { data: T }): T {
  return payload && typeof payload === "object" && "data" in payload
    ? (payload as { data: T }).data
    : (payload as T);
}

function readCollection<T>(payload: CollectionPayload<T>): T[] {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.data)) return payload.data;
  throw new Error("The subscriptions service returned an invalid list.");
}

export async function getSubscriptionPlans(
  signal?: AbortSignal,
): Promise<SubscriptionPlan[]> {
  const response = await apiClient.get<CollectionPayload<SubscriptionPlan>>(
    "/subscription-plans",
    {
      params: { isActive: true, page: 1, limit: 100 },
      signal,
    },
  );
  return readCollection(response.data);
}

export async function getSubscriptions(
  signal?: AbortSignal,
): Promise<Subscription[]> {
  const response =
    await apiClient.get<CollectionPayload<Subscription>>("/subscriptions", {
      signal,
    });
  return readCollection(response.data);
}

export async function createSubscription(
  payload: CreateSubscriptionPayload,
): Promise<Subscription> {
  const response = await apiClient.post<Subscription | { data: Subscription }>(
    "/subscriptions",
    payload,
  );
  return unwrap(response.data);
}

export async function updateSubscriptionStatus(
  id: string,
  status: SubscriptionStatus,
): Promise<Subscription> {
  const subscriptionId = id.trim();
  if (!subscriptionId) throw new Error("Subscription ID is required to update its status.");
  const response = await apiClient.patch<Subscription | { data: Subscription }>(
    `/subscriptions/${encodeURIComponent(subscriptionId)}/status`,
    { status },
  );
  return unwrap(response.data);
}

export async function renewSubscription(
  id: string,
  payload: RenewSubscriptionPayload = {},
): Promise<Subscription> {
  const subscriptionId = id.trim();
  if (!subscriptionId) throw new Error("Subscription ID is required to renew a subscription.");
  const response = await apiClient.patch<Subscription | { data: Subscription }>(
    `/subscriptions/${encodeURIComponent(subscriptionId)}/renew`,
    payload,
  );
  return unwrap(response.data);
}
