import type { LucideIcon } from "lucide-react";
import StatCard, { type StatDelta, type StatTone } from "@/components/common/StatCard";
import { cn } from "@/lib/utils";

export type KpiTone = "blue" | "cyan" | "green" | "amber" | "red" | "violet" | "slate";

export interface KpiItem {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
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

/** Responsive KPI grid. `variant="solid"` fills each card with its tone colour. */
export default function KpiCards({ items, loading = false, className, variant = "default" }: {
  items: KpiItem[];
  loading?: boolean;
  className?: string;
  variant?: "default" | "brand" | "tinted" | "solid";
}) {
  return (
    <section aria-label="Key performance indicators" className={cn("stagger grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[repeat(auto-fit,minmax(165px,1fr))]", className)}>
      {items.map(({ tone = "blue", ...item }) => (
        <div key={item.label} className="min-w-0">
          <StatCard {...item} tone={TONES[tone]} loading={loading} solid={variant === "solid"} />
        </div>
      ))}
    </section>
  );
}
