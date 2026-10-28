import PageContainer from "./PageContainer";
import ScrollToTopOnRoute from "@/components/common/ScrollToTopOnRoute";
import BackButton from "@/components/common/BackButton";

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
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="hidden sm:block">{breadcrumb}</div>
        <div className="flex items-center justify-between gap-3 sm:contents">
          <BackButton className="sm:hidden" />
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      </section>
      {content}
    </PageContainer>
  );
}
