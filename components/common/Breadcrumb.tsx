import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  if (!items || items.length === 0) return null;

  return (
    <nav className="flex flex-wrap items-center gap-1.5 text-base sm:text-base md:text-lg">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={index} className="flex items-center gap-1.5">
            {index > 0 && <ChevronRight className="size-4 sm:size-4.5 md:size-5 text-gray-300" />}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="font-medium text-secondary hover:underline"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-semibold">{item.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
