import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type KpiTone = "blue" | "green" | "amber" | "red" | "violet" | "slate";

export interface KpiItem {
  label: string;
  value: React.ReactNode;
  icon: LucideIcon;
  tone?: KpiTone;
}

const toneStyles: Record<KpiTone, string> = {
  blue: "bg-blue-50 text-brand-blue",
  green: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-rose-50 text-rose-700",
  violet: "bg-violet-50 text-violet-700",
  slate: "bg-slate-100 text-slate-600",
};

export default function KpiCards({
  items,
  loading = false,
  className,
}: {
  items: KpiItem[];
  loading?: boolean;
  className?: string;
}) {
  return (
    <section
      aria-label="Key performance indicators"
      className={cn(
        "grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-[repeat(auto-fit,minmax(210px,1fr))]",
        className,
      )}
    >
      {items.map(({ label, value, icon: Icon, tone = "blue" }) => (
        <article
          key={label}
          className="flex min-h-20 items-center gap-2.5 border border-slate-200 bg-white px-3 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.035)] sm:gap-4 sm:px-5 sm:py-4"
        >
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center sm:size-11",
              toneStyles[tone],
            )}
          >
            <Icon className="size-5" strokeWidth={1.9} />
          </span>
          <span className="min-w-0">
            {loading ? (
              <span className="mb-1.5 block h-7 w-14 animate-pulse bg-slate-100" />
            ) : (
              <span className="block text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                {value}
              </span>
            )}
            <span className="mt-0.5 block text-[10px] font-medium leading-tight text-slate-500 sm:text-xs">
              {label}
            </span>
          </span>
        </article>
      ))}
    </section>
  );
}
