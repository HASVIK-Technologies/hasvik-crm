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
    <PageContainer className="space-y-4 px-1 sm:space-y-5 sm:px-2 lg:space-y-6">
      <section className="flex flex-row items-center justify-between gap-4">
        {breadcrumb}
        {actions && <div className="shrink-0">{actions}</div>}
      </section>
      {content}
    </PageContainer>
  );
}
