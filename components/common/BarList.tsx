import Link from "next/link";
import { cn } from "@/lib/utils";

export type BarTone = "brand-strong" | "brand" | "accent" | "growth" | "muted" | "warn" | "bad";

const FILL: Record<BarTone, string> = {
  "brand-strong": "bg-brand-strong", brand: "bg-brand", accent: "bg-accent", growth: "bg-growth", muted: "bg-muted", warn: "bg-warn", bad: "bg-bad",
};

export interface BarRow {
  key: string;
  label: string;
  value: number;
  /** Shown instead of the raw value, e.g. "12 · 40%". */
  valueLabel?: string;
  tone?: BarTone;
  /** Makes the whole row a link to the underlying records. */
  href?: string;
}

/**
 * Horizontal bars as plain HTML: readable by screen readers, tappable on phones, no layout shift.
 * Doubles as its own text alternative because every row prints its label and value.
 */
export default function BarList({ rows, max, className, ariaLabel }: { rows: BarRow[]; max?: number; className?: string; ariaLabel: string }) {
  const top = max ?? Math.max(1, ...rows.map((row) => row.value));
  return (
    <ul aria-label={ariaLabel} className={cn("space-y-2", className)}>
      {rows.map((row) => {
        const width = Math.max(row.value > 0 ? 3 : 0, Math.round((row.value / top) * 100));
        const inner = (
          <>
            <span className="flex items-baseline justify-between gap-3 text-sm">
              <span className="min-w-0 truncate font-medium text-ink">{row.label}</span>
              <span className="shrink-0 font-semibold text-ink-soft tabular">{row.valueLabel ?? row.value}</span>
            </span>
            <span className="mt-1.5 block h-2.5 overflow-hidden rounded-tag bg-surface-2 ring-1 ring-line ring-inset">
              <span className={cn("block h-full rounded-tag transition-[width] duration-500", FILL[row.tone ?? "brand-strong"])} style={{ width: `${width}%` }} />
            </span>
          </>
        );
        return (
          <li key={row.key}>
            {row.href && row.value > 0 ? (
              <Link href={row.href} className="-mx-2 block min-h-11 rounded-xl px-2 py-1.5 transition-colors hover:bg-surface-2">{inner}</Link>
            ) : (
              <div className="-mx-2 block px-2 py-1.5">{inner}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
