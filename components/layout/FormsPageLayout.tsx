import PageContainer from "./PageContainer";
import ScrollToTopOnRoute from "@/components/common/ScrollToTopOnRoute";
import BackButton from "@/components/common/BackButton";

interface FormsPageLayoutProps {
  content: React.ReactNode;
  breadcrumb?: React.ReactNode;
}

export default function FormsPageLayout({
  content,
  breadcrumb,
}: FormsPageLayoutProps) {
  return (
    <PageContainer className="flex flex-col gap-6">
      <ScrollToTopOnRoute />
      <div className="hidden sm:block">{breadcrumb}</div>
      <BackButton className="self-start sm:hidden" />
      {content}
    </PageContainer>
  );
}
