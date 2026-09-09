"use client";

import PageContainer from "./PageContainer";

interface LayoutProps {
  breadcrumb?: React.ReactNode;
  filters?: React.ReactNode;
  stats?: React.ReactNode;
  showFilters?: boolean;
  showStats?: boolean;
  actions?: React.ReactNode;
  content?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export default function ListPageLayout({
  breadcrumb,
  filters,
  stats,
  showFilters = true,
  showStats = true,
  actions,
  content,
  footer,
  className,
}: LayoutProps) {
  return (
    <PageContainer className={`flex flex-col gap-6 ${className ?? ""}`}>
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {breadcrumb}
        {actions && <div className="shrink-0">{actions}</div>}
      </section>
      {showFilters && filters && <div className="grow">{filters}</div>}
      {showStats && stats && <section className="shrink-0">{stats}</section>}
      {content && (
        <section className="layout-content min-w-0">{content}</section>
      )}
      {footer && <section className="shrink-0">{footer}</section>}
    </PageContainer>
  );
}
