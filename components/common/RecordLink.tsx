import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/** Consistent link styling for CRM records such as businesses and follow-ups. */
export default function RecordLink({
  className,
  ...props
}: ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(
        "font-medium text-brand-blue transition-colors hover:text-[#075c9f] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/25",
        className,
      )}
      {...props}
    />
  );
}
