import { test } from "node:test";
import assert from "node:assert/strict";
import { applyLeadViewFilter, followUpsHref, leadsHref, needsClientFilter, parseLeadViewFilter } from "../lib/analytics/lead-filters.ts";
import type { LeadRecord } from "../lib/analytics/types.ts";

const NOW = new Date("2026-10-28T05:30:00Z");

function lead(id: string, extra: Partial<LeadRecord> = {}): LeadRecord {
  return { id, name: id, status: "NEW", isActive: true, ownerId: "u1", ownerName: "Asha", source: "WHATSAPP", city: "", category: "", createdAt: "2026-10-01T00:00:00Z", updatedAt: "2026-10-01T00:00:00Z", ...extra };
}

test("a filter survives the round trip through the URL", () => {
  const href = leadsHref({ owner: "u1", createdFrom: "2026-10-01T00:00:00.000Z", createdTo: "2026-10-31T00:00:00.000Z", status: "WON", isActive: true });
  const parsed = parseLeadViewFilter(new URL(href, "http://x").searchParams);
  assert.equal(parsed.owner, "u1");
  assert.equal(parsed.createdFrom, "2026-10-01T00:00:00.000Z");
  assert.equal(parsed.status, "WON");
  assert.equal(parsed.isActive, true);
  assert.equal(needsClientFilter(parsed), true);
  assert.equal(needsClientFilter({ status: "WON", isActive: true }), false);
});

test("owner, unassigned, open, source and date filters narrow the list", () => {
  const leads = [
    lead("a"),
    lead("b", { ownerId: "", ownerName: "" }),
    lead("c", { status: "WON", updatedAt: "2026-10-20T00:00:00Z" }),
    lead("d", { source: "Referral", createdAt: "2026-09-01T00:00:00Z" }),
  ];
  const ids = (f: Parameters<typeof applyLeadViewFilter>[1]) => applyLeadViewFilter(leads, f, NOW).map((l) => l.id);
  assert.deepEqual(ids({ owner: "none" }), ["b"]);
  assert.deepEqual(ids({ owner: "u1" }), ["a", "c", "d"]);
  assert.deepEqual(ids({ open: true }), ["a", "b", "d"]);
  assert.deepEqual(ids({ source: "Referral" }), ["d"]);
  assert.deepEqual(ids({ createdFrom: "2026-10-01T00:00:00Z", createdTo: "2026-10-31T00:00:00Z" }), ["a", "b", "c"]);
  assert.deepEqual(ids({ status: "WON", updatedFrom: "2026-10-15T00:00:00Z" }), ["c"]);
  assert.deepEqual(ids({ source: "Not recorded", owner: "none" }), []);
});

test("stale filter keeps only open leads untouched for N days", () => {
  const leads = [lead("old", { createdAt: "2026-08-01T00:00:00Z" }), lead("fresh", { createdAt: "2026-10-25T00:00:00Z" }), lead("won", { status: "WON", createdAt: "2026-08-01T00:00:00Z" })];
  assert.deepEqual(applyLeadViewFilter(leads, { staleDays: 14 }, NOW).map((l) => l.id), ["old"]);
});

test("follow-up links only carry the filters that are set", () => {
  assert.equal(followUpsHref({}), "/follow-ups");
  assert.equal(followUpsHref({ status: "OVERDUE" }), "/follow-ups?status=OVERDUE");
  assert.equal(followUpsHref({ status: "COMPLETED", fromDate: "a", toDate: "b" }), "/follow-ups?status=COMPLETED&fromDate=a&toDate=b");
});
