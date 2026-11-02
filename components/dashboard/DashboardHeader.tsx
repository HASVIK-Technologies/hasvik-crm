import type { ReactNode } from "react";

export default function DashboardHeader({ title, description, viewSwitcher }: {
  title: string;
  description: ReactNode;
  viewSwitcher?: ReactNode;
}) {
  return (
    <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 border-b border-line pb-2 sm:flex sm:min-h-14 sm:justify-between sm:gap-3 sm:pb-3">
      <h1 className="col-span-2 min-w-0 text-xl font-bold tracking-tight text-title sm:text-2xl">{title}</h1>
      <p className="min-w-0 truncate text-xs text-muted sm:mt-0.5 sm:text-sm">{description}</p>
      {viewSwitcher && <div className="col-start-2 row-start-2 flex shrink-0 items-center sm:justify-end">{viewSwitcher}</div>}
    </header>
  );
}
