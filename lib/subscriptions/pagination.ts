import type { Subscription, SubscriptionQueryParams, SubscriptionsPage } from "../../types/subscription.ts";

export type SubscriptionCollectionResponse = Subscription[] | { data: Subscription[]; total?: number };

export function subscriptionListParams(params: SubscriptionQueryParams): SubscriptionQueryParams {
  return {
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    ...(params.search?.trim() ? { search: params.search.trim() } : {}),
    ...(params.status ? { status: params.status } : {}),
    ...(params.tenantId ? { tenantId: params.tenantId } : {}),
    ...(params.billingCycle ? { billingCycle: params.billingCycle } : {}),
    sortBy: params.sortBy ?? "-createdAt",
  };
}

export function readSubscriptionsPage(payload: SubscriptionCollectionResponse): SubscriptionsPage {
  const data = Array.isArray(payload) ? payload : payload?.data;
  if (!Array.isArray(data)) throw new Error("The subscriptions service returned an invalid list.");
  const total = !Array.isArray(payload) && payload.total !== undefined ? payload.total : data.length;
  if (!Number.isSafeInteger(total) || total < 0) throw new Error("The subscriptions service returned an invalid total.");
  return { data, total };
}

// Access checks and dashboards need every record, independent of list filters.
export async function collectSubscriptionPages(fetchPage: (params: SubscriptionQueryParams) => Promise<SubscriptionsPage>): Promise<Subscription[]> {
  const first = await fetchPage({ page: 1, limit: 100 });
  const rows = [...first.data];
  const seen = new Set(rows.map((item) => item._id ?? item.id ?? item.subscriptionId));
  for (let page = 2; rows.length < first.total; page++) {
    const next = await fetchPage({ page, limit: 100 });
    const fresh = next.data.filter((item) => !seen.has(item._id ?? item.id ?? item.subscriptionId));
    if (!fresh.length) throw new Error("Subscription pagination did not advance. Please try again.");
    for (const item of fresh) {
      seen.add(item._id ?? item.id ?? item.subscriptionId);
      rows.push(item);
    }
  }
  return rows;
}
