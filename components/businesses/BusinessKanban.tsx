"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDownUp, ChevronDown, ChevronRight } from "lucide-react";
import ManagementConfirmDialog from "@/components/common/ManagementConfirmDialog";
import OutlinedButton from "@/components/common/OutlinedButton";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getLeadStatusVisual, STATUS_OPTIONS } from "@/lib/business/form-options";
import { cn } from "@/lib/utils";
import type { BusinessItem } from "@/types/business";
import { useUpdateBusinessLeadStatus, useUpdateBusinessStatus } from "@/hooks/use-businesses";
import { useBusinessHighlight } from "@/hooks/use-business-highlight";
import { useBusinessListStore } from "@/store/business-list-store";
import AssignBusinessDialog from "./AssignBusinessDialog";
import LeadCard from "./LeadCard";

/** Cards drawn per column before "Show more", so a long column never freezes the page. */
const PAGE = 20;
/** Won and Lost start folded into a slim column; open them with a tap. */
const CLOSED = ["WON", "LOST"];
const SWIPE_DISTANCE = 64;

function stageOf(business: BusinessItem) {
  const status = business.leadStatus?.toUpperCase();
  return STATUS_OPTIONS.some((option) => option.value === status) ? status! : "NEW";
}

function CardSkeletons({ count = 3 }: { count?: number }) {
  return (
    <div aria-hidden className="space-y-3">
      {Array.from({ length: count }, (_, index) => <div key={index} className="skeleton h-36 rounded-2xl" />)}
    </div>
  );
}

/**
 * The sales pipeline. Desktop: one column per stage with its own scrolling list, native horizontal scroll with snap
 * and edge fades, drag and drop. Phone: stage tabs with swipe, and "Move to" in each card's menu. Every column shows
 * its true count because the page hands this component the whole pipeline, not one page of it.
 */
export default function BusinessKanban({
  businesses,
  totalCount,
  isLoading,
  sortOrder,
  onSortOrderChange,
  hasActiveFilters,
}: {
  businesses: BusinessItem[];
  totalCount: number;
  isLoading?: boolean;
  sortOrder: string;
  onSortOrderChange: (sort: string) => void;
  hasActiveFilters: boolean;
}) {
  const router = useRouter();
  const mutation = useUpdateBusinessLeadStatus();
  const activationMutation = useUpdateBusinessStatus();
  const { highlightBusiness, isBusinessHighlighted } = useBusinessHighlight();
  const setKanbanScrollLeft = useBusinessListStore((state) => state.setKanbanScrollLeft);
  const scroller = useRef<HTMLDivElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);

  const [activatingBusiness, setActivatingBusiness] = useState<BusinessItem | null>(null);
  const [assignmentBusiness, setAssignmentBusiness] = useState<BusinessItem | null>(null);
  const [draggedId, setDraggedId] = useState<string | number | null>(null);
  const [overStage, setOverStage] = useState<string | null>(null);
  const [mobileStage, setMobileStage] = useState(STATUS_OPTIONS[0].value);
  const [opened, setOpened] = useState<Record<string, boolean>>({});
  const [shown, setShown] = useState<Record<string, number>>({});
  const [fade, setFade] = useState({ left: false, right: false });
  const isLatest = sortOrder === "-createdAt" || sortOrder === "Latest first";

  const grouped = useMemo(() => {
    const groups = Object.fromEntries(STATUS_OPTIONS.map((stage) => [stage.value, [] as BusinessItem[]]));
    for (const business of businesses) groups[stageOf(business)].push(business);
    return groups;
  }, [businesses]);

  const updateFade = useCallback(() => {
    const element = scroller.current;
    if (!element) return;
    setFade({ left: element.scrollLeft > 4, right: element.scrollLeft < element.scrollWidth - element.clientWidth - 4 });
  }, []);

  useEffect(() => {
    const element = scroller.current;
    if (!element) return;
    element.scrollLeft = useBusinessListStore.getState().kanbanScrollLeft;
    updateFade();
    const observer = new ResizeObserver(updateFade);
    observer.observe(element);
    return () => observer.disconnect();
  }, [updateFade, isLoading]);

  const move = (business: BusinessItem, stage: string) => {
    const current = stageOf(business);
    if (current === stage || business.status !== "Active" || mutation.isPending) return;
    mutation.mutate({ id: business.id, status: stage, previous: current, name: business.name });
  };

  const open = (business: BusinessItem) => {
    highlightBusiness(business.id, true);
    router.push(`/businesses/${business.id}`);
  };

  const dropOn = (stage: string) => {
    const business = businesses.find((item) => String(item.id) === String(draggedId));
    setDraggedId(null);
    setOverStage(null);
    if (business) move(business, stage);
  };

  const card = (business: BusinessItem, draggable: boolean) => (
    <LeadCard
      key={business.id}
      business={business}
      draggable={draggable}
      dragging={String(draggedId) === String(business.id)}
      highlighted={isBusinessHighlighted(business.id)}
      pending={mutation.isPending && String(mutation.variables?.id) === String(business.id)}
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", String(business.id));
        setDraggedId(business.id);
      }}
      onDragEnd={() => { setDraggedId(null); setOverStage(null); }}
      onOpen={() => open(business)}
      onTouched={() => highlightBusiness(business.id)}
      onMove={(stage) => { if (!draggable) setMobileStage(stage); move(business, stage); }}
      onAssign={() => setAssignmentBusiness(business)}
      onActivate={() => setActivatingBusiness(business)}
    />
  );

  const more = (stage: string, total: number) => {
    const visible = shown[stage] ?? PAGE;
    if (total <= visible) return null;
    return (
      <Button variant="outline" size="sm" className="w-full" onClick={() => setShown((current) => ({ ...current, [stage]: visible + PAGE }))}>
        Show {Math.min(PAGE, total - visible)} more · {total - visible} left
      </Button>
    );
  };

  const emptyText = hasActiveFilters ? "No businesses match these filters" : "No businesses in this stage";
  const phoneItems = grouped[mobileStage] ?? [];
  const stageIndex = STATUS_OPTIONS.findIndex((stage) => stage.value === mobileStage);

  return (
    <div className="rounded-2xl border border-line bg-surface shadow-card">
      <div className="flex items-center justify-between gap-3 border-b border-line p-3 md:p-4">
        <h2 className="flex items-baseline gap-2 text-lg font-bold tracking-tight text-ink">
          Pipeline
          {isLoading ? <span aria-hidden className="skeleton inline-block h-5 w-10 align-middle" /> : <span className="text-base font-medium text-muted tabular">{totalCount}</span>}
        </h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <OutlinedButton size="sm" className="shrink-0">
              <ArrowDownUp className="size-4" aria-hidden />
              {isLatest ? "Latest first" : "Oldest first"}
              <ChevronDown className="size-4" aria-hidden />
            </OutlinedButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 bg-surface">
            <DropdownMenuItem onSelect={() => onSortOrderChange("-createdAt")} className={cn(isLatest && "font-semibold text-brand-strong")}>Latest first</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onSortOrderChange("+createdAt")} className={cn(!isLatest && "font-semibold text-brand-strong")}>Oldest first</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Phone: swipeable stage tabs and one stage's list at a time. */}
      <div className="md:hidden">
        <div role="tablist" aria-label="Pipeline stage" className="sticky top-14 z-10 flex snap-x gap-2 overflow-x-auto border-b border-line bg-surface/95 px-3 py-2.5 backdrop-blur [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {STATUS_OPTIONS.map((stage) => {
            const active = mobileStage === stage.value;
            const count = grouped[stage.value]?.length ?? 0;
            return (
              <button
                key={stage.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={(event) => { setMobileStage(stage.value); event.currentTarget.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" }); }}
                className={cn(
                  "inline-flex h-11 shrink-0 snap-center items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors",
                  active ? "border-brand bg-brand-soft text-brand-strong" : "border-line bg-surface text-ink-soft",
                )}
              >
                <span aria-hidden className={cn("size-2.5 rounded-full", getLeadStatusVisual(stage.value).dot)} />
                {stage.label}
                {isLoading ? <span aria-hidden className="skeleton h-4 w-5" /> : <span className={cn("grid min-w-6 place-items-center rounded-full px-1.5 text-xs tabular", active ? "bg-btn text-white" : "bg-surface-2 text-ink-soft")}>{count}</span>}
              </button>
            );
          })}
        </div>
        <div
          role="tabpanel"
          className="space-y-3 bg-surface-2/60 p-3"
          onTouchStart={(event) => { touch.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }; }}
          onTouchEnd={(event) => {
            const start = touch.current;
            touch.current = null;
            if (!start) return;
            const dx = event.changedTouches[0].clientX - start.x;
            const dy = event.changedTouches[0].clientY - start.y;
            if (Math.abs(dx) < SWIPE_DISTANCE || Math.abs(dy) > Math.abs(dx) / 2) return;
            const next = STATUS_OPTIONS[stageIndex + (dx < 0 ? 1 : -1)];
            if (next) setMobileStage(next.value);
          }}
        >
          {isLoading ? (
            <CardSkeletons />
          ) : phoneItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line bg-surface px-4 py-12 text-center">
              <p className="text-sm font-semibold text-ink-soft">{emptyText}</p>
              <p className="mt-1 text-sm text-muted">Swipe left or right to look at another stage.</p>
            </div>
          ) : (
            <>
              {phoneItems.slice(0, shown[mobileStage] ?? PAGE).map((business) => card(business, false))}
              {more(mobileStage, phoneItems.length)}
            </>
          )}
        </div>
      </div>

      {/* Desktop: the board. */}
      <div className="relative hidden md:block">
        <div
          ref={scroller}
          role="region"
          aria-label="Pipeline board. Use the arrow keys to scroll sideways."
          tabIndex={0}
          onScroll={(event) => { setKanbanScrollLeft(event.currentTarget.scrollLeft); updateFade(); }}
          className="flex h-[calc(100dvh-19rem)] min-h-[30rem] snap-x gap-3 overflow-x-auto bg-surface-2/60 p-3 md:p-4"
        >
          {STATUS_OPTIONS.map((stage) => {
            const items = grouped[stage.value] ?? [];
            const closed = CLOSED.includes(stage.value);
            const folded = closed && !opened[stage.value];
            const visual = getLeadStatusVisual(stage.value);
            return (
              <section
                key={stage.value}
                aria-label={`${stage.label}, ${items.length} businesses`}
                onDragOver={(event) => {
                  if (draggedId === null || mutation.isPending) return;
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "move";
                  setOverStage(stage.value);
                }}
                onDragLeave={() => setOverStage(null)}
                onDrop={(event) => { event.preventDefault(); dropOn(stage.value); }}
                className={cn(
                  "flex shrink-0 snap-start flex-col rounded-2xl border bg-surface-2/80 transition-all duration-200",
                  folded ? "w-16" : "w-80",
                  overStage === stage.value ? "border-brand bg-brand-soft/70 ring-2 ring-brand/30" : "border-line",
                )}
              >
                {folded ? (
                  <button type="button" onClick={() => setOpened((current) => ({ ...current, [stage.value]: true }))} className="flex h-full min-h-32 flex-col items-center gap-3 rounded-2xl px-2 py-4 text-sm font-semibold text-ink-soft hover:bg-surface" aria-label={`Open ${stage.label}, ${items.length} businesses`}>
                    <span aria-hidden className={cn("size-2.5 rounded-full", visual.dot)} />
                    <span className="[writing-mode:vertical-rl]">{stage.label}</span>
                    {isLoading ? <span aria-hidden className="skeleton h-5 w-6" /> : <span className="grid min-w-6 place-items-center rounded-full bg-surface px-1.5 text-xs tabular">{items.length}</span>}
                    <ChevronRight className="mt-auto size-4 text-muted" aria-hidden />
                  </button>
                ) : (
                  <>
                    <header className="flex items-center justify-between gap-2 px-3.5 py-3">
                      <h3 className="flex min-w-0 items-center gap-2 text-sm font-semibold text-ink">
                        <span aria-hidden className={cn("size-2.5 shrink-0 rounded-full", visual.dot)} />
                        <span className="truncate">{stage.label}</span>
                      </h3>
                      <div className="flex items-center gap-1">
                        {isLoading ? <span aria-hidden className="skeleton h-6 w-8" /> : <span className="grid min-w-7 place-items-center rounded-full bg-surface px-2 py-0.5 text-sm font-semibold text-ink-soft tabular">{items.length}</span>}
                        {closed && <button type="button" onClick={() => setOpened((current) => ({ ...current, [stage.value]: false }))} aria-label={`Fold ${stage.label}`} className="grid size-8 place-items-center rounded-lg text-muted hover:bg-surface"><ChevronDown className="size-4 -rotate-90" aria-hidden /></button>}
                      </div>
                    </header>
                    <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 pb-3">
                      {isLoading ? (
                        <CardSkeletons count={2} />
                      ) : items.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-line bg-surface/60 px-3 py-8 text-center text-sm text-muted">{emptyText}</div>
                      ) : (
                        <>
                          {items.slice(0, shown[stage.value] ?? PAGE).map((business) => card(business, true))}
                          {more(stage.value, items.length)}
                        </>
                      )}
                    </div>
                  </>
                )}
              </section>
            );
          })}
        </div>
        {fade.left && <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-linear-to-r from-surface to-transparent" />}
        {fade.right && <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-linear-to-l from-surface to-transparent" />}
      </div>

      <ManagementConfirmDialog open={Boolean(activatingBusiness)} title="Activate business?" description={`Activate ${activatingBusiness?.name ?? "this business"} to allow changes.`} confirmLabel="Activate business" destructive={false} pending={activationMutation.isPending} onCancel={() => setActivatingBusiness(null)} onConfirm={() => { if (activatingBusiness) activationMutation.mutate({ id: activatingBusiness.id, status: "Active" }, { onSuccess: () => setActivatingBusiness(null) }); }} />
      <AssignBusinessDialog
        business={assignmentBusiness}
        open={assignmentBusiness !== null}
        onOpenChange={(openState) => {
          if (!openState) setAssignmentBusiness(null);
        }}
      />
    </div>
  );
}
