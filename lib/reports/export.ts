import { strToU8, zipSync } from "fflate";

export type ExportCell = string | number;

export interface ExportTable {
  title: string;
  columns: { key: string; label: string }[];
  rows: Record<string, ExportCell>[];
  /** Lines written above the table: report name, date range, active filters. */
  context?: string[];
}

function csvCell(value: ExportCell): string {
  let text = String(value);
  // Spreadsheet apps run cells that start with these characters as formulas; prefix them so they stay text.
  if (typeof value === "string" && /^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** RFC 4180 CSV with a UTF-8 byte-order mark so Excel opens it with the right encoding. */
export function toCsv(table: ExportTable): string {
  const lines: string[] = [];
  for (const line of table.context ?? []) lines.push(csvCell(line));
  if (table.context?.length) lines.push("");
  lines.push(table.columns.map((c) => csvCell(c.label)).join(","));
  for (const row of table.rows) lines.push(table.columns.map((c) => csvCell(row[c.key] ?? "")).join(","));
  return `﻿${lines.join("\r\n")}\r\n`;
}

const xml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
// XML 1.0 cannot carry most control characters.
const clean = (value: string) => value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");

function columnName(index: number): string {
  let name = "";
  for (let n = index + 1; n > 0; n = Math.floor((n - 1) / 26)) name = String.fromCharCode(65 + ((n - 1) % 26)) + name;
  return name;
}

function cellXml(ref: string, value: ExportCell): string {
  if (typeof value === "number" && Number.isFinite(value)) return `<c r="${ref}"><v>${value}</v></c>`;
  return `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${xml(clean(String(value)))}</t></is></c>`;
}

/** A real .xlsx workbook (zip of OOXML parts), built without any spreadsheet library. */
export function toXlsx(table: ExportTable): Uint8Array {
  const lines: ExportCell[][] = [];
  for (const line of table.context ?? []) lines.push([line]);
  if (table.context?.length) lines.push([]);
  lines.push(table.columns.map((c) => c.label));
  for (const row of table.rows) lines.push(table.columns.map((c) => row[c.key] ?? ""));

  const sheetRows = lines
    .map((cells, r) => `<row r="${r + 1}">${cells.map((value, c) => cellXml(`${columnName(c)}${r + 1}`, value)).join("")}</row>`)
    .join("");
  const sheetName = clean(table.title).replace(/[\\/?*[\]:]/g, " ").slice(0, 31) || "Report";

  const files = {
    "[Content_Types].xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>`,
    "_rels/.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
    "xl/workbook.xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${xml(sheetName)}" sheetId="1" r:id="rId1"/></sheets></workbook>`,
    "xl/_rels/workbook.xml.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>`,
    "xl/worksheets/sheet1.xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${sheetRows}</sheetData></worksheet>`,
  };
  return zipSync(Object.fromEntries(Object.entries(files).map(([name, content]) => [name, strToU8(content)])));
}

export function exportFileName(slug: string, extension: "csv" | "xlsx", day: string): string {
  return `hasvik-${slug}-${day}.${extension}`;
}
