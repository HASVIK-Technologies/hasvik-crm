"use client";

import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Cell, ReportColumn } from "@/lib/reports/definitions";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Row = Record<string, Cell>;

function compare(a: Cell | undefined, b: Cell | undefined) {
  const na = typeof a === "number" ? a : Number.parseFloat(String(a ?? ""));
  const nb = typeof b === "number" ? b : Number.parseFloat(String(b ?? ""));
  if (Number.isFinite(na) && Number.isFinite(nb) && String(a).trim() !== "" && String(b).trim() !== "") return na - nb;
  return String(a ?? "").localeCompare(String(b ?? ""), undefined, { numeric: true, sensitivity: "base" });
}

/**
 * Searchable, sortable table with a sticky header. It scrolls inside its card on phones, and reports the rows it is
 * showing (after search and sort) so an export matches the screen exactly.
 */
export default function ReportTable({ columns, rows, rowHref, onVisibleRows, caption }: {
  columns: ReportColumn[];
  rows: Row[];
  rowHref?: (row: Row) => string | undefined;
  onVisibleRows?: (rows: Row[]) => void;
  caption: string;
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = q ? rows.filter((row) => columns.some((c) => String(row[c.key] ?? "").toLowerCase().includes(q))) : rows;
    if (sort) {
      const sign = sort.dir === "asc" ? 1 : -1;
      list = [...list].sort((a, b) => sign * compare(a[sort.key], b[sort.key]));
    }
    return list;
  }, [rows, columns, query, sort]);

  useEffect(() => onVisibleRows?.(visible), [visible, onVisibleRows]);

  const toggle = (key: string) =>
    setSort((current) => (current?.key !== key ? { key, dir: "asc" } : current.dir === "asc" ? { key, dir: "desc" } : null));

  return (
    <div className="space-y-3">
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" aria-hidden />
        <Input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search this table…" aria-label="Search this table" className="pl-10" />
      </div>
      <div className="max-h-128 overflow-auto rounded-2xl border border-line">
        <table className="w-full min-w-136 text-left text-sm tabular">
          <caption className="sr-only">{caption}</caption>
          <thead className="sticky top-0 z-10 bg-surface-2">
            <tr>
              {columns.map((column) => {
                const active = sort?.key === column.key;
                const Icon = !active ? ArrowUpDown : sort.dir === "asc" ? ArrowUp : ArrowDown;
                return (
                  <th key={column.key} scope="col" aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"} className={cn("border-b border-line p-0 text-xs font-semibold tracking-wide whitespace-nowrap text-muted uppercase", column.numeric && "text-right")}>
                    <button type="button" onClick={() => toggle(column.key)} className={cn("flex min-h-11 w-full items-center gap-1.5 px-4 hover:text-ink", column.numeric && "justify-end")}>
                      {column.label}<Icon className={cn("size-3.5", active ? "text-brand-strong" : "opacity-50")} aria-hidden />
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr><td colSpan={columns.length} className="px-4 py-10 text-center text-muted">{rows.length ? "No rows match your search." : "There is nothing to show for these filters yet."}</td></tr>
            )}
            {visible.map((row, index) => {
              const href = rowHref?.(row);
              return (
                <tr key={index} className="border-b border-line last:border-0 hover:bg-surface-2/70">
                  {columns.map((column, i) => (
                    <td key={column.key} className={cn("px-4 py-3 text-ink", column.numeric && "text-right")}>
                      {i === 0 && href ? <Link href={href} className="font-semibold text-brand-strong hover:underline">{String(row[column.key])}</Link> : String(row[column.key] ?? "")}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted" aria-live="polite">{visible.length} of {rows.length} row{rows.length === 1 ? "" : "s"}</p>
    </div>
  );
}
