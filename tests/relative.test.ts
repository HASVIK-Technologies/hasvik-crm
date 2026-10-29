import { test } from "node:test";
import assert from "node:assert/strict";
import { relativeDay, timeAgo } from "../lib/analytics/relative.ts";

// 29 Oct 2026, 11:00 in India.
const NOW = new Date("2026-10-29T05:30:00Z");

test("due dates read as Today, Tomorrow, In N days or Overdue Nd in the workspace calendar", () => {
  assert.deepEqual(relativeDay("2026-10-29T14:00:00Z", NOW), { label: "Today", tone: "warn", days: 0 });
  assert.equal(relativeDay("2026-10-30T02:00:00Z", NOW)?.label, "Tomorrow");
  assert.equal(relativeDay("2026-11-02T10:00:00Z", NOW)?.label, "In 4 days");
  assert.deepEqual(relativeDay("2026-10-24T10:00:00Z", NOW), { label: "Overdue 5d", tone: "bad", days: -5 });
});

test("a time late in the evening UTC is already tomorrow in India", () => {
  assert.equal(relativeDay("2026-10-29T20:00:00Z", NOW)?.label, "Tomorrow");
});

test("empty and invalid dates give no chip", () => {
  assert.equal(relativeDay(undefined, NOW), null);
  assert.equal(relativeDay("", NOW), null);
  assert.equal(relativeDay("not a date", NOW), null);
});

test("time ago uses plain words and falls back to a date after a month", () => {
  assert.equal(timeAgo("2026-10-29T05:29:40Z", NOW), "Just now");
  assert.equal(timeAgo("2026-10-29T03:30:00Z", NOW), "2 hours ago");
  assert.equal(timeAgo("2026-10-28T05:30:00Z", NOW), "1 day ago");
  assert.match(timeAgo("2026-08-01T05:30:00Z", NOW), /2026/);
});
