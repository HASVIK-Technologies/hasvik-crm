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
        "grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[repeat(auto-fit,minmax(210px,1fr))]",
        className,
      )}
    >
      {items.map(({ label, value, icon: Icon, tone = "blue" }) => (
        <article
          key={label}
          className="flex min-h-20 items-center gap-4 border border-slate-200 bg-white px-5 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.035)]"
        >
          <span
            className={cn(
              "flex size-11 shrink-0 items-center justify-center",
              toneStyles[tone],
            )}
          >
            <Icon className="size-5" strokeWidth={1.9} />
          </span>
          <span className="min-w-0">
            {loading ? (
              <span className="mb-1.5 block h-7 w-14 animate-pulse bg-slate-100" />
            ) : (
              <span className="block text-2xl font-bold tracking-tight text-slate-900">
                {value}
              </span>
            )}
            <span className="mt-0.5 block truncate text-xs font-medium text-slate-500">
              {label}
            </span>
          </span>
        </article>
      ))}
    </section>
  );
}
