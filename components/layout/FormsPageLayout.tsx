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
    <PageContainer className="flex flex-col gap-6">
      {breadcrumb}
      {content}
    </PageContainer>
  );
}