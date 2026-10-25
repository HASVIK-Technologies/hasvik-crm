import { test } from "node:test";
import assert from "node:assert/strict";
import { QueryClient, QueryObserver } from "@tanstack/react-query";
import { auditLogQueryKeys } from "../lib/audit-logs/query-keys.ts";
import type { AuditEntityType } from "../types/audit-log.ts";

const entities: [AuditEntityType, string][] = [
  ["BUSINESS", "businesses"], ["FOLLOWUP", "follow-ups"],
  ["CATEGORY", "business-category-management"], ["SUBSCRIPTION", "subscriptions"],
  ["USER", "users"], ["TENANT", "tenants"],
];

for (const [entityType, mutationPrefix] of entities) {
  test(`${entityType} mutation invalidation refetches its active timeline only`, async () => {
    const client = new QueryClient();
    let requests = 0;
    const options = {
      queryKey: auditLogQueryKeys.entity(entityType, "record-1"),
      queryFn: async () => ++requests,
      staleTime: 15_000,
    };
    await client.fetchQuery(options);
    const otherType = entityType === "USER" ? "CATEGORY" : "USER";
    const otherKey = auditLogQueryKeys.entity(otherType, "record-1");
    client.setQueryData(otherKey, []);
    const observer = new QueryObserver(client, options);
    const unsubscribe = observer.subscribe(() => {});
    try {
      await client.invalidateQueries({ queryKey: [mutationPrefix] });
      assert.equal(requests, 2);
      assert.equal(client.getQueryState(otherKey)?.isInvalidated, false);
    } finally {
      unsubscribe();
      client.clear();
    }
  });
}
