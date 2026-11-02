import { test } from "node:test";
import assert from "node:assert/strict";
import { getPreviousFollowUps } from "../lib/follow-ups/history.ts";
import type { FollowUpItem } from "../types/follow-up.ts";

function item(id: string, scheduledAt: string, businessId = "business-1"): FollowUpItem {
  return { id, scheduledAt, businessId, businessName: "Business", assignedToName: "Owner", type: "CALL", status: "COMPLETED" };
}

test("history excludes current, same-time, later, future, other-business and invalid follow-ups", () => {
  const current = item("current", "2026-10-30T10:00:00Z");
  const rows = [current, item("older", "2026-10-28T10:00:00Z"), item("recent", "2026-10-29T10:00:00Z"),
    item("same-time", current.scheduledAt), item("later", "2026-11-01T10:00:00Z"),
    item("other-business", "2026-10-28T10:00:00Z", "business-2"), item("invalid", "invalid")];
  assert.deepEqual(getPreviousFollowUps(rows, current, Date.parse("2026-10-30T12:00:00Z")).map((row) => row.id), ["recent", "older"]);
  assert.equal(rows[0], current, "does not mutate the source list");
});

test("a future current follow-up does not put other future appointments in history", () => {
  const current = item("current", "2026-11-10T10:00:00Z");
  assert.deepEqual(getPreviousFollowUps([item("future", "2026-11-01T10:00:00Z")], current, Date.parse("2026-10-30T12:00:00Z")), []);
});

test("missing business or invalid current date produces no history", () => {
  const rows = [item("older", "2026-10-28T10:00:00Z")];
  assert.deepEqual(getPreviousFollowUps(rows, item("current", "invalid")), []);
  assert.deepEqual(getPreviousFollowUps(rows, item("current", "2026-10-30T10:00:00Z", "")), []);
});
