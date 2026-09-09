import PageContainer from "./PageContainer";

interface FormsPageLayoutProps {
  content: React.ReactNode;
  breadcrumb?: React.ReactNode;
}

export default function FormsPageLayout({
  content,
  breadcrumb,
}: FormsPageLayoutProps) {
  return (
    <PageContainer className="max-w-6xl space-y-4 px-1 sm:space-y-5 sm:px-2 lg:space-y-6">
      {breadcrumb}
      {content}
    </PageContainer>
  );
}