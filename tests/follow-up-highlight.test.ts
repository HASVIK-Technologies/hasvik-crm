import { test } from "node:test";
import assert from "node:assert/strict";
import { savedFollowUpDate, visibleCalendarItems } from "../lib/follow-ups/highlight.ts";

test("crowded dates keep the saved follow-up visible without modifying source order", () => {
  const items = ["1", "2", "3", "4", "5"].map((id) => ({ id }));
  assert.deepEqual(visibleCalendarItems(items, "5").map((item) => item.id), ["1", "2", "5"]);
  assert.deepEqual(items.map((item) => item.id), ["1", "2", "3", "4", "5"]);
  assert.deepEqual(visibleCalendarItems(items, "2").map((item) => item.id), ["1", "2", "3"]);
  assert.equal(visibleCalendarItems([], "missing").length, 0);
});

test("saved follow-ups highlight the local calendar date, including midnight boundaries", () => {
  for (const instant of ["2026-12-31T23:45:00Z", "2026-01-01T00:15:00Z"]) {
    const date = new Date(instant);
    const expected = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    assert.equal(savedFollowUpDate(instant), expected);
  }
  assert.equal(savedFollowUpDate(""), null);
  assert.equal(savedFollowUpDate("invalid"), null);
});
