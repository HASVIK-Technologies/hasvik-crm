"use client";

import { useEffect, useState } from "react";
import { Filter, X } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import OutlinedButton from "../common/OutlinedButton";
import SearchInput from "../common/SearchInput";
import { FilterDisplayContext } from "@/components/common/ResponsiveFilters";
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
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeDrawer = () => { if (desktop.matches) setFilterDrawerOpen(false); };
    desktop.addEventListener("change", closeDrawer);
    return () => desktop.removeEventListener("change", closeDrawer);
  }, []);

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
        <div className="flex w-full min-w-0 flex-wrap items-center justify-between gap-2 sm:w-auto sm:justify-end">
          {viewSwitcher && <div className="shrink-0">{viewSwitcher}</div>}
          <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
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
        <div className="hidden grow border border-line bg-surface p-3 shadow-card lg:flex overflow-visible rounded-2xl">
          <div className="flex w-full min-w-0 flex-wrap items-center gap-3">
            {search && <div className="w-full shrink-0 lg:w-60 xl:w-72">{search}</div>}
            {filters && <div className="min-w-0 flex-1"><FilterDisplayContext value="inline">{!filterDrawerOpen && filters}</FilterDisplayContext></div>}
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
            <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/40 lg:hidden" />
            <DialogPrimitive.Content className="filter-drawer fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-surface shadow-2xl outline-none lg:hidden">
              <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-5">
                <DialogPrimitive.Title className="text-lg font-bold text-ink">
                  Filters
                </DialogPrimitive.Title>
                <DialogPrimitive.Close
                  className="rounded-md p-2 text-muted hover:bg-surface-2 hover:text-ink"
                  aria-label="Close filters"
                >
                  <X className="size-5" />
                </DialogPrimitive.Close>
              </div>
              <DialogPrimitive.Description className="sr-only">Filter the list. Changes update results automatically.</DialogPrimitive.Description>
              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
                <FilterDisplayContext value="drawer">{filters}</FilterDisplayContext>
              </div>
              <div className="grid shrink-0 grid-cols-2 gap-3 border-t border-line bg-surface p-4 shadow-card rounded-2xl">
                <button
                  type="button"
                  onClick={onResetFilters}
                  disabled={!onResetFilters}
                  className="h-11 border border-line bg-surface px-3 text-sm font-semibold text-ink-soft hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Reset Filters
                </button>
                <button
                  type="button"
                  onClick={() => setFilterDrawerOpen(false)}
                  className="h-11 border border-accent bg-surface-2 px-3 text-sm font-semibold text-white hover:bg-accent-strong"
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
