import Link from "next/link";
import { cn } from "@/lib/utils";

export default function DashboardViewSwitcher({ activeView }: { activeView: "platform" | "admin" }) {
  return (
    <nav aria-label="Dashboard views" className="inline-flex w-fit gap-0.5 rounded-lg border border-line bg-surface-2 p-0.5">
      {(["platform", "admin"] as const).map((view) => (
        <Link
          key={view}
          href={`/dashboard?view=${view}`}
          aria-current={activeView === view ? "page" : undefined}
          className={cn(
            "inline-flex min-h-7 items-center justify-center rounded-md px-2.5 text-[11px] font-semibold transition-colors sm:min-h-8 sm:px-3 sm:text-xs",
            activeView === view ? "bg-surface text-brand-strong shadow-card" : "text-ink-soft hover:bg-surface hover:text-ink",
          )}
        >
          {view === "platform" ? "Platform" : "Admin"}
        </Link>
      ))}
    </nav>
  );
}
