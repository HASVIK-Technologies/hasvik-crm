import { test } from "node:test";
import assert from "node:assert/strict";
import { getSubscriptionStatusVisual, SUBSCRIPTION_STATUS_VISUALS } from "../lib/subscriptions/status.ts";

test("every subscription status has a distinct shared badge and indicator", () => {
  const visuals = Object.values(SUBSCRIPTION_STATUS_VISUALS);
  assert.equal(visuals.length, 6);
  for (const property of ["badge", "dot", "darkDot", "accent"] as const) {
    assert.equal(new Set(visuals.map((visual) => visual[property])).size, 6);
  }
  const expired = getSubscriptionStatusVisual("EXPIRED");
  const suspended = getSubscriptionStatusVisual("SUSPENDED");
  assert.notEqual(expired.badge, suspended.badge);
  assert.notEqual(expired.darkDot, suspended.darkDot);
  assert.notEqual(expired.accent, suspended.accent);
});

test("status visuals normalize API values and keep unknown states neutral", () => {
  assert.equal(getSubscriptionStatusVisual(" suspended ").label, "Suspended");
  assert.equal(getSubscriptionStatusVisual("active").label, "Active");
  assert.equal(getSubscriptionStatusVisual(undefined).label, "Unknown");
  assert.equal(getSubscriptionStatusVisual("constructor").label, "Unknown");
  assert.equal(getSubscriptionStatusVisual("UNRECOGNIZED").badge, SUBSCRIPTION_STATUS_VISUALS.CANCELLED.badge);
});
