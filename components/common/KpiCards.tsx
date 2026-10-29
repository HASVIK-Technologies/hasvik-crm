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

/** Row of KPI cards: 2 columns on phones, auto-fit from tablet up. `variant` is kept for existing callers. */
export default function KpiCards({ items, loading = false, className }: {
  items: KpiItem[];
  loading?: boolean;
  className?: string;
  variant?: "default" | "brand" | "tinted" | "solid";
}) {
  return (
    <section aria-label="Key performance indicators" className={cn("stagger -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 xl:grid-cols-[repeat(auto-fit,minmax(165px,1fr))] [&::-webkit-scrollbar]:hidden", className)}>
      {items.map(({ tone = "blue", ...item }) => (
        <div key={item.label} className="w-[calc(50%-0.375rem)] min-w-40 shrink-0 snap-start sm:w-auto sm:min-w-0">
          <StatCard {...item} tone={TONES[tone]} loading={loading} />
        </div>
      ))}
    </section>
  );
}
