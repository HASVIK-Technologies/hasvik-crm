import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  // A single level repeats the page name already shown in the top bar, so it is left out.
  if (!items || items.length < 2) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-base md:text-lg">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={index} className="flex items-center gap-1.5">
            {index > 0 && <ChevronRight className="size-4 sm:size-4.5 md:size-5 text-muted" />}
            {item.href ? (
              <Link
                href={item.href}
                className={
                  isLast
                    ? "font-semibold text-ink hover:underline"
                    : "font-medium text-brand-strong hover:underline"
                }
              >
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="font-semibold text-ink">{item.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
