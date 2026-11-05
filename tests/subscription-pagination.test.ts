import { test } from "node:test";
import assert from "node:assert/strict";
import { collectSubscriptionPages, readSubscriptionsPage, subscriptionListParams } from "../lib/subscriptions/pagination.ts";

test("subscription list combines server pagination, search, filters and sorting", () => {
  assert.deepEqual(subscriptionListParams({ page: 3, limit: 20, search: "  premium  ", status: "SUSPENDED", tenantId: "tenant-1", billingCycle: "YEARLY", sortBy: "endDate" }), {
    page: 3, limit: 20, search: "premium", status: "SUSPENDED", tenantId: "tenant-1", billingCycle: "YEARLY", sortBy: "endDate",
  });
  assert.deepEqual(subscriptionListParams({ search: " " }), { page: 1, limit: 10, sortBy: "-createdAt" });
});

test("subscription page preserves server total including empty pages", () => {
  assert.deepEqual(readSubscriptionsPage({ data: [{ id: "sub-1" }], total: 31 }), { data: [{ id: "sub-1" }], total: 31 });
  assert.deepEqual(readSubscriptionsPage({ data: [], total: 31 }), { data: [], total: 31 });
  assert.deepEqual(readSubscriptionsPage([{ id: "legacy" }]), { data: [{ id: "legacy" }], total: 1 });
  assert.throws(() => readSubscriptionsPage({ data: [], total: -1 }));
  assert.throws(() => readSubscriptionsPage({ data: null } as never));
});

test("access and dashboard collections load later pages independently of list filters", async () => {
  const calls: unknown[] = [];
  const data = await collectSubscriptionPages(async (params) => {
    calls.push(params);
    return { data: [{ id: params.page === 1 ? "expired" : "active", status: params.page === 1 ? "EXPIRED" : "ACTIVE" }], total: 2 };
  });
  assert.deepEqual(calls, [{ page: 1, limit: 100 }, { page: 2, limit: 100 }]);
  assert.equal(data[1].status, "ACTIVE");
});

test("a backend repeating or truncating pages fails instead of granting incomplete access", async () => {
  await assert.rejects(collectSubscriptionPages(async () => ({ data: [{ id: "same" }], total: 2 })), /did not advance/);
  await assert.rejects(collectSubscriptionPages(async ({ page }) => ({ data: page === 1 ? [{ id: "one" }] : [], total: 2 })), /did not advance/);
});
