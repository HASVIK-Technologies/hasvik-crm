import { ArrowLeft } from "lucide-react";
import SecondaryButton from "../common/SecondaryButton";
import PageContainer from "./PageContainer";
import OutlinedButton from "../common/OutlinedButton";

interface DetailsPageLayoutProps {
  content: React.ReactNode;
  actions?: React.ReactNode;
}

export default function DetailsPageLayout({
  content,
  actions,
}: DetailsPageLayoutProps) {
  return (
    <PageContainer className="space-y-4 px-1 sm:space-y-5 sm:px-2 lg:space-y-6">
      <OutlinedButton
        href="/businesses"
        icon={<ArrowLeft className="size-4" />}
      >
        Back to Businesses
      </OutlinedButton>
      {actions && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {actions}
        </div>
      )}
      {content}
    </PageContainer>
  );
}
