"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import OutlinedButton from "../common/OutlinedButton";
import SearchInput from "../common/SearchInput";
import PageContainer from "./PageContainer";
import { Card } from "../ui/card";

interface LayoutProps {
  breadcrumb?: React.ReactNode;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  customSearch?: React.ReactNode;
  filters?: React.ReactNode;
  stats?: React.ReactNode;
  showStats?: boolean;
  actions?: React.ReactNode;
  content?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export default function ListPageLayout({
  breadcrumb,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  customSearch,
  filters,
  stats,
  showStats = true,
  actions,
  content,
  footer,
  className,
}: LayoutProps) {
  const [showFilters, setShowFilters] = useState(true);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const handleFilterToggle = () => {
    setShowFilters((visible) => !visible);
    if (window.matchMedia("(max-width: 1023px)").matches) {
      setFilterDrawerOpen(true);
    }
  };

  const search =
    customSearch !== undefined ? (
      customSearch
    ) : searchValue !== undefined && onSearchChange ? (
      <SearchInput
        value={searchValue}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder={searchPlaceholder}
        wrapperClassName="w-full lg:min-w-60 lg:max-w-sm"
        className="h-full"
      />
    ) : null;

  return (
    <PageContainer className={`flex flex-col gap-6 ${className ?? ""}`}>
      <section className="flex gap-4 flex-row items-center justify-between">
        {breadcrumb}
        <div className="flex shrink-0 items-center gap-2">
          {filters && (
            <OutlinedButton
              size="sm"
              onClick={handleFilterToggle}
              aria-expanded={showFilters}
              aria-label={`${showFilters ? "Hide" : "Show"} filters`}
              className="gap-2"
            >
              <SlidersHorizontal className="size-4" />
              <span className="hidden sm:inline">
                {showFilters ? "Hide" : "Show"} Filters
              </span>
            </OutlinedButton>
          )}
          {actions}
        </div>
      </section>
      <div className="w-full lg:hidden">{search}</div>
      {showFilters && (filters || search) && (
        <div className="hidden grow lg:flex p-4 rounded-2xl border border-[#e4ecf2] shadow-[0_2px_12px_rgba(20,40,60,0.03)] bg-white overflow-visible">
          <div className="flex w-full flex-col lg:flex-row gap-5 items-start">
            {search && <div className="w-full lg:max-w-sm shrink-0">{search}</div>}
            {filters && <div className="min-w-0 flex-1">{filters}</div>}
          </div>
        </div>
      )}

      {showStats && stats && <section className="shrink-0">{stats}</section>}
      {content && (
        <section className="layout-content min-w-0">{content}</section>
      )}
      {footer && <section className="shrink-0">{footer}</section>}
      {filters && (
        <DialogPrimitive.Root
          open={filterDrawerOpen}
          onOpenChange={setFilterDrawerOpen}
        >
          <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 lg:hidden" />
            <DialogPrimitive.Content className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col gap-6 overflow-y-auto bg-white p-5 shadow-2xl outline-none lg:hidden">
              <div className="flex items-center justify-between">
                <DialogPrimitive.Title className="text-lg font-bold text-[#0f172a]">
                  Filters
                </DialogPrimitive.Title>
                <DialogPrimitive.Close
                  className="rounded-md p-2 text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a]"
                  aria-label="Close filters"
                >
                  <X className="size-5" />
                </DialogPrimitive.Close>
              </div>
              {filters}
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
      )}
    </PageContainer>
  );
}
