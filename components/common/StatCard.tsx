import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Minus, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type StatTone = "default" | "ok" | "warn" | "bad" | "brand";

const TONE_ICON: Record<StatTone, string> = {
  default: "bg-surface-2 text-ink-soft", ok: "bg-ok-soft text-ok", warn: "bg-warn-soft text-warn",
  bad: "bg-bad-soft text-bad", brand: "bg-brand-soft text-brand-strong",
};
const TONE_TEXT: Record<StatTone, string> = { default: "text-ink", ok: "text-ok", warn: "text-warn", bad: "text-bad", brand: "text-brand-strong" };

export interface StatDelta {
  /** Percentage change against the previous period, or null when it cannot be computed. */
  percent: number | null;
  /** Wording that goes with the number, e.g. "vs previous 7 days". */
  label: string;
  /** True when an increase is bad news (e.g. overdue follow-ups). */
  invert?: boolean;
}

export interface StatCardProps {
  label: string;
  value: React.ReactNode;
  hint?: string;
  tone?: StatTone;
  icon?: LucideIcon;
  /** Navigate to a filtered screen. Ignored when the count is 0. */
  href?: string;
  /** Toggle a filter on the same page. Ignored when the count is 0. */
  onClick?: () => void;
  active?: boolean;
  delta?: StatDelta;
  loading?: boolean;
  /** Raw count behind `value`; 0 renders the card plain (not clickable). */
  count?: number;
}

function Delta({ delta }: { delta: StatDelta }) {
  if (delta.percent === null) return <p className="mt-1.5 text-xs text-muted">{delta.label}: no earlier data</p>;
  const up = delta.percent > 0;
  const flat = delta.percent === 0;
  const good = flat ? null : up !== Boolean(delta.invert);
  const Icon = flat ? Minus : up ? ArrowUpRight : ArrowDownRight;
  return (
    <p className={cn("mt-1.5 flex flex-wrap items-center gap-1 text-xs tabular", flat ? "text-muted" : good ? "text-ok" : "text-bad")}>
      <Icon className="size-3.5 shrink-0" aria-hidden />
      <span className="font-semibold">{flat ? "No change" : `${up ? "Up" : "Down"} ${Math.abs(delta.percent)}%`}</span>
      <span className="text-muted">{delta.label}</span>
    </p>
  );
}

/** KPI card. A tap target when it has an href/onClick and a non-zero count; plain otherwise. */
export default function StatCard({ label, value, hint, tone = "default", icon: Icon, href, onClick, active, delta, loading, count }: StatCardProps) {
  const numeric = count ?? (typeof value === "number" ? value : Number(value));
  const interactive = Boolean(href || onClick) && !(Number.isFinite(numeric) && numeric === 0) && !loading;
  const body = (
    <div
      className={cn(
        "h-full min-w-0 rounded-2xl border border-line bg-surface p-4 shadow-card transition-all",
        interactive && "duration-150 hover:-translate-y-1 hover:border-brand hover:bg-brand-soft/40 hover:shadow-pop group-active:translate-y-0 group-active:scale-[0.98]",
        active && "border-brand ring-2 ring-brand/30",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold tracking-wide text-muted uppercase">{label}</p>
        {Icon && <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg", TONE_ICON[tone])}><Icon className="size-4" aria-hidden /></span>}
      </div>
      {loading ? (
        <div aria-hidden className="skeleton mt-3 h-8 w-20" />
      ) : (
        <p className={cn("mt-2 text-[clamp(1.4rem,1.8vw,1.9rem)] leading-tight font-bold tabular wrap-anywhere", TONE_TEXT[tone])}>{value}</p>
      )}
      {!loading && hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
      {!loading && delta && <Delta delta={delta} />}
    </div>
  );
  const aria = `${label}: ${value}.${interactive ? (onClick ? " Tap to filter" : " Tap to view") : ""}`;
  const ring = "group block h-full w-full rounded-2xl text-left outline-none focus-visible:ring-4 focus-visible:ring-(--ring)";
  if (interactive && href) return <Link href={href} aria-label={aria} className={ring}>{body}</Link>;
  if (interactive && onClick) return <button type="button" onClick={onClick} aria-pressed={!!active} aria-label={aria} className={ring}>{body}</button>;
  return <div className="h-full">{body}</div>;
}
