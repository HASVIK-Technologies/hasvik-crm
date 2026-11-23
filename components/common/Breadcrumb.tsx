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
    <nav
      aria-label="Breadcrumb"
      className={`flex min-w-0 items-center gap-1.5 text-sm ${
        truncate ? "overflow-hidden whitespace-nowrap" : "flex-wrap"
      }`}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span
            key={index}
            className={`inline-flex min-w-0 items-center gap-1.5 ${
              truncate && isLast ? "overflow-hidden" : "shrink-0"
            }`}
          >
            {/* Separator Chevron */}
            {index > 0 && (
              <ChevronRight className="size-4 shrink-0 text-slate-400" />
            )}

            {/* Link if not the last item and href is provided */}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="font-medium text-slate-500 transition-colors hover:text-slate-800 hover:underline"
              >
                {item.label}
              </Link>
            ) : (
              /* Current page (active item) */
              <span
                className={`font-semibold text-slate-900 ${
                  truncate && isLast ? "truncate" : ""
                }`}
              >
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}