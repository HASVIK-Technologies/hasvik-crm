"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import OutlinedButton from "@/components/common/OutlinedButton";
import PrimaryButton from "@/components/common/PrimaryButton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ListPagination({
  total,
  page,
  limit,
  onPageChange,
  onLimitChange,
}: {
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const firstResult = total === 0 ? 0 : (page - 1) * limit + 1;
  const lastResult = Math.min(page * limit, total);
  const firstVisiblePage = Math.max(1, Math.min(page - 2, totalPages - 4));
  const visiblePages = Array.from(
    { length: Math.min(5, totalPages) },
    (_, index) => firstVisiblePage + index,
  );

  return (
    <div className="flex flex-col gap-3 border-t border-[#f1f5f9] p-3 md:gap-4 md:p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-center text-sm font-medium text-[#64748b] sm:text-left">
        Showing <span className="font-semibold text-[#0f172a]">{firstResult}</span> to{" "}
        <span className="font-semibold text-[#0f172a]">{lastResult}</span> of{" "}
        <span className="font-semibold text-[#0f172a]">{total}</span> results
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-end sm:gap-4">
        <div className="flex items-center gap-1.5">
          <OutlinedButton
            size="icon-sm"
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(Math.max(1, page - 1))}
            aria-label="Previous page"
            className="size-8.5 border border-[#e2e8f0] text-[#64748b] disabled:opacity-50"
          >
            <ChevronLeft className="size-4" />
          </OutlinedButton>
          {visiblePages.map((pageNumber) =>
            pageNumber === page ? (
              <PrimaryButton
                key={pageNumber}
                size="icon-sm"
                type="button"
                aria-current="page"
                className="size-8.5 p-0 text-sm font-semibold shadow-sm"
              >
                {pageNumber}
              </PrimaryButton>
            ) : (
              <OutlinedButton
                key={pageNumber}
                size="icon-sm"
                type="button"
                onClick={() => onPageChange(pageNumber)}
                className="hidden size-8.5 border border-[#e2e8f0] bg-white text-[#64748b] hover:bg-[#f8fafc] sm:inline-flex"
              >
                {pageNumber}
              </OutlinedButton>
            ),
          )}
          <OutlinedButton
            size="icon-sm"
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            aria-label="Next page"
            className="size-8.5 border border-[#e2e8f0] text-[#64748b] disabled:opacity-50"
          >
            <ChevronRight className="size-4" />
          </OutlinedButton>
        </div>
        <Select
          value={`${limit} per page`}
          onValueChange={(value) => onLimitChange(Number.parseInt(value, 10))}
        >
          <SelectTrigger className="h-8.5 w-auto border border-[#e2e8f0] bg-white pl-3.5 pr-2.5 text-xs font-medium text-[#334155]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {[10, 20, 50, 100].map((size) => (
              <SelectItem key={size} value={`${size} per page`} className="text-xs">
                {size} per page
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
