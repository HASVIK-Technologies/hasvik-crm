import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** Titled dashboard card with an optional "view all" link and consistent loading / empty / error states. */
export default function DashboardSection({ title, description, href, linkLabel = "View all", loading, error, onRetry, className, children }: {
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className={cn("min-w-0 gap-3 p-4 sm:p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-bold tracking-tight text-ink">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
        </div>
        {href && (
          <Link href={href} className="inline-flex min-h-11 shrink-0 items-center gap-1 text-sm font-semibold text-brand-strong hover:underline sm:min-h-9">
            {linkLabel}<ArrowRight className="size-4" aria-hidden />
          </Link>
        )}
      </div>
      {loading ? (
        <div role="status" aria-label={`Loading ${title}`} className="space-y-3 py-1">
          {[0, 1, 2].map((i) => <div key={i} className="skeleton h-12" />)}
        </div>
      ) : error ? (
        <div role="alert" className="flex flex-wrap items-center gap-3 rounded-xl bg-warn-soft p-4 text-sm text-warn">
          <span className="flex-1">We couldn&apos;t load this section. Check your connection and try again.</span>
          {onRetry && <button type="button" onClick={onRetry} className="min-h-11 px-2 font-semibold underline underline-offset-4">Try again</button>}
        </div>
      ) : (
        children
      )}
    </Card>
  );
}

export function SectionEmpty({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="rounded-xl bg-surface-2 px-4 py-6 text-center">
      <p className="text-sm font-semibold text-ink">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted">{hint}</p>
    </div>
  );
}
