import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type KpiTone = "blue" | "cyan" | "green" | "amber" | "red" | "violet" | "slate";

export interface KpiItem {
  label: string;
  value: React.ReactNode;
  icon: LucideIcon;
  tone?: KpiTone;
}

const toneStyles: Record<KpiTone, string> = {
  blue: "bg-blue-50 text-brand-blue",
  cyan: "bg-cyan-50 text-cyan-700",
  green: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-rose-50 text-rose-700",
  violet: "bg-violet-50 text-violet-700",
  slate: "bg-slate-100 text-slate-600",
};

const brandStyles: Record<KpiTone, string> = {
  blue: "border-[#0870c9] bg-linear-to-br from-[#0870c9] to-[#0860ad]",
  green: "border-[#117a35] bg-linear-to-br from-[#117a35] to-[#0c6940]",
  cyan: "border-[#08758f] bg-linear-to-br from-[#08758f] to-[#07677e]",
  slate: "border-[#2563a1] bg-linear-to-br from-[#2563a1] to-[#1c528b]",
  violet: "border-[#0870c9] bg-linear-to-br from-[#0870c9] to-[#0860ad]",
  amber: "border-[#2563a1] bg-linear-to-br from-[#2563a1] to-[#1c528b]",
  red: "border-[#08758f] bg-linear-to-br from-[#08758f] to-[#07677e]",
};

const brandIconStyles: Record<KpiTone, string> = {
  blue: "text-blue-100", green: "text-emerald-100", cyan: "text-cyan-100",
  slate: "text-white", violet: "text-blue-100", amber: "text-amber-200", red: "text-rose-200",
};

const tintedStyles: Record<KpiTone, string> = {
  blue: "border-blue-200 border-l-blue-500 from-blue-50 to-white",
  cyan: "border-cyan-200 border-l-cyan-500 from-cyan-50 to-white",
  green: "border-emerald-200 border-l-emerald-500 from-emerald-50 to-white",
  amber: "border-amber-200 border-l-amber-500 from-amber-50 to-white",
  red: "border-rose-200 border-l-rose-500 from-rose-50 to-white",
  violet: "border-violet-200 border-l-violet-500 from-violet-50 to-white",
  slate: "border-slate-200 border-l-slate-400 from-slate-50 to-white",
};

const solidStyles: Record<KpiTone, string> = {
  blue: "border-[#0870c9] border-l-blue-300 bg-[#0870c9]",
  green: "border-[#117a35] border-l-emerald-300 bg-[#117a35]",
  cyan: "border-[#08758f] border-l-cyan-300 bg-[#08758f]",
  slate: "border-[#2563a1] border-l-slate-300 bg-[#2563a1]",
  red: "border-rose-700 border-l-rose-300 bg-rose-700",
  amber: "border-amber-800 border-l-amber-300 bg-amber-800",
  violet: "border-violet-700 border-l-violet-300 bg-violet-700",
};

export default function KpiCards({
  items,
  loading = false,
  className,
  variant = "default",
}: {
  items: KpiItem[];
  loading?: boolean;
  className?: string;
  variant?: "default" | "brand" | "tinted" | "solid";
}) {
  const branded = variant === "brand" || variant === "solid";
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
          className={cn(
            "relative isolate flex min-h-20 items-center gap-2.5 overflow-hidden border px-3 py-3 sm:gap-4 sm:px-5 sm:py-4",
            variant === "solid"
              ? cn("border-l-4 text-white shadow-[0_2px_8px_rgba(15,38,61,0.1)] [&_[aria-label=Loading]]:bg-white/20", solidStyles[tone])
              : branded
              ? cn("min-h-28 rounded-none text-white shadow-[0_4px_14px_rgba(15,38,61,0.12)] sm:min-h-32 [&_[aria-label=Loading]]:bg-white/20", brandStyles[tone])
              : variant === "tinted"
                ? cn("border-l-[3px] bg-linear-to-r shadow-[0_1px_2px_rgba(15,23,42,0.035)]", tintedStyles[tone])
                : "border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.035)]",
          )}
        >
          {variant === "brand" && <span aria-hidden="true" className="pointer-events-none absolute -right-9 -top-12 -z-10 size-36 rounded-full border border-white/5 bg-white/3" />}
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center sm:size-11",
              branded ? cn("bg-white/10 ring-1 ring-inset ring-white/15", brandIconStyles[tone]) : toneStyles[tone],
            )}
          >
            <Icon className="size-5" strokeWidth={1.9} />
          </span>
          <span className="min-w-0">
            {loading ? (
              <span className={cn("mb-1.5 block h-7 w-14 animate-pulse", branded ? "bg-white/20" : "bg-slate-100")} />
            ) : (
              <span className={cn("block text-xl font-bold tracking-tight sm:text-2xl", branded ? "text-white" : "text-slate-900", variant === "brand" && "sm:text-3xl")}>
                {value}
              </span>
            )}
            <span className={cn("mt-0.5 block text-[10px] font-medium leading-tight sm:text-xs", branded ? "text-white" : "text-slate-500")}>
              {label}
            </span>
          </span>
        </article>
      ))}
    </section>
  );
}
