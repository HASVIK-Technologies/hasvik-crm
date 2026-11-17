import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export default function Breadcrumb({
  items,
  truncate = false,
}: {
  items: BreadcrumbItem[];
  truncate?: boolean;
}) {
  if (!items || items.length === 0) return null;

  return (
    <nav className={`flex min-w-0 items-center gap-1.5 text-base sm:text-base md:text-lg ${truncate ? "overflow-hidden whitespace-nowrap" : "flex-wrap"}`}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={index} className={`flex min-w-0 flex-1 items-center gap-1.5 ${truncate ? "overflow-hidden" : ""}`}>
            {index > 0 && <ChevronRight className="size-4 sm:size-4.5 md:size-5 text-gray-300" />}
            {item.href ? (
              <Link
                href={item.href}
                className={
                  isLast
                    ? "font-semibold text-secondary hover:underline"
                    : "font-medium text-secondary hover:underline"
                }
              >
                {item.label}
              </Link>
            ) : (
              <span className={`font-semibold ${truncate && isLast ? "truncate" : ""}`}>{item.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
