import { test } from "node:test";
import assert from "node:assert/strict";
import { buildRenewalPayload } from "../lib/subscriptions/renewal.ts";
import { hasCurrentSubscriptionAccess } from "../lib/subscriptions/access.ts";

const now = Date.parse("2026-10-25T12:00:00Z");

test("renewal leaves billing cycle calculation to the backend when date is omitted", () => {
  assert.deepEqual(buildRenewalPayload({}, "", "  ", now), {});
  assert.deepEqual(buildRenewalPayload({}, "2026-11-25", "  Approved  ", now), {
    endDate: "2026-11-25T00:00:00.000Z", notes: "Approved",
  });
});

test("renewal rejects dates that shorten the current term or are already past", () => {
  for (const endDate of ["invalid", "2026-10-24", "2026-11-25"]) {
    assert.throws(() => buildRenewalPayload({ endDate: "2026-11-25T00:00:00Z" }, endDate, "", now));
  }
  assert.throws(() => buildRenewalPayload({}, "", "x".repeat(1001), now));
});

test("workspace access respects term boundaries even before backend status changes", () => {
  for (const status of ["ACTIVE", "CANCELLED"] as const) {
    assert.equal(hasCurrentSubscriptionAccess({ status, endDate: "2026-10-25T12:00:00Z" }, now), false);
    assert.equal(hasCurrentSubscriptionAccess({ status, endDate: "invalid" }, now), false);
    assert.equal(hasCurrentSubscriptionAccess({ status, startDate: "2026-11-01" }, now), false);
    assert.equal(hasCurrentSubscriptionAccess({ status, endDate: "2026-11-01" }, now), true);
  }
  assert.equal(hasCurrentSubscriptionAccess({ status: "ACTIVE" }, now), true);
  assert.equal(hasCurrentSubscriptionAccess({ status: "PENDING" }, now), false);
});

test("suspension removes access and resuming respects the existing subscription term", () => {
  const term = { startDate: "2026-10-01", endDate: "2026-11-01" };
  assert.equal(hasCurrentSubscriptionAccess({ ...term, status: "SUSPENDED" }, now), false);
  assert.equal(hasCurrentSubscriptionAccess({ status: "SUSPENDED" }, now), false);
  assert.equal(hasCurrentSubscriptionAccess({ ...term, status: "ACTIVE" }, now), true);
  assert.equal(hasCurrentSubscriptionAccess({ ...term, status: "ACTIVE" }, Date.parse("2026-11-02")), false);
});
