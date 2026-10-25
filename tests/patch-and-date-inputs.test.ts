import { test } from "node:test";
import assert from "node:assert/strict";
import { changedFields } from "../lib/forms/changed-fields.ts";
import { fromDateTimeLocalValue, toDateTimeLocalValue, validateEditedDateTime } from "../lib/forms/date-time.ts";
import { toFollowUpUpdatePayload } from "../lib/follow-ups/update-payload.ts";

test("PATCH differences omit untouched fields and retain intentional clears", () => {
  assert.deepEqual(changedFields({ name: "Jane", email: "", active: false, numbers: [], note: null, untouched: undefined },
    { name: "Jane", email: "jane@example.com", active: true, numbers: ["123"], note: "Old" }),
  { email: "", active: false, numbers: [], note: null });
  assert.deepEqual(changedFields({ fullName: "Jane", role: "ADMIN" }, { fullName: "Jane", role: "ADMIN" }), {});
  assert.deepEqual(changedFields({ password: "new-password" }, {}), { password: "new-password" });
});

test("edit schedules prepopulate local date/time without shifting the saved instant", () => {
  const saved = "2026-01-02T03:04:00.000Z";
  const local = toDateTimeLocalValue(saved);
  const date = new Date(saved);
  assert.equal(local, `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}T${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`);
  assert.equal(fromDateTimeLocalValue(local), saved);
});

test("local display follows Date getters across daylight-saving boundaries", () => {
  for (const saved of ["2026-03-08T06:30:00Z", "2026-11-01T05:30:00Z", "2026-11-01T06:30:00Z"]) {
    const date = new Date(saved);
    const local = toDateTimeLocalValue(saved);
    assert.equal(Number(local.slice(11, 13)), date.getHours());
    assert.equal(Number(local.slice(14, 16)), date.getMinutes());
    assert.equal(Number(local.slice(8, 10)), date.getDate());
  }
});

test("unchanged past schedules are valid on edit; new past schedules are rejected", () => {
  const original = "2020-01-01T10:00:00.000Z";
  assert.equal(validateEditedDateTime(toDateTimeLocalValue(original), original), true);
  assert.notEqual(validateEditedDateTime("2020-01-02T10:00", original), true);
  assert.notEqual(validateEditedDateTime("", original), true);
});

test("impossible dates and incomplete or invalid times never roll into another day", () => {
  for (const value of ["2026-02-30T12:00", "2026-13-01T12:00", "2026-01-01T24:00", "2026-01-01T12:60", "2026-01-01", "2026-01-01T", "invalid"]) {
    assert.equal(fromDateTimeLocalValue(value), undefined, value);
  }
  assert.ok(fromDateTimeLocalValue("2028-02-29T00:00"));
});

test("follow-up PATCH sends only the changed field and preserves schedule seconds", () => {
  const original = { assignedTo: "user-1", type: "CALL", reminderInMinutes: 15, scheduledAt: "2020-01-01T10:00:37.123Z" };
  const current = { ...original, scheduledAt: toDateTimeLocalValue(original.scheduledAt) };
  assert.deepEqual(toFollowUpUpdatePayload(current, original), {});
  assert.deepEqual(toFollowUpUpdatePayload({ ...current, assignedTo: "user-2" }, original), { assignedTo: "user-2" });
  assert.deepEqual(toFollowUpUpdatePayload({ ...current, reminderInMinutes: 0 }, original), { reminderInMinutes: 0 });
  const rescheduled = "2030-01-01T12:00";
  assert.deepEqual(toFollowUpUpdatePayload({ ...current, scheduledAt: rescheduled }, original), { scheduledAt: fromDateTimeLocalValue(rescheduled) });
});
