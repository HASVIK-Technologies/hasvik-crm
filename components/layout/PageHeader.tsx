import { cn } from "@/lib/utils";

/**
 * Header block for a page. The top bar already shows the page title, so the title here is kept for screen readers and
 * the visible part is the one-line description plus the page actions. That way no title is ever shown twice.
 */
export default function PageHeader({ title, description, badge, actions, className }: {
  title: string;
  description?: React.ReactNode;
  /** Small status chip next to the description, e.g. "Estimate". */
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("fade-up flex flex-wrap items-start justify-between gap-3", className)}>
      <h1 className="sr-only">{title}</h1>
      {(description || badge) && (
        <div className="flex min-w-0 max-w-2xl flex-wrap items-center gap-2">
          {badge}
          {description && <p className="text-sm leading-relaxed text-muted">{description}</p>}
        </div>
      )}
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
