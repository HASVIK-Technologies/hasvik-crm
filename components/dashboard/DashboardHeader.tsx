import type { ReactNode } from "react";

export default function DashboardHeader({ title, description, viewSwitcher, actions }: {
  title: string;
  description: ReactNode;
  viewSwitcher?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-3 border-b border-line pb-3 sm:min-h-14 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="min-w-0">
        <h1 className="text-xl font-bold tracking-tight text-title sm:text-2xl">{title}</h1>
        <p className="mt-1 truncate text-xs text-muted sm:text-sm">{description}</p>
      </div>
      {(viewSwitcher || actions) && (
        <div className="flex flex-wrap items-center justify-between gap-2 sm:shrink-0 sm:justify-end">
          {viewSwitcher}
          {actions}
        </div>
      )}
    </header>
  );
}
