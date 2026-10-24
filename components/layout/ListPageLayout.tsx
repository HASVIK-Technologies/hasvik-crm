"use client";

import { useState } from "react";
import { Filter, X } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import OutlinedButton from "../common/OutlinedButton";
import SearchInput from "../common/SearchInput";
import PageContainer from "./PageContainer";

interface LayoutProps {
  breadcrumb?: React.ReactNode;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  customSearch?: React.ReactNode;
  filters?: React.ReactNode;
  stats?: React.ReactNode;
  showStats?: boolean;
  showFilters?: boolean;
  onToggleFilters?: () => void;
  onResetFilters?: () => void;
  resultCount?: number;
  actions?: React.ReactNode;
  viewSwitcher?: React.ReactNode;
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
  showFilters: controlledShowFilters,
  onToggleFilters,
  onResetFilters,
  resultCount,
  actions,
  viewSwitcher,
  content,
  footer,
  className,
}: LayoutProps) {
  const [internalShowFilters, setInternalShowFilters] = useState(true);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const showFilters = controlledShowFilters ?? internalShowFilters;

  const handleFilterToggle = () => {
    if (window.matchMedia("(max-width: 1023px)").matches) {
      setFilterDrawerOpen(true);
      return;
    }

    if (onToggleFilters) {
      onToggleFilters();
    } else {
      setInternalShowFilters((visible) => !visible);
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
    <PageContainer className={`flex flex-col gap-4 sm:gap-6 lg:gap-7 ${className ?? ""}`}>
      <section className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        {breadcrumb}
        <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
          {viewSwitcher && <div className="shrink-0">{viewSwitcher}</div>}
          <div className="flex shrink-0 items-center gap-2">
            {filters && (
              <OutlinedButton
                className="gap-2 lg:hidden"
                size="sm"
                onClick={handleFilterToggle}
                aria-expanded={filterDrawerOpen}
                aria-label="Open filters"
              >
                <Filter className="size-4" />
                <span className="hidden min-[380px]:inline">Filters</span>
              </OutlinedButton>
            )}
            {actions}
          </div>
        </div>
      </section>
      <div className="w-full lg:hidden">{search}</div>
      {showFilters && (filters || search) && (
        <div className="hidden grow border border-slate-200 bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.03)] lg:flex overflow-visible">
          <div className="flex w-full items-center gap-3">
            {search && <div className="w-full shrink-0 lg:w-80 xl:w-96">{search}</div>}
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
            <DialogPrimitive.Content className="filter-drawer fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-white shadow-2xl outline-none lg:hidden">
              <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-5">
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
              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
                {filters}
              </div>
              <div className="grid shrink-0 grid-cols-2 gap-3 border-t border-slate-200 bg-white p-4 shadow-[0_-6px_18px_rgba(15,23,42,0.05)]">
                <button
                  type="button"
                  onClick={onResetFilters}
                  disabled={!onResetFilters}
                  className="h-11 border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Reset Filters
                </button>
                <button
                  type="button"
                  onClick={() => setFilterDrawerOpen(false)}
                  className="h-11 border border-brand-green bg-brand-green px-3 text-sm font-semibold text-white hover:bg-brand-green-strong"
                >
                  Show Results{typeof resultCount === "number" ? ` (${resultCount})` : ""}
                </button>
              </div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
      )}
    </PageContainer>
  );
}
