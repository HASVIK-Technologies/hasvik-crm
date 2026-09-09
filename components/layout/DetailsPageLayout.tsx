import PageContainer from "./PageContainer";

interface DetailsPageLayoutProps {
  content: React.ReactNode;
  breadcrumb: React.ReactNode;
  actions?: React.ReactNode;
}

export default function DetailsPageLayout({
  content,
  breadcrumb,
  actions,
}: DetailsPageLayoutProps) {
  return (
    <PageContainer className="flex flex-col gap-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {breadcrumb}
        {actions && <div className="shrink-0">{actions}</div>}
      </section>
      {content}
    </PageContainer>
  );
}
