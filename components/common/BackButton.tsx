"use client";

import { ChevronLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

/** Large "Back" control for phones, where the breadcrumb is hidden. On a direct visit it goes to the section list. */
export default function BackButton({ fallback, className }: { fallback?: string; className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const target = fallback ?? `/${pathname.split("/")[1] ?? ""}`;
  return (
    <button
      type="button"
      onClick={() => (window.history.length > 1 ? router.back() : router.push(target))}
      className={cn("-ml-2 inline-flex min-h-11 items-center gap-1 rounded-xl px-2 text-sm font-semibold text-brand-strong hover:bg-surface-2", className)}
    >
      <ChevronLeft className="size-5" aria-hidden />Back
    </button>
  );
}
