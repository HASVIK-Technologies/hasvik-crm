import { Table2 } from "lucide-react";
import { Card } from "@/components/ui/card";

/** Card around a chart with a built-in text alternative: the same numbers as a table. */
export default function ChartFrame({ title, description, action, children, table }: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  table?: { columns: string[]; rows: (string | number)[][] };
}) {
  return (
    <Card className="min-w-0 gap-4 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-base font-bold tracking-tight text-ink">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
        </div>
        {action}
      </div>
      {children}
      {table && (
        <details className="group rounded-xl border border-line bg-surface-2">
          <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 px-3 text-sm font-semibold text-ink-soft">
            <Table2 className="size-4" aria-hidden /> View as table
          </summary>
          <div className="overflow-x-auto px-3 pb-3">
            <table className="w-full text-left text-sm tabular">
              <thead>
                <tr>{table.columns.map((c) => <th key={c} scope="col" className="py-2 pr-4 text-xs font-semibold text-muted uppercase">{c}</th>)}</tr>
              </thead>
              <tbody>
                {table.rows.map((row, i) => (
                  <tr key={i} className="border-t border-line">{row.map((cell, j) => <td key={j} className="py-2 pr-4 text-ink">{cell}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </Card>
  );
}
