import { test } from "node:test";
import assert from "node:assert/strict";
import { DASHBOARD_PREVIEW_LIMIT, dashboardPreview, dashboardConfig, dashboardDates, dashboardDateLabel, dashboardFollowUpFilters, followUpWorkload, pipelineSummary, subscriptionSummary } from "../lib/dashboard/model.ts";
import type { FollowUpItem } from "../types/follow-up.ts";
import { parseCalendarDate } from "../lib/forms/date-time.ts";

test("dashboard previews request five records and cap longer responses without changing totals", () => {
  assert.equal(DASHBOARD_PREVIEW_LIMIT, 5);
  assert.equal(dashboardFollowUpFilters("user-1").limit, 5);
  const records = Array.from({ length: 12 }, (_, id) => ({ id: String(id), status: "PENDING" as const }));
  const summary = subscriptionSummary(records, new Date("2026-10-25T10:00:00Z"));
  assert.equal(dashboardPreview(summary.pending).length, 5);
  assert.equal(summary.pending.length, 12);
  assert.equal(records.length, 12);
  assert.deepEqual(dashboardPreview([]), []);
  assert.equal(dashboardPreview(records.slice(0, 2)).length, 2);
});

test("dashboard roles have explicit personal and workspace scopes", () => {
  for (const role of ["SUPERADMIN", "ADMIN", "MANAGER", "SALES", "USER"]) {
    const config = dashboardConfig(` ${role.toLowerCase()} `);
    assert.equal(config?.role, role);
    assert.equal(config?.personal, ["SALES", "USER"].includes(role));
  }
  assert.equal(dashboardConfig("UNKNOWN"), null);
  assert.equal(dashboardConfig("constructor"), null);
});

test("dashboard date windows use the client timezone across UTC midnight and year boundaries", () => {
  const dates = dashboardDates(new Date("2026-12-31T20:00:00Z"));
  assert.equal(dates.day, "2027-01-01");
  assert.equal(dates.fromDate, "2026-12-31T18:30:00.000Z");
  assert.equal(dates.toDate, "2027-01-01T18:29:59.999Z");
  assert.equal(dates.upcomingFrom, "2027-01-01T18:30:00.000Z");
  assert.equal(dates.upcomingTo, "2027-01-08T18:29:59.999Z");
  assert.equal(dashboardDateLabel("bad-date"), "Date unavailable");
});

test("personal follow-up queries keep the verified user ID when date or status filters change", () => {
  const filters = dashboardFollowUpFilters("sales-1", { status: "OVERDUE", limit: 6 });
  assert.equal(filters.assignedTo, "sales-1");
  assert.equal(filters.status, "OVERDUE");
  assert.equal(filters.limit, 6);
  assert.equal(dashboardFollowUpFilters("").assignedTo, "");
});

test("follow-up range pickers accept timestamp ranges from dashboards and date-only picker values", () => {
  const dates = dashboardDates(new Date("2026-10-25T10:00:00Z"));
  assert.equal(parseCalendarDate(dates.fromDate)?.toISOString(), dates.fromDate);
  assert.equal(parseCalendarDate(dates.toDate)?.toISOString(), dates.toDate);
  const date = parseCalendarDate("2026-10-25")!;
  assert.equal(date.getFullYear(), 2026);
  assert.equal(date.getMonth(), 9);
  assert.equal(date.getDate(), 25);
  assert.equal(parseCalendarDate("2026-02-30"), undefined);
  assert.equal(parseCalendarDate("invalid"), undefined);
  assert.equal(parseCalendarDate(""), undefined);
});

test("pipeline win rate uses closed opportunities and has no fake rate for an empty pipeline", () => {
  const summary = pipelineSummary([{ status: "NEW", count: 10 }, { status: "WON", count: 3 }, { status: "LOST", count: 1 }]);
  assert.deepEqual(summary, { total: 14, open: 10, won: 3, lost: 1, winRate: 75 });
  assert.equal(pipelineSummary([]).winRate, null);
  assert.equal(pipelineSummary([{ status: "NEW", count: 10 }]).winRate, null);
});

test("upcoming workload groups by stable assignee ID, excludes terminal work, and preserves unassigned work", () => {
  const make = (assignedToId: string | undefined, assignedToName: string, status = "SCHEDULED") => ({ assignedToId, assignedToName, status } as FollowUpItem);
  const items = [make("a", "Alex"), make("a", "Alex"), make("b", "Alex"), make(undefined, ""), make("b", "Alex", "COMPLETED"), make("b", "Alex", "CANCELLED")];
  assert.deepEqual(followUpWorkload(items), [{ id: "a", name: "Alex", count: 2 }, { id: "b", name: "Alex", count: 1 }, { id: "unassigned", name: "Unassigned", count: 1 }]);
});

test("subscription health excludes expired, invalid and future records and orders renewals by expiry", () => {
  const now = new Date("2026-10-25T10:00:00Z");
  const summary = subscriptionSummary([
    { id: "later", status: "ACTIVE", endDate: "2026-10-30T10:00:00Z" },
    { id: "soon", status: "ACTIVE", endDate: "2026-10-26T10:00:00Z" },
    { id: "lifetime", status: "ACTIVE" },
    { id: "expired", status: "ACTIVE", endDate: now.toISOString() },
    { id: "future", status: "ACTIVE", startDate: "2026-11-01T10:00:00Z" },
    { id: "invalid", status: "ACTIVE", endDate: "invalid" },
    { id: "pending", status: "PENDING" },
    { id: "cancelled", status: "CANCELLED", endDate: "2026-10-26T10:00:00Z" },
  ], now);
  assert.equal(summary.active, 3);
  assert.deepEqual(summary.expiring.map((item) => item.id), ["soon", "later"]);
  assert.deepEqual(summary.pending.map((item) => item.id), ["pending"]);
});
