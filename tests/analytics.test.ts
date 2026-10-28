import { test } from "node:test";
import assert from "node:assert/strict";
import { percentChange, resolveRange, zonedDay, inRange } from "../lib/analytics/ranges.ts";
import {
  activityByOwner, bySource, byOwner, conversionFunnel, countsOverTime, pipelineByStage, staleLeads, winLoss, wonIn,
} from "../lib/analytics/metrics.ts";
import type { ActivityRecord, LeadRecord } from "../lib/analytics/types.ts";

// 28 Oct 2026, 11:00 in India (05:30 UTC offset).
const NOW = new Date("2026-10-28T05:30:00Z");

function lead(id: string, status: string, extra: Partial<LeadRecord> = {}): LeadRecord {
  return { id, name: id, status, isActive: true, ownerId: "u1", ownerName: "Asha", source: "WHATSAPP", city: "", category: "", createdAt: "2026-10-01T00:00:00Z", updatedAt: "2026-10-01T00:00:00Z", ...extra };
}

test("zonedDay uses the workspace calendar, not UTC", () => {
  assert.equal(zonedDay(new Date("2026-10-27T20:00:00Z")), "2026-10-28");
});

test("7d range covers seven calendar days ending today, with an equally long previous period", () => {
  const range = resolveRange("7d", NOW);
  assert.equal(range.from, "2026-10-21T18:30:00.000Z");
  assert.equal(range.to, "2026-10-28T18:29:59.999Z");
  assert.equal(range.previous.to, "2026-10-21T18:29:59.999Z");
  assert.equal(Date.parse(range.previous.to) - Date.parse(range.previous.from) + 1, 7 * 86_400_000);
  assert.equal(range.compareLabel, "vs previous 7 days");
});

test("month and quarter ranges start on the first day and compare with the previous one", () => {
  const month = resolveRange("month", NOW);
  assert.equal(month.from, "2026-09-30T18:30:00.000Z");
  assert.equal(month.previous.from, "2026-08-31T18:30:00.000Z");
  const quarter = resolveRange("quarter", NOW);
  assert.equal(quarter.from, "2026-09-30T18:30:00.000Z");
  assert.equal(quarter.previous.from, "2026-06-30T18:30:00.000Z");
  const q1 = resolveRange("quarter", new Date("2026-02-10T00:00:00Z"));
  assert.equal(q1.previous.from, "2025-09-30T18:30:00.000Z");
});

test("custom range swaps reversed dates and falls back to today for bad input", () => {
  const range = resolveRange("custom", NOW, { from: "2026-10-10", to: "2026-10-05" });
  assert.equal(range.from, "2026-10-04T18:30:00.000Z");
  assert.equal(range.to, "2026-10-10T18:29:59.999Z");
  assert.equal(resolveRange("custom", NOW, { from: "nope", to: "" }).label, "2026-10-28");
});

test("percentChange handles zero baselines", () => {
  assert.equal(percentChange(5, 4), 25);
  assert.equal(percentChange(2, 4), -50);
  assert.equal(percentChange(0, 0), 0);
  assert.equal(percentChange(3, 0), null);
  assert.equal(inRange("2026-10-05T00:00:00Z", "2026-10-01T00:00:00Z", "2026-10-31T00:00:00Z"), true);
  assert.equal(inRange(undefined, "2026-10-01T00:00:00Z", "2026-10-31T00:00:00Z"), false);
});

test("pipeline and win/loss ignore inactive leads and compute the closed-only win rate", () => {
  const leads = [lead("1", "NEW"), lead("2", "NEW"), lead("3", "WON"), lead("4", "LOST"), lead("5", "WON", { isActive: false })];
  assert.deepEqual(pipelineByStage(leads).filter((s) => s.count).map((s) => [s.status, s.count]), [["NEW", 2], ["WON", 1], ["LOST", 1]]);
  assert.deepEqual(winLoss(leads), { won: 1, lost: 1, open: 2, winRate: 50 });
  assert.equal(winLoss([lead("1", "NEW")]).winRate, null);
});

test("owner and source rollups keep unassigned and unrecorded groups", () => {
  const leads = [
    lead("1", "WON"), lead("2", "LOST"), lead("3", "NEW", { ownerId: "", ownerName: "", source: "" }),
    lead("4", "WON", { ownerId: "u2", ownerName: "Ravi", source: "Referral" }),
  ];
  const owners = byOwner(leads);
  assert.deepEqual(owners.map((o) => [o.ownerName, o.total, o.won]), [["Asha", 2, 1], ["Ravi", 1, 1], ["Unassigned", 1, 0]]);
  assert.equal(owners[0].winRate, 50);
  const sources = bySource(leads);
  assert.deepEqual(sources.map((s) => [s.source, s.total]), [["Referral", 1], ["WHATSAPP", 2], ["Not recorded", 1]].sort((a, b) => (b[1] as number) - (a[1] as number) || String(a[0]).localeCompare(String(b[0]))));
});

test("funnel counts leads at or beyond each stage and excludes lost leads", () => {
  const leads = [lead("1", "NEW"), lead("2", "CONTACTED"), lead("3", "INTERESTED"), lead("4", "WON"), lead("5", "LOST")];
  const funnel = conversionFunnel(leads);
  assert.deepEqual(funnel.map((s) => s.reached), [4, 3, 2, 1, 1]);
  assert.equal(funnel[0].percentOfStart, 100);
  assert.equal(funnel[4].percentOfStart, 25);
});

test("stale leads are open leads untouched for N days", () => {
  const leads = [
    lead("old", "NEW", { createdAt: "2026-08-01T00:00:00Z" }),
    lead("touched", "NEW", { createdAt: "2026-08-01T00:00:00Z", lastFollowUpAt: "2026-10-20T00:00:00Z" }),
    lead("scheduled", "NEW", { createdAt: "2026-08-01T00:00:00Z", nextFollowUpAt: "2026-11-01T00:00:00Z" }),
    lead("closed", "WON", { createdAt: "2026-08-01T00:00:00Z" }),
  ];
  assert.deepEqual(staleLeads(leads, 14, NOW).map((l) => l.id), ["old"]);
});

test("won-in-range uses the last update time of won leads", () => {
  const leads = [lead("a", "WON", { updatedAt: "2026-10-15T00:00:00Z" }), lead("b", "WON", { updatedAt: "2026-09-15T00:00:00Z" }), lead("c", "NEW", { updatedAt: "2026-10-15T00:00:00Z" })];
  assert.deepEqual(wonIn(leads, "2026-10-01T00:00:00Z", "2026-10-31T00:00:00Z").map((l) => l.id), ["a"]);
});

test("activity volume counts completed work per owner inside the range", () => {
  const act = (id: string, type: string, status: string, completedAt: string, ownerId = "u1"): ActivityRecord => ({
    id, businessId: "b", businessName: "B", ownerId, ownerName: ownerId === "u1" ? "Asha" : "Ravi", type, status, scheduledAt: completedAt, completedAt, createdAt: completedAt,
  });
  const rows = activityByOwner(
    [act("1", "CALL", "COMPLETED", "2026-10-10T00:00:00Z"), act("2", "MEETING", "COMPLETED", "2026-10-11T00:00:00Z"), act("3", "WHATSAPP", "COMPLETED", "2026-10-12T00:00:00Z", "u2"), act("4", "CALL", "SCHEDULED", "2026-10-12T00:00:00Z"), act("5", "CALL", "COMPLETED", "2026-08-12T00:00:00Z")],
    { from: "2026-10-01T00:00:00Z", to: "2026-10-31T00:00:00Z" },
  );
  assert.deepEqual(rows.map((r) => [r.ownerName, r.calls, r.meetings, r.messages, r.total]), [["Asha", 1, 1, 0, 2], ["Ravi", 0, 0, 1, 1]]);
});

test("countsOverTime buckets by day for short ranges and by month for long ones", () => {
  const range = resolveRange("7d", NOW);
  const series = countsOverTime(["2026-10-28T01:00:00Z", "2026-10-28T02:00:00Z", "2026-10-22T01:00:00Z", "2026-01-01T00:00:00Z"], range, zonedDay);
  assert.equal(series.length, 7);
  assert.equal(series.reduce((s, p) => s + p.value, 0), 3);
  assert.equal(series.at(-1)?.value, 2);
  const long = countsOverTime(["2026-08-15T00:00:00Z"], { from: "2026-06-01T00:00:00Z", to: "2026-10-31T00:00:00Z" }, zonedDay);
  assert.deepEqual(long.map((p) => p.key), ["2026-06", "2026-07", "2026-08", "2026-09", "2026-10"]);
  assert.equal(long[2].value, 1);
});
