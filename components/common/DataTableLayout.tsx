import type { HTMLAttributes, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function DataTableShell({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={cn(
        "overflow-hidden border border-line bg-surface shadow-card",
        className,
      )}
      {...props}
    />
  );
}

export function DataTableHeader({
  title,
  total,
  description,
  actions,
  className,
}: {
  title: string;
  total?: number;
  description?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-h-17 flex-col gap-3 border-b border-surface-2 p-3 sm:flex-row sm:items-center sm:justify-between md:p-4", className)}>
      <div className="min-w-0">
        <h2 className="truncate text-lg font-bold tracking-tight text-ink">
          {title}{total !== undefined && <span className="font-medium text-muted"> ({total})</span>}
        </h2>
        {description && <p className="mt-1 text-xs text-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2.5">{actions}</div>}
    </div>
  );
}

export function DataTableMobileList({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div data-layout-mobile className={cn("flex flex-col gap-3 p-3 md:p-4", className)} {...props} />;
}

export function DataTableMobileCard({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <article
      className={cn(
        "border border-line bg-surface p-3 shadow-card transition-all duration-500 sm:p-4",
        className,
      )}
      {...props}
    />
  );
}

export function DataTableLoading({ label = "Loading records…" }: { label?: string }) {
  return (
    <div className="flex min-h-44 items-center justify-center px-4 text-sm text-muted">
      <LoaderCircle className="size-5 animate-spin text-brand-strong" />
      <span className="ml-2">{label}</span>
    </div>
  );
}

export function DataTableEmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-14 text-center">
      <span className="flex size-12 items-center justify-center bg-surface-2 text-muted">
        <Icon className="size-6" />
      </span>
      <p className="mt-3 text-sm font-semibold text-ink">{title}</p>
      <p className="mt-1 max-w-sm text-xs leading-5 text-muted">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
