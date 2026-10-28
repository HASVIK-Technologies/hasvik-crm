"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import RecordLink from "@/components/common/RecordLink";
import { ArrowDownUp, CalendarClock, ChevronDown, ChevronLeft, ChevronRight, Eye, MoreVertical, Power, Pencil, UserRound, UserRoundCog } from "lucide-react";
import ManagementConfirmDialog from "@/components/common/ManagementConfirmDialog";
import ListPagination from "@/components/common/ListPagination";
import PlainButton from "@/components/common/PlainButton";
import OutlinedButton from "@/components/common/OutlinedButton";
import { ActivityStateText } from "@/components/common/ActivityStateText";
import { PhoneActionMenu, WhatsAppActionMenu } from "@/components/common/ContactActionMenu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getLeadStatusVisual, STATUS_OPTIONS } from "@/lib/business/form-options";
import { cn } from "@/lib/utils";
import type { BusinessItem } from "@/types/business";
import { useUpdateBusinessLeadStatus, useUpdateBusinessStatus } from "@/hooks/use-businesses";
import { useBusinessHighlight } from "@/hooks/use-business-highlight";
import { useBusinessListStore } from "@/store/business-list-store";
import AssignBusinessDialog from "./AssignBusinessDialog";

export default function BusinessKanban({
  businesses,
  totalCount,
  isLoading,
  currentPage,
  itemsPerPage,
  sortOrder,
  onSortOrderChange,
  hasActiveFilters,
  onPageChange,
  onItemsPerPageChange,
}: {
  businesses: BusinessItem[];
  totalCount: number;
  isLoading?: boolean;
  currentPage: number;
  itemsPerPage: number;
  sortOrder: string;
  onSortOrderChange: (sort: string) => void;
  hasActiveFilters: boolean;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (limit: number) => void;
}) {
  const router = useRouter();
  const mutation = useUpdateBusinessLeadStatus();
  const activationMutation = useUpdateBusinessStatus();
  const [activatingBusiness, setActivatingBusiness] = useState<BusinessItem | null>(null);
  const { highlightBusiness, isBusinessHighlighted } = useBusinessHighlight();
  const setKanbanScrollLeft = useBusinessListStore(
    (state) => state.setKanbanScrollLeft,
  );
  const boardScrollerRef = useRef<HTMLDivElement>(null);
  const cardPositions = useRef(new Map<string, DOMRect>());
  const captureCardPositions = useCallback(() => {
    const positions = new Map<string, DOMRect>();
    boardScrollerRef.current?.querySelectorAll<HTMLElement>("[data-business-item-id]").forEach((card) => {
      positions.set(card.dataset.businessItemId!, card.getBoundingClientRect());
    });
    return positions;
  }, []);

  useLayoutEffect(() => {
    const previous = cardPositions.current;
    cardPositions.current = captureCardPositions();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const animations: Animation[] = [];
    boardScrollerRef.current?.querySelectorAll<HTMLElement>("[data-business-item-id]").forEach((card) => {
      const before = previous.get(card.dataset.businessItemId!);
      const after = cardPositions.current.get(card.dataset.businessItemId!);
      if (!before || !after) return;
      const x = before.left - after.left;
      const y = before.top - after.top;
      if (Math.abs(x) < 1 && Math.abs(y) < 1) return;
      animations.push(card.animate([
        { transform: `translate(${x}px, ${y}px)`, zIndex: 10 },
        { transform: "translate(0, 0)", zIndex: 10 },
      ], { duration: 260, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" }));
    });
    return () => animations.forEach((animation) => animation.cancel());
  }, [businesses, captureCardPositions]);
  const [draggedId, setDraggedId] = useState<string | number | null>(null);
  const [overStage, setOverStage] = useState<string | null>(null);
  const [horizontalOffset, setHorizontalOffset] = useState(
    () => useBusinessListStore.getState().kanbanScrollLeft,
  );
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [mobileStage, setMobileStage] = useState(STATUS_OPTIONS[0].value);
  const [assignmentBusiness, setAssignmentBusiness] = useState<BusinessItem | null>(null);
  const isLatest = sortOrder === "-createdAt" || sortOrder === "Latest First";
  const grouped = useMemo(
    () =>
      Object.fromEntries(
        STATUS_OPTIONS.map((stage) => [
          stage.value,
          businesses.filter((business) => {
            const normalizedStatus = business.leadStatus?.toUpperCase();
            return normalizedStatus === stage.value ||
              (stage.value === "NEW" && !STATUS_OPTIONS.some((option) => option.value === normalizedStatus));
          }),
        ]),
      ) as Record<string, BusinessItem[]>,
    [businesses],
  );

  const updateScrollControls = useCallback(() => {
    const scroller = boardScrollerRef.current;
    if (!scroller) return;

    const maximumScrollLeft = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
    setCanScrollLeft(scroller.scrollLeft > 1);
    setCanScrollRight(scroller.scrollLeft < maximumScrollLeft - 1);
  }, []);

  useEffect(() => {
    const scroller = boardScrollerRef.current;
    if (!scroller) return;

    scroller.scrollLeft = useBusinessListStore.getState().kanbanScrollLeft;
    setHorizontalOffset(scroller.scrollLeft);
    updateScrollControls();

    const resizeObserver = new ResizeObserver(updateScrollControls);
    resizeObserver.observe(scroller);
    if (scroller.firstElementChild) resizeObserver.observe(scroller.firstElementChild);

    return () => resizeObserver.disconnect();
  }, [businesses, updateScrollControls]);

  const moveToStage = (stage: string) => {
    if (draggedId === null || mutation.isPending) return;
    const business = businesses.find((item) => String(item.id) === String(draggedId));
    setDraggedId(null);
    setOverStage(null);
    if (!business || business.status !== "Active" || business.leadStatus?.toUpperCase() === stage) return;
    cardPositions.current = captureCardPositions();
    mutation.mutate({ id: business.id, status: stage });
  };

  const scrollPipeline = (direction: "left" | "right") => {
    boardScrollerRef.current?.scrollBy({
      left: direction === "left" ? -360 : 360,
      behavior: "smooth",
    });
  };

  return (
    <div className="border border-line bg-surface shadow-card rounded-2xl">
      <div className="flex flex-col gap-3 border-b border-surface-2 p-3 sm:flex-row sm:items-center sm:justify-between md:p-4">
        <div className="min-w-0">
          <h2 className="text-lg font-bold tracking-tight text-ink">
            Sales pipeline <span className="font-medium text-muted">({totalCount})</span>
          </h2>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <OutlinedButton size="sm" className="shrink-0">
              <ArrowDownUp className="size-4" />
              <span className="hidden sm:inline">{isLatest ? "Latest First" : "Oldest First"}</span>
              <ChevronDown className="size-3.5" />
            </OutlinedButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 bg-surface">
            <DropdownMenuItem onSelect={() => onSortOrderChange("-createdAt")} className={cn("text-xs", isLatest && "font-semibold text-brand-strong")}>Latest First</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onSortOrderChange("+createdAt")} className={cn("text-xs", !isLatest && "font-semibold text-brand-strong")}>Oldest First</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="sticky top-[81px] z-10 hidden overflow-hidden bg-surface-2/95 md:block">
        <div className="flex h-9 items-center justify-between border-b border-line bg-surface px-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label="Scroll pipeline left"
                disabled={!canScrollLeft}
                onClick={() => scrollPipeline("left")}
                className="flex size-7 items-center justify-center border border-line bg-surface text-ink-soft transition-colors hover:border-line hover:bg-surface-2 hover:text-ink disabled:cursor-not-allowed disabled:border-surface-2 disabled:bg-surface-2 disabled:text-muted"
              >
                <ChevronLeft className="size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Previous stages</TooltipContent>
          </Tooltip>
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
            Click arrows to scroll horizontally
          </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label="Scroll pipeline right"
                disabled={!canScrollRight}
                onClick={() => scrollPipeline("right")}
                className="flex size-7 items-center justify-center border border-line bg-surface text-ink-soft transition-colors hover:border-line hover:bg-surface-2 hover:text-ink disabled:cursor-not-allowed disabled:border-surface-2 disabled:bg-surface-2 disabled:text-muted"
              >
                <ChevronRight className="size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Next stages</TooltipContent>
          </Tooltip>
        </div>
        <div
          className="min-w-420 p-3 pb-0 md:p-4 md:pb-0"
          style={{ transform: `translateX(-${horizontalOffset}px)` }}
        >
          <div className="grid grid-cols-6 gap-3">
            {STATUS_OPTIONS.map((stage) => {
              const count = grouped[stage.value]?.length ?? 0;
              return (
                <div
                  key={stage.value}
                  className="flex items-center justify-between border border-line bg-surface px-3 py-3 rounded-2xl"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span className={cn("h-5 w-1", getLeadStatusVisual(stage.value).accent)} />
                    <span className="truncate text-xs font-bold uppercase tracking-wide text-ink-soft">
                      {stage.label}
                    </span>
                  </div>
                  <span className="flex size-6 items-center justify-center bg-surface-2 text-xs font-bold text-ink-soft">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="md:hidden">
        <div className="sticky top-16 z-10 border-b border-line bg-surface/95 shadow-sm backdrop-blur">
          <div className="flex snap-x gap-2 overflow-x-auto px-3 py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {STATUS_OPTIONS.map((stage) => {
              const active = mobileStage === stage.value;
              const count = grouped[stage.value]?.length ?? 0;
              return (
                <button
                  key={stage.value}
                  type="button"
                  onClick={(event) => {
                    setMobileStage(stage.value);
                    event.currentTarget.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
                  }}
                  className={cn(
                    "flex h-9 shrink-0 snap-center items-center gap-2 border px-3 text-[11px] font-bold uppercase tracking-wide transition-colors",
                    active
                      ? "border-brand-strong bg-brand-soft text-brand-strong"
                      : "border-line bg-surface text-muted",
                  )}
                >
                  <span className={cn("h-4 w-1", getLeadStatusVisual(stage.value).accent)} />
                  {stage.label}
                  <span className={cn("flex min-w-5 items-center justify-center px-1 py-0.5 text-[10px]", active ? "bg-btn text-white" : "bg-surface-2 text-muted")}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3 bg-surface-2/70 p-3">
          {isLoading ? (
            Array.from({ length: 3 }, (_, index) => <div key={index} className="h-40 animate-pulse bg-surface" />)
          ) : (grouped[mobileStage] ?? []).length === 0 ? (
            <div className="border border-dashed border-line bg-surface px-4 py-12 text-center rounded-2xl">
              <p className="text-sm font-semibold text-ink-soft">{hasActiveFilters ? "No matching businesses" : "No businesses from this page"}</p>
              <p className="mt-1 text-xs text-muted">{hasActiveFilters ? "Adjust the active filters or choose another stage." : "Choose another stage or page to continue reviewing the pipeline."}</p>
            </div>
          ) : (
            (grouped[mobileStage] ?? []).map((business) => (
              <article
                key={business.id}
                data-business-item-id={String(business.id)}
                onClick={() => {
                  if (business.status !== "Active") return;
                  highlightBusiness(business.id, true);
                  router.push(`/businesses/${business.id}`);
                }}
                className={cn(
                  "border bg-surface p-4 shadow-card transition-all duration-500",
                  isBusinessHighlighted(business.id) ? "border-brand-strong bg-brand-soft/80 ring-2 ring-brand/20" : "border-line",
                  business.status === "Active" ? "cursor-pointer" : "opacity-60",
                  mutation.isPending && String(mutation.variables?.id) === String(business.id) && "pointer-events-none opacity-70",
                )}
                aria-busy={mutation.isPending && String(mutation.variables?.id) === String(business.id)}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="size-10 bg-btn/10 text-brand-strong">
                    <AvatarFallback className="bg-transparent text-xs font-bold text-inherit">{business.initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <RecordLink href={`/businesses/${business.id}`} onClick={(event) => { event.stopPropagation(); highlightBusiness(business.id, true); }} className="block truncate text-sm" title={business.name}>{business.name}</RecordLink>
                    <p className="mt-0.5 truncate text-xs text-muted">{business.category}</p>
                  </div>
                  <DropdownMenu>
                    <Tooltip><TooltipTrigger asChild><DropdownMenuTrigger asChild onClick={(event) => event.stopPropagation()}><PlainButton size="icon-sm" aria-label={`More actions for ${business.name}`} className="size-8 text-muted"><MoreVertical className="size-4" /></PlainButton></DropdownMenuTrigger></TooltipTrigger><TooltipContent>More actions</TooltipContent></Tooltip>
                    <DropdownMenuContent align="end" className="w-44 bg-surface" onClick={(event) => event.stopPropagation()}>
                      <DropdownMenuItem onSelect={() => { highlightBusiness(business.id, true); router.push(`/businesses/${business.id}`); }} className="gap-2"><Eye className="size-4" />View details</DropdownMenuItem>
                      {business.status === "Active" && <><DropdownMenuItem onSelect={() => { highlightBusiness(business.id, true); router.push(`/businesses/form/${business.id}`); }} className="gap-2"><Pencil className="size-4" />Edit business</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => setAssignmentBusiness(business)} className="gap-2"><UserRoundCog className="size-4" />{business.assignedToId ? "Reassign owner" : "Assign owner"}</DropdownMenuItem></>}
                              {business.status === "Inactive" && <DropdownMenuItem disabled={activationMutation.isPending} onSelect={() => setActivatingBusiness(business)} className="gap-2 text-ok"><Power className="size-4" />Activate business</DropdownMenuItem>}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="mt-3 space-y-2 border-t border-surface-2 pt-3 text-xs text-ink-soft">
                  {mutation.isPending && String(mutation.variables?.id) === String(business.id) && <p className="font-semibold text-brand-strong">Updating lead stage...</p>}
                  <div className={cn("flex min-w-0 items-center gap-2", business.owner ? "" : "font-semibold text-warn")}><UserRound className="size-3.5 shrink-0 text-muted" /><span className="truncate">{business.owner || "Unassigned"}</span></div>
                  {business.lastFollowUp !== "-" && <div className="flex min-w-0 items-center gap-2"><CalendarClock className="size-3.5 shrink-0 text-muted" /><span className="shrink-0 text-muted">Last:</span>{business.lastFollowUpId && business.status === "Active" ? <RecordLink href={`/follow-ups/${business.lastFollowUpId}`} className="truncate">{business.lastFollowUp}</RecordLink> : <span className="truncate">{business.lastFollowUp}</span>}</div>}
                  {business.nextFollowUp !== "-" && <div className="flex min-w-0 items-center gap-2"><CalendarClock className="size-3.5 shrink-0 text-muted" /><span className="shrink-0 text-muted">Next:</span>{business.nextFollowUpId && business.status === "Active" ? <RecordLink href={`/follow-ups/${business.nextFollowUpId}`} className="truncate">{business.nextFollowUp}</RecordLink> : <span className="truncate">{business.nextFollowUp}</span>}</div>}
                </div>
                <div className="mt-3 flex items-center justify-between gap-3" onClick={(event) => event.stopPropagation()}>
                  {business.status === "Inactive" ? <ActivityStateText active={false} /> : <div className="flex items-center gap-1"><PhoneActionMenu numbers={business.phoneNumbers} fallback={business.phone} onAction={() => highlightBusiness(business.id)} /><WhatsAppActionMenu numbers={business.whatsappNumbers} fallback={business.alternatePhone} onAction={() => highlightBusiness(business.id)} /></div>}
                  {business.status === "Active" && (
                    <select
                      value={business.leadStatus?.toUpperCase() || "NEW"}
                      disabled={mutation.isPending}
                      onChange={(event) => {
                        const status = event.target.value;
                        setMobileStage(status);
                        highlightBusiness(business.id);
                        mutation.mutate({ id: business.id, status });
                      }}
                      aria-label={`Move ${business.name} to stage`}
                      className="h-9 min-w-0 flex-1 border border-line bg-surface px-2 text-xs font-semibold text-ink-soft outline-none focus:border-brand-strong"
                    >
                      {STATUS_OPTIONS.map((stage) => <option key={stage.value} value={stage.value}>{stage.label}</option>)}
                    </select>
                  )}
                </div>
              </article>
            ))
          )}
        </div>
      </div>

      <div
        ref={boardScrollerRef}
        onScroll={(event) => {
          setKanbanScrollLeft(event.currentTarget.scrollLeft);
          setHorizontalOffset(event.currentTarget.scrollLeft);
          updateScrollControls();
        }}
        className="hidden overflow-x-auto bg-surface-2/70 md:block"
      >
        <div className="min-w-420 p-3 md:p-4">
        <div className="grid grid-cols-6 gap-3">
          {STATUS_OPTIONS.map((stage) => {
            const items = grouped[stage.value] ?? [];
            return (
              <section
                key={stage.value}
                aria-label={`${stage.label} stage`}
                onDragOver={(event) => {
                  if (draggedId === null || mutation.isPending) return;
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "move";
                  setOverStage(stage.value);
                }}
                onDragLeave={() => setOverStage(null)}
                onDrop={(event) => { event.preventDefault(); moveToStage(stage.value); }}
                className={cn(
                  "min-h-90 border border-line bg-surface-2/60 transition-colors",
                  overStage === stage.value && "border-brand-strong bg-brand-soft/70",
                )}
              >
                <div className="space-y-2 p-2">
                  {isLoading ? (
                    Array.from({ length: 2 }, (_, index) => <div key={index} className="h-32 animate-pulse bg-surface" />)
                  ) : items.length === 0 ? (
                    <div className="border border-dashed border-line bg-surface/60 px-3 py-8 text-center text-xs text-muted rounded-2xl">{hasActiveFilters ? "No businesses match the active filters" : "No businesses from this page"}</div>
                  ) : (
                    items.map((business) => (
                      <article
                        key={business.id}
                        data-business-item-id={String(business.id)}
                        draggable={business.status === "Active" && !mutation.isPending}
                        onDragStart={(event) => {
                          event.dataTransfer.effectAllowed = "move";
                          event.dataTransfer.setData("text/plain", String(business.id));
                          event.dataTransfer.setDragImage(event.currentTarget, 24, 24);
                          setDraggedId(business.id);
                        }}
                        onDragEnd={() => {
                          setDraggedId(null);
                          setOverStage(null);
                        }}
                        onClick={() => {
                          if (business.status !== "Active") return;
                          highlightBusiness(business.id, true);
                          router.push(`/businesses/${business.id}`);
                        }}
                        className={cn(
                          "group relative border bg-surface p-3 shadow-card transition-[border-color,background-color,box-shadow] duration-200",
                          business.status === "Active" && !mutation.isPending && "cursor-grab [&_*]:cursor-grab active:cursor-grabbing active:[&_*]:cursor-grabbing",
                          isBusinessHighlighted(business.id)
                            ? "border-brand-strong bg-brand-soft/80 ring-2 ring-brand/20"
                            : "border-line",
                          business.status === "Active" ? "hover:border-line hover:shadow-md" : "cursor-default opacity-60",
                          String(draggedId) === String(business.id) && "ring-2 ring-brand/30",
                          mutation.isPending && String(mutation.variables?.id) === String(business.id) && "pointer-events-none ring-2 ring-brand/20",
                        )}
                        aria-busy={mutation.isPending && String(mutation.variables?.id) === String(business.id)}
                      >
                        <div className="flex items-start gap-2.5">
                          {/* <GripVertical className="mt-1 size-4 shrink-0 text-muted group-hover:text-muted" /> */}
                          <Avatar className="size-9 bg-btn/10 text-brand-strong">
                            <AvatarFallback className="bg-transparent text-xs font-bold text-inherit">{business.initials}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <RecordLink href={`/businesses/${business.id}`} onClick={(event) => { event.stopPropagation(); highlightBusiness(business.id, true); }} className="block truncate text-base text-ink-soft hover:text-brand-strong" title={business.name}>{business.name}</RecordLink>
                            <p className="mt-0.5 truncate text-xs text-muted">{business.category}</p>
                          </div>
                          <DropdownMenu>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <DropdownMenuTrigger asChild onClick={(event) => event.stopPropagation()}>
                                  <PlainButton size="icon-sm" aria-label={`More actions for ${business.name}`} className="size-7 text-muted"><MoreVertical className="size-4" /></PlainButton>
                                </DropdownMenuTrigger>
                              </TooltipTrigger>
                              <TooltipContent>More actions</TooltipContent>
                            </Tooltip>
                            <DropdownMenuContent align="end" className="w-40 bg-surface" onClick={(event) => event.stopPropagation()}>
                              <DropdownMenuItem onSelect={() => { highlightBusiness(business.id, true); router.push(`/businesses/${business.id}`); }} className="gap-2"><Eye className="size-4" />View details</DropdownMenuItem>
                              {business.status === "Active" && <><DropdownMenuItem onSelect={() => { highlightBusiness(business.id, true); router.push(`/businesses/form/${business.id}`); }} className="gap-2"><Pencil className="size-4" />Edit business</DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => setAssignmentBusiness(business)} className="gap-2"><UserRoundCog className="size-4" />{business.assignedToId ? "Reassign owner" : "Assign owner"}</DropdownMenuItem></>}
                              {business.status === "Inactive" && <DropdownMenuItem disabled={activationMutation.isPending} onSelect={() => setActivatingBusiness(business)} className="gap-2 text-ok"><Power className="size-4" />Activate business</DropdownMenuItem>}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="mt-3 space-y-2 border-t border-surface-2 pt-2.5 text-xs text-ink-soft">
                          {mutation.isPending && String(mutation.variables?.id) === String(business.id) && <p className="font-semibold text-brand-strong">Updating lead stage...</p>}
                          <div className={cn("flex items-center gap-2", business.owner ? "" : "text-muted")}><UserRound className="size-3.5 text-muted" /><span className="truncate">{business.owner || "Unassigned"}</span></div>
                          {business.lastFollowUp !== "-" && <div className="flex items-center gap-2"><CalendarClock className="size-3.5 shrink-0 text-muted" /><span className="shrink-0 text-muted">Last:</span>{business.lastFollowUpId && business.status === "Active" ? <RecordLink href={`/follow-ups/${business.lastFollowUpId}`} className="truncate">{business.lastFollowUp}</RecordLink> : <span className="truncate">{business.lastFollowUp}</span>}</div>}
                          {business.nextFollowUp !== "-" && <div className="flex items-center gap-2"><CalendarClock className="size-3.5 shrink-0 text-muted" /><span className="shrink-0 text-muted">Next:</span>{business.nextFollowUpId && business.status === "Active" ? <RecordLink href={`/follow-ups/${business.nextFollowUpId}`} className="truncate">{business.nextFollowUp}</RecordLink> : <span className="truncate">{business.nextFollowUp}</span>}</div>}
                        </div>
                        {business.status === "Inactive" ? <ActivityStateText active={false} className="mt-3" /> : <div className="mt-3 flex items-center gap-1 border-t border-surface-2 pt-2" onClick={(event) => event.stopPropagation()}><PhoneActionMenu numbers={business.phoneNumbers} fallback={business.phone} onAction={() => highlightBusiness(business.id)} /><WhatsAppActionMenu numbers={business.whatsappNumbers} fallback={business.alternatePhone} onAction={() => highlightBusiness(business.id)} /></div>}
                      </article>
                    ))
                  )}
                </div>
              </section>
            );
          })}
        </div>
        </div>
      </div>

      <ListPagination total={totalCount} page={currentPage} limit={itemsPerPage} onPageChange={onPageChange} onLimitChange={onItemsPerPageChange} />
      <ManagementConfirmDialog open={Boolean(activatingBusiness)} title="Activate business?" description={`Activate ${activatingBusiness?.name ?? "this business"} to allow changes.`} confirmLabel="Activate business" destructive={false} pending={activationMutation.isPending} onCancel={() => setActivatingBusiness(null)} onConfirm={() => { if (activatingBusiness) activationMutation.mutate({ id: activatingBusiness.id, status: "Active" }, { onSuccess: () => setActivatingBusiness(null) }); }} />
      <AssignBusinessDialog
        business={assignmentBusiness}
        open={assignmentBusiness !== null}
        onOpenChange={(open) => {
          if (!open) setAssignmentBusiness(null);
        }}
      />
    </div>
  );
}
