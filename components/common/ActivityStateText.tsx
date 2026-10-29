import { cn } from "@/lib/utils";

export function ActivityStateText({ active, className }: { active: boolean; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold", active ? "text-ok" : "text-muted", className)}>
      <span aria-hidden="true" className={cn("size-1.5 rounded-full", active ? "bg-ok" : "bg-muted")} />
      {active ? "Active" : "Inactive"}
    </span>
  );
}
