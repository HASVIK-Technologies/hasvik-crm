import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/** Labelled native select: the best picker on phones, fully keyboard and screen-reader friendly. */
export default function FilterSelect({ label, value, onChange, options, className }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <label className={cn("block min-w-0 text-xs font-semibold text-muted", className)}>
      {label}
      <span className="relative mt-1 block">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-full appearance-none rounded-xl border border-line bg-surface pr-9 pl-3.5 text-base font-normal text-ink shadow-card transition-colors outline-none hover:border-muted focus-visible:border-brand focus-visible:ring-4 focus-visible:ring-(--ring) sm:h-10 sm:text-sm"
        >
          {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted" aria-hidden />
      </span>
    </label>
  );
}
