"use client";

import { useEffect, useState } from "react";
import { Filter, X } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import OutlinedButton from "../common/OutlinedButton";
import { Button } from "@/components/ui/button";
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
  /** Number of filters currently applied, shown as a badge on the phone Filters button. */
  activeFilterCount?: number;
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
  activeFilterCount = 0,
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
      {/* One toolbar layout for every list page: view switch on the left, actions on the right. The page name lives in
          the top bar, so a breadcrumb only appears when it adds a level (see Breadcrumb). */}
      {breadcrumb && <div className="hidden sm:block empty:hidden">{breadcrumb}</div>}
      <section className="flex min-h-11 items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          {viewSwitcher}
        </div>
        <div className="flex min-w-0 items-center gap-2">
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
                <span>Filters</span>
                {activeFilterCount > 0 && <span className="grid min-w-5 place-items-center rounded-full bg-btn px-1.5 text-xs font-semibold text-white tabular">{activeFilterCount}</span>}
              </OutlinedButton>
            )}
            {actions}
          </div>
        </div>
      </section>
      <div className="order-first w-full lg:hidden">{search}</div>
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
            <DialogPrimitive.Overlay className="fade-up fixed inset-0 z-50 bg-ink/55 backdrop-blur-[3px] lg:hidden" />
            {/* A bottom sheet on phones (thumb reach), a side panel on tablets. */}
            <DialogPrimitive.Content className="filter-drawer sheet-up fixed inset-x-0 bottom-0 z-50 flex max-h-[88dvh] flex-col rounded-t-3xl border border-line bg-surface shadow-float outline-none sm:inset-x-auto sm:inset-y-0 sm:right-0 sm:max-h-none sm:w-full sm:max-w-sm sm:rounded-none sm:rounded-l-3xl lg:hidden">
              <div aria-hidden className="mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-line sm:hidden" />
              <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-5">
                <DialogPrimitive.Title className="text-lg font-bold tracking-tight text-ink">
                  Filters
                </DialogPrimitive.Title>
                <DialogPrimitive.Close
                  className="grid size-11 place-items-center rounded-xl text-muted hover:bg-surface-2 hover:text-ink"
                  aria-label="Close filters"
                >
                  <X className="size-5" />
                </DialogPrimitive.Close>
              </div>
              <DialogPrimitive.Description className="sr-only">Filter the list. Changes update results automatically.</DialogPrimitive.Description>
              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
                <FilterDisplayContext value="drawer">{filters}</FilterDisplayContext>
              </div>
              <div className="grid shrink-0 grid-cols-2 gap-3 border-t border-line p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
                <Button variant="outline" onClick={onResetFilters} disabled={!onResetFilters}>
                  Clear all
                </Button>
                <Button onClick={() => setFilterDrawerOpen(false)}>
                  Show {typeof resultCount === "number" ? `${resultCount} result${resultCount === 1 ? "" : "s"}` : "results"}
                </Button>
              </div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
      )}
    </PageContainer>
  );
}
