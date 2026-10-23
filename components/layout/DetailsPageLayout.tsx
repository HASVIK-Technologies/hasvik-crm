import PageContainer from "./PageContainer";
import ScrollToTopOnRoute from "@/components/common/ScrollToTopOnRoute";

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
      <ScrollToTopOnRoute />
      <section className="flex gap-4 flex-row items-center justify-between">
        {breadcrumb}
        {actions && <div className="shrink-0">{actions}</div>}
      </section>
      {content}
    </PageContainer>
  );
}
