import { test } from "node:test";
import assert from "node:assert/strict";
import { strFromU8, unzipSync } from "fflate";
import { buildReport, REPORTS, scopeLeads } from "../lib/reports/definitions.ts";
import { toCsv, toXlsx } from "../lib/reports/export.ts";
import { resolveRange } from "../lib/analytics/ranges.ts";
import { createdIn, winLoss } from "../lib/analytics/metrics.ts";
import type { LeadRecord } from "../lib/analytics/types.ts";

const NOW = new Date("2026-10-28T05:30:00Z");
const range = resolveRange("30d", NOW);

function lead(id: string, status: string, extra: Partial<LeadRecord> = {}): LeadRecord {
  return { id, name: `Lead ${id}`, status, isActive: true, ownerId: "u1", ownerName: "Asha", source: "WHATSAPP", city: "", category: "", createdAt: "2026-10-10T00:00:00Z", updatedAt: "2026-10-12T00:00:00Z", ...extra };
}

const leads = [
  lead("1", "NEW"), lead("2", "NEW", { ownerId: "u2", ownerName: "Ravi", source: "Referral" }), lead("3", "WON"), lead("4", "LOST"),
  lead("5", "CONTACTED", { ownerId: "", ownerName: "", source: "" }), lead("6", "WON", { isActive: false }),
];
const ctx = { leads, activities: [], range, filters: {}, now: NOW };

test("every report builds from the same data without throwing, with consistent column keys", () => {
  for (const meta of REPORTS) {
    const result = buildReport(meta.slug, ctx);
    assert.ok(result.kpis.length >= 3, meta.slug);
    for (const row of result.rows) for (const column of result.columns) assert.ok(column.key in row, `${meta.slug}: row missing ${column.key}`);
  }
});

test("pipeline report totals equal the dashboard pipeline and ignore inactive leads", () => {
  const result = buildReport("pipeline-by-stage", ctx);
  assert.equal(result.kpis[0].value, 5);
  assert.equal(result.rows.reduce((sum, row) => sum + Number(row.leads), 0), 5);
  assert.equal(result.kpis[0].value, scopeLeads(leads, {}).length);
});

test("owner filter narrows every figure and unassigned is its own choice", () => {
  assert.equal(buildReport("pipeline-by-stage", { ...ctx, filters: { owner: "u2" } }).kpis[0].value, 1);
  assert.equal(buildReport("pipeline-by-stage", { ...ctx, filters: { owner: "none" } }).kpis[0].value, 1);
  assert.equal(buildReport("sales-by-source", { ...ctx, filters: { source: "Not recorded" } }).kpis[0].value, 1);
});

test("win/loss report agrees with the closed leads in the period and with the win-rate helper", () => {
  const result = buildReport("win-loss", ctx);
  assert.equal(result.kpis[0].value, 1);
  assert.equal(result.kpis[1].value, 1);
  assert.equal(result.kpis[2].value, "50%");
  assert.equal(winLoss(leads).winRate, 50);
});

test("new-leads report total equals the dashboard new-leads count for the same range", () => {
  const result = buildReport("new-leads", ctx);
  assert.equal(result.kpis[0].value, createdIn(scopeLeads(leads, {}), range.from, range.to).length);
  assert.equal(result.rows.reduce((sum, row) => sum + Number(row.leads), 0), result.kpis[0].value);
});

test("empty data still builds every report", () => {
  for (const meta of REPORTS) assert.doesNotThrow(() => buildReport(meta.slug, { ...ctx, leads: [] }));
});

test("CSV escapes quotes, commas, newlines and neutralises formulas", () => {
  const csv = toCsv({
    title: "T",
    context: ["Report: Test", "Range: Last 30 days"],
    columns: [{ key: "a", label: "Name" }, { key: "b", label: "Note, with comma" }],
    rows: [{ a: 'He said "hi"', b: "line1\nline2" }, { a: "=SUM(A1)", b: 5 }],
  });
  assert.ok(csv.startsWith("﻿"));
  const lines = csv.slice(1).split("\r\n");
  assert.equal(lines[0], "Report: Test");
  assert.equal(lines[3], 'Name,"Note, with comma"');
  assert.match(csv, /"He said ""hi""","line1\nline2"/);
  assert.match(csv, /'=SUM\(A1\),5/);
});

test("XLSX is a valid zip with the workbook parts and the exact rows, numbers kept numeric", () => {
  const bytes = toXlsx({
    title: "Sales: by owner / 2026",
    context: ["Report: Sales by owner"],
    columns: [{ key: "owner", label: "Owner" }, { key: "won", label: "Won" }],
    rows: [{ owner: "A & B <Co>", won: 3 }],
  });
  const files = unzipSync(bytes);
  assert.deepEqual(Object.keys(files).sort(), ["[Content_Types].xml", "_rels/.rels", "xl/_rels/workbook.xml.rels", "xl/workbook.xml", "xl/worksheets/sheet1.xml"]);
  const sheet = strFromU8(files["xl/worksheets/sheet1.xml"]);
  assert.match(sheet, /A &amp; B &lt;Co&gt;/);
  assert.match(sheet, /<c r="B4"><v>3<\/v><\/c>/);
  assert.match(strFromU8(files["xl/workbook.xml"]), /name="Sales  by owner   2026"/);
});
