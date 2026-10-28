import { test } from "node:test";
import assert from "node:assert/strict";
import { buildForecast, expectedIn, linearFit, MIN_CLOSED } from "../lib/forecast/model.ts";
import type { LeadRecord } from "../lib/analytics/types.ts";

const NOW = new Date("2026-10-28T10:00:00Z");

function lead(id: string, status: string, createdAt: string, updatedAt = createdAt, extra: Partial<LeadRecord> = {}): LeadRecord {
  return { id, name: `Lead ${id}`, status, isActive: true, ownerId: "u1", ownerName: "Owner", source: "", city: "", category: "", createdAt, updatedAt, ...extra };
}

test("linearFit recovers a perfect line with zero residual", () => {
  const fit = linearFit([2, 4, 6, 8]);
  assert.equal(Math.round(fit.a * 1000) / 1000, 2);
  assert.equal(Math.round(fit.b * 1000) / 1000, 2);
  assert.equal(Math.round(fit.sigma * 1e6) / 1e6, 0);
});

test("empty data gives the not-enough-data state and no projections", () => {
  const result = buildForecast([], { now: NOW });
  assert.equal(result.enough, false);
  assert.equal(result.history.closed, 0);
  assert.equal(result.winRate, null);
  assert.deepEqual(result.trend, []);
  assert.equal(result.weighted.expectedWins, 0);
  assert.equal(result.needs.length, 2);
});

test("one month of data is reported as too little history", () => {
  const leads = Array.from({ length: 30 }, (_, i) => lead(String(i), i % 2 ? "WON" : "LOST", "2026-10-02T00:00:00Z", "2026-10-10T00:00:00Z"));
  const result = buildForecast(leads, { now: NOW });
  assert.equal(result.history.months, 1);
  assert.equal(result.enough, false);
  assert.match(result.needs.join(" "), /6 months/);
  assert.deepEqual(result.trend, []);
});

test("all-lost data has a 0% win rate, zero expected wins and a flat zero trend", () => {
  const leads: LeadRecord[] = [];
  for (let m = 1; m <= 8; m++) for (let i = 0; i < 4; i++) leads.push(lead(`${m}-${i}`, "LOST", `2026-0${m}-05T00:00:00Z`, `2026-0${m}-20T00:00:00Z`));
  leads.push(lead("open", "NEW", "2026-09-01T00:00:00Z", "2026-09-01T00:00:00Z", { nextFollowUpAt: "2026-11-03T00:00:00Z" }));
  const result = buildForecast(leads, { now: NOW });
  assert.equal(result.enough, true);
  assert.equal(result.winRate, 0);
  assert.equal(result.weighted.expectedWins, 0);
  assert.ok(result.trend.every((p) => p.expected === 0 && p.low === 0 && p.high === 0));
});

test("a steady 2-per-month history projects 2 per month with a tight band", () => {
  const leads: LeadRecord[] = [];
  for (let m = 1; m <= 9; m++) {
    for (let i = 0; i < 2; i++) leads.push(lead(`w${m}-${i}`, "WON", `2026-0${m}-01T00:00:00Z`, `2026-0${m}-15T00:00:00Z`));
    leads.push(lead(`l${m}`, "LOST", `2026-0${m}-01T00:00:00Z`, `2026-0${m}-16T00:00:00Z`));
    leads.push(lead(`x${m}`, "LOST", `2026-0${m}-02T00:00:00Z`, `2026-0${m}-17T00:00:00Z`));
  }
  const result = buildForecast(leads, { now: NOW, horizon: 3 });
  assert.equal(result.enough, true);
  assert.equal(result.history.won, 18);
  assert.equal(result.history.lost, 18);
  assert.equal(result.winRate, 50);
  assert.equal(result.trend.length, 3);
  assert.deepEqual(result.trend.map((p) => p.month), ["2026-10", "2026-11", "2026-12"]);
  for (const point of result.trend) {
    assert.equal(point.expected, 2);
    assert.equal(point.low, 2);
    assert.equal(point.high, 2);
  }
});

test("an outlier month widens the band but never produces a negative figure", () => {
  const leads: LeadRecord[] = [];
  const wins = [1, 1, 1, 12, 1, 1, 1, 1];
  wins.forEach((count, index) => {
    const m = index + 1;
    for (let i = 0; i < count; i++) leads.push(lead(`w${m}-${i}`, "WON", `2026-0${m}-01T00:00:00Z`, `2026-0${m}-15T00:00:00Z`));
    leads.push(lead(`l${m}`, "LOST", `2026-0${m}-01T00:00:00Z`, `2026-0${m}-16T00:00:00Z`));
  });
  const result = buildForecast(leads, { now: NOW });
  assert.equal(result.enough, true);
  for (const point of result.trend) {
    assert.ok(point.low >= 0);
    assert.ok(point.low <= point.expected && point.expected <= point.high);
    assert.ok(point.high - point.low > 2, "band should be wide after an outlier");
  }
});

test("weighted view multiplies open leads by the win rate, by expected close month", () => {
  const leads: LeadRecord[] = [];
  for (let i = 0; i < 12; i++) leads.push(lead(`w${i}`, "WON", `2026-0${(i % 6) + 1}-01T00:00:00Z`, `2026-0${(i % 6) + 1}-20T00:00:00Z`));
  for (let i = 0; i < 12; i++) leads.push(lead(`l${i}`, "LOST", `2026-0${(i % 6) + 1}-01T00:00:00Z`, `2026-0${(i % 6) + 1}-21T00:00:00Z`));
  leads.push(lead("o1", "NEW", "2026-09-01T00:00:00Z", "2026-09-01T00:00:00Z", { nextFollowUpAt: "2026-11-05T00:00:00Z" }));
  leads.push(lead("o2", "CONTACTED", "2026-09-01T00:00:00Z", "2026-09-01T00:00:00Z", { nextFollowUpAt: "2026-11-20T00:00:00Z" }));
  leads.push(lead("o3", "INTERESTED", "2026-09-01T00:00:00Z", "2026-09-01T00:00:00Z", { nextFollowUpAt: "2026-12-02T00:00:00Z" }));
  leads.push(lead("o4", "NEW", "2026-09-01T00:00:00Z"));
  const result = buildForecast(leads, { now: NOW });
  assert.equal(result.winRate, 50);
  assert.equal(result.weighted.openLeads, 4);
  assert.equal(result.weighted.expectedWins, 2);
  assert.equal(result.weighted.unscheduled, 1);
  assert.deepEqual(result.weighted.byMonth, [{ month: "2026-11", value: 1 }, { month: "2026-12", value: 0.5 }]);
  assert.equal(expectedIn(result, ["2026-11"]), 1);
  assert.equal(expectedIn(result, ["2026-11", "2026-12"]), 1.5);
});

test("owner filter and inactive records are excluded", () => {
  const leads = [
    lead("a", "WON", "2026-01-01T00:00:00Z", "2026-02-01T00:00:00Z", { ownerId: "u1" }),
    lead("b", "WON", "2026-01-01T00:00:00Z", "2026-02-01T00:00:00Z", { ownerId: "u2" }),
    lead("c", "LOST", "2026-01-01T00:00:00Z", "2026-02-01T00:00:00Z", { ownerId: "u1", isActive: false }),
  ];
  const mine = buildForecast(leads, { now: NOW, ownerId: "u1" });
  assert.equal(mine.history.closed, 1);
  assert.equal(buildForecast(leads, { now: NOW }).history.closed, 2);
  assert.ok(MIN_CLOSED > 2);
});
