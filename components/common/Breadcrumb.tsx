import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  if (!items || items.length === 0) return null;

  return (
    <nav className="flex flex-wrap items-center gap-1.5 text-sm">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={index} className="flex items-center gap-1.5">
            {index > 0 && <ChevronRight className="size-3.5 text-[#b7c5cd]" />}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="font-medium text-[#08765d] hover:underline"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-semibold text-[#163b58]">{item.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
