import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import PageContainer from "./PageContainer";
import OutlinedButton from "../common/OutlinedButton";

interface DetailsPageLayoutProps {
  content: React.ReactNode;
  backHref: string;
  backLabel: string;
  actions?: React.ReactNode;
}

export default function DetailsPageLayout({
  content,
  backHref,
  backLabel,
  actions,
}: DetailsPageLayoutProps) {
  return (
    <PageContainer className="space-y-4 px-1 sm:space-y-5 sm:px-2 lg:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <OutlinedButton asChild className="w-fit">
          <Link href={backHref}>
            <ArrowLeft className="size-4" />
            {backLabel}
          </Link>
        </OutlinedButton>
        {actions && (
          <div className="flex items-center justify-end">{actions}</div>
        )}
      </div>
      {content}
    </PageContainer>
  );
}
