import { cn } from "@/lib/utils";

export function ActivityStateText({ active, className }: { active: boolean; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold", active ? "text-emerald-700" : "text-slate-500", className)}>
      <span aria-hidden="true" className={cn("size-1.5 rounded-full", active ? "bg-emerald-500" : "bg-slate-400")} />
      {active ? "Active" : "Inactive"}
    </span>
  );
}
