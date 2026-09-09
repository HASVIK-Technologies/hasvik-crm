import PageContainer from "./PageContainer";

interface LayoutProps {
  toolbar?: React.ReactNode;
  filters?: React.ReactNode;
  stats?: React.ReactNode;
  actions?: React.ReactNode;
  content?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export default function ListPageLayout({
  toolbar,
  filters,
  stats,
  actions,
  content,
  footer,
  className,
}: LayoutProps) {
  return (
    <PageContainer
      className={`flex max-w-400 flex-col gap-4 px-1 sm:gap-5 sm:px-2 lg:gap-6 ${className ?? ""}`}
    >
      {toolbar && <section className="shrink-0">{toolbar}</section>}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {filters && <div className="grow">{filters}</div>}
        {actions && <div className="shrink-0">{actions}</div>}
      </section>
      {stats && <section className="shrink-0">{stats}</section>}
      {content && (
        <section className="layout-content min-w-0">{content}</section>
      )}
      {footer && <section className="shrink-0">{footer}</section>}
    </PageContainer>
  );
}
