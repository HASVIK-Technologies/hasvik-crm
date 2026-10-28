import type { LucideIcon } from "lucide-react";
import StatCard, { type StatDelta, type StatTone } from "@/components/common/StatCard";
import { cn } from "@/lib/utils";

export type KpiTone = "blue" | "cyan" | "green" | "amber" | "red" | "violet" | "slate";

export interface KpiItem {
  label: string;
  value: React.ReactNode;
  icon: LucideIcon;
  tone?: KpiTone;
  hint?: string;
  /** Opens a screen already filtered to what the number counts. */
  href?: string;
  onClick?: () => void;
  active?: boolean;
  delta?: StatDelta;
  count?: number;
}

const TONES: Record<KpiTone, StatTone> = { blue: "brand", cyan: "brand", violet: "brand", green: "ok", amber: "warn", red: "bad", slate: "default" };

/** Row of KPI cards: 2 columns on phones, auto-fit from tablet up. `variant` is kept for existing callers. */
export default function KpiCards({ items, loading = false, className }: {
  items: KpiItem[];
  loading?: boolean;
  className?: string;
  variant?: "default" | "brand" | "tinted" | "solid";
}) {
  return (
    <section aria-label="Key performance indicators" className={cn("stagger grid grid-cols-2 gap-3 xl:grid-cols-[repeat(auto-fit,minmax(200px,1fr))]", className)}>
      {items.map(({ tone = "blue", ...item }) => (
        <StatCard key={item.label} {...item} tone={TONES[tone]} loading={loading} />
      ))}
    </section>
  );
}
