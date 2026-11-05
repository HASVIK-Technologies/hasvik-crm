"use client";

import { ChartNoAxesCombined, Table2 } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** Card with a compact chart/table switch for the same underlying data. */
export default function ChartFrame({ title, description, action, children, table }: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  table?: { columns: string[]; rows: (string | number)[][] };
}) {
  const [view, setView] = useState<"chart" | "table">("chart");

  return (
    <Card className="min-w-0 gap-3 rounded-none p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-base font-bold tracking-tight text-ink">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {action}
          {table && (
            <div role="group" aria-label={`${title} display`} className="inline-flex border border-line bg-surface-2 p-0.5">
              {([
                { value: "chart", label: "Chart", Icon: ChartNoAxesCombined },
                { value: "table", label: "Table", Icon: Table2 },
              ] as const).map(({ value, label, Icon }) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={view === value}
                  onClick={() => setView(value)}
                  className={cn(
                    "inline-flex min-h-8 items-center gap-1.5 px-2.5 text-xs font-semibold transition-colors",
                    view === value ? "bg-white text-brand-strong shadow-sm" : "text-ink-soft hover:text-ink",
                  )}
                >
                  <Icon className="size-3.5" aria-hidden />
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {!table || view === "chart" ? children : (
        table.rows.length ? (
          <div className="max-h-72 overflow-auto border-y border-line">
            <table className="w-full text-left text-sm tabular">
              <thead className="sticky top-0 bg-surface-2">
                <tr>{table.columns.map((column, index) => <th key={column} scope="col" className={cn("px-3 py-2 text-xs font-semibold text-ink-soft", index > 0 && "text-right")}>{column}</th>)}</tr>
              </thead>
              <tbody>
                {table.rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className={cn("border-t border-line", rowIndex % 2 === 1 && "bg-surface-2/60")}>
                    {row.map((cell, cellIndex) => <td key={cellIndex} className={cn("px-3 py-2 text-ink", cellIndex > 0 && "text-right")}>{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="py-8 text-center text-sm text-ink-soft">No data for this period.</p>
      )}
    </Card>
  );
}
