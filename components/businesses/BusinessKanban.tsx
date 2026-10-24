"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CalendarClock, ChevronLeft, ChevronRight, Eye, GripVertical, MoreVertical, Pencil, UserRound, UserRoundCog } from "lucide-react";
import BusinessViewToggle, { type BusinessView } from "./BusinessViewToggle";
import ListPagination from "@/components/common/ListPagination";
import PlainButton from "@/components/common/PlainButton";
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
import { useUpdateBusinessLeadStatus } from "@/hooks/use-businesses";
import { useBusinessHighlight } from "@/hooks/use-business-highlight";
import { useBusinessListStore } from "@/store/business-list-store";
import AssignBusinessDialog from "./AssignBusinessDialog";

export default function BusinessKanban({
  businesses,
  totalCount,
  isLoading,
  view,
  onViewChange,
  currentPage,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}: {
  businesses: BusinessItem[];
  totalCount: number;
  isLoading?: boolean;
  view: BusinessView;
  onViewChange: (view: BusinessView) => void;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (limit: number) => void;
}) {
  const router = useRouter();
  const mutation = useUpdateBusinessLeadStatus();
  const { highlightBusiness, isBusinessHighlighted } = useBusinessHighlight();
  const setKanbanScrollLeft = useBusinessListStore(
    (state) => state.setKanbanScrollLeft,
  );
  const boardScrollerRef = useRef<HTMLDivElement>(null);
  const [draggedId, setDraggedId] = useState<string | number | null>(null);
  const [overStage, setOverStage] = useState<string | null>(null);
  const [horizontalOffset, setHorizontalOffset] = useState(
    () => useBusinessListStore.getState().kanbanScrollLeft,
  );
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [mobileStage, setMobileStage] = useState(STATUS_OPTIONS[0].value);
  const [assignmentBusiness, setAssignmentBusiness] = useState<BusinessItem | null>(null);
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
    if (draggedId === null) return;
    const business = businesses.find((item) => String(item.id) === String(draggedId));
    setDraggedId(null);
    setOverStage(null);
    if (!business || business.leadStatus?.toUpperCase() === stage) return;
    mutation.mutate({ id: business.id, status: stage });
  };

  const scrollPipeline = (direction: "left" | "right") => {
    boardScrollerRef.current?.scrollBy({
      left: direction === "left" ? -360 : 360,
      behavior: "smooth",
    });
  };

  return (
    <div className="border border-[#e4ecf2] bg-white shadow-[0_2px_12px_rgba(20,40,60,0.03)]">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-3 sm:flex-row sm:items-center sm:justify-between md:p-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900">
            Sales pipeline <span className="font-medium text-slate-500">({totalCount})</span>
          </h2>
          <p className="mt-0.5 text-xs text-slate-500"><span className="hidden md:inline">Drag an active business to update its lead stage.</span><span className="md:hidden">Review businesses by stage and update their progress.</span></p>
        </div>
        <div className="flex items-center gap-2">
          <BusinessViewToggle value={view} onChange={onViewChange} />
        </div>
      </div>

      <div className="sticky top-[81px] z-10 hidden overflow-hidden border-b border-slate-200 bg-slate-50/95 shadow-[0_3px_8px_rgba(15,23,42,0.08)] backdrop-blur md:block">
        <div className="flex h-9 items-center justify-between border-b border-slate-200 bg-white px-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label="Scroll pipeline left"
                disabled={!canScrollLeft}
                onClick={() => scrollPipeline("left")}
                className="flex size-7 items-center justify-center border border-slate-200 bg-white text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 disabled:cursor-not-allowed disabled:border-slate-100 disabled:bg-slate-50 disabled:text-slate-300"
              >
                <ChevronLeft className="size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Previous stages</TooltipContent>
          </Tooltip>
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Navigate stages
          </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label="Scroll pipeline right"
                disabled={!canScrollRight}
                onClick={() => scrollPipeline("right")}
                className="flex size-7 items-center justify-center border border-slate-200 bg-white text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 disabled:cursor-not-allowed disabled:border-slate-100 disabled:bg-slate-50 disabled:text-slate-300"
              >
                <ChevronRight className="size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Next stages</TooltipContent>
          </Tooltip>
        </div>
        <div
          className="min-w-[1680px] p-3 pb-0 md:p-4 md:pb-0"
          style={{ transform: `translateX(-${horizontalOffset}px)` }}
        >
          <div className="grid grid-cols-6 gap-3">
            {STATUS_OPTIONS.map((stage) => {
              const count = grouped[stage.value]?.length ?? 0;
              return (
                <div
                  key={stage.value}
                  className="flex items-center justify-between border border-slate-200 bg-white px-3 py-3"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span className={cn("h-5 w-1", getLeadStatusVisual(stage.value).accent)} />
                    <span className="truncate text-xs font-bold uppercase tracking-wide text-slate-700">
                      {stage.label}
                    </span>
                  </div>
                  <span className="flex size-6 items-center justify-center bg-slate-100 text-xs font-bold text-slate-600">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="md:hidden">
        <div className="sticky top-16 z-10 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
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
                      ? "border-brand-blue bg-blue-50 text-brand-blue"
                      : "border-slate-200 bg-white text-slate-500",
                  )}
                >
                  <span className={cn("h-4 w-1", getLeadStatusVisual(stage.value).accent)} />
                  {stage.label}
                  <span className={cn("flex min-w-5 items-center justify-center px-1 py-0.5 text-[10px]", active ? "bg-brand-blue text-white" : "bg-slate-100 text-slate-500")}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3 bg-slate-50/70 p-3">
          {isLoading ? (
            Array.from({ length: 3 }, (_, index) => <div key={index} className="h-40 animate-pulse bg-white" />)
          ) : (grouped[mobileStage] ?? []).length === 0 ? (
            <div className="border border-dashed border-slate-300 bg-white px-4 py-12 text-center">
              <p className="text-sm font-semibold text-slate-700">No businesses in this stage</p>
              <p className="mt-1 text-xs text-slate-500">Choose another stage to continue reviewing the pipeline.</p>
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
                  "border bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.06)] transition-all duration-500",
                  isBusinessHighlighted(business.id) ? "border-brand-blue bg-blue-50/80 ring-2 ring-brand-blue/20" : "border-slate-200",
                  business.status === "Active" ? "cursor-pointer" : "opacity-60",
                )}
              >
                <div className="flex items-start gap-3">
                  <Avatar className={cn("size-10", business.avatarBg)}>
                    <AvatarFallback className={cn("text-xs font-bold", business.avatarBg, business.avatarTextColor)}>{business.initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-bold text-slate-900">{business.name}</h3>
                    <p className="mt-0.5 truncate text-xs text-slate-500">{business.category}</p>
                  </div>
                  {business.status === "Active" && <DropdownMenu>
                    <Tooltip><TooltipTrigger asChild><DropdownMenuTrigger asChild onClick={(event) => event.stopPropagation()}><PlainButton size="icon-sm" aria-label={`More actions for ${business.name}`} className="size-8 text-slate-500"><MoreVertical className="size-4" /></PlainButton></DropdownMenuTrigger></TooltipTrigger><TooltipContent>More actions</TooltipContent></Tooltip>
                    <DropdownMenuContent align="end" className="w-44 bg-white" onClick={(event) => event.stopPropagation()}>
                      <DropdownMenuItem onSelect={() => { highlightBusiness(business.id, true); router.push(`/businesses/${business.id}`); }} className="gap-2"><Eye className="size-4" />View details</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => { highlightBusiness(business.id, true); router.push(`/businesses/form/${business.id}`); }} className="gap-2"><Pencil className="size-4" />Edit business</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => setAssignmentBusiness(business)} className="gap-2"><UserRoundCog className="size-4" />{business.assignedToId ? "Reassign owner" : "Assign owner"}</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>}
                </div>
                <div className="mt-3 space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
                  <div className="flex min-w-0 items-center gap-2"><UserRound className="size-3.5 shrink-0 text-slate-400" /><span className="truncate">{business.owner || "Unassigned"}</span></div>
                  {business.lastFollowUp !== "-" && <div className="flex min-w-0 items-center gap-2"><CalendarClock className="size-3.5 shrink-0 text-slate-400" /><span className="shrink-0 text-slate-500">Last:</span>{business.lastFollowUpId && business.status === "Active" ? <Link href={`/follow-ups/${business.lastFollowUpId}`} className="truncate font-semibold text-primary hover:underline">{business.lastFollowUp}</Link> : <span className="truncate">{business.lastFollowUp}</span>}</div>}
                  {business.nextFollowUp !== "-" && <div className="flex min-w-0 items-center gap-2"><CalendarClock className="size-3.5 shrink-0 text-slate-400" /><span className="shrink-0 text-slate-500">Next:</span>{business.nextFollowUpId && business.status === "Active" ? <Link href={`/follow-ups/${business.nextFollowUpId}`} className="truncate font-semibold text-primary hover:underline">{business.nextFollowUp}</Link> : <span className="truncate">{business.nextFollowUp}</span>}</div>}
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
                      className="h-9 min-w-0 flex-1 border border-slate-300 bg-white px-2 text-xs font-semibold text-slate-700 outline-none focus:border-brand-blue"
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
        className="hidden overflow-x-auto bg-slate-50/70 md:block"
      >
        <div className="min-w-[1680px] p-3 md:p-4">
        <div className="grid grid-cols-6 gap-3">
          {STATUS_OPTIONS.map((stage) => {
            const items = grouped[stage.value] ?? [];
            return (
              <section
                key={stage.value}
                aria-label={`${stage.label} stage`}
                onDragOver={(event) => {
                  event.preventDefault();
                  setOverStage(stage.value);
                }}
                onDragLeave={() => setOverStage(null)}
                onDrop={() => moveToStage(stage.value)}
                className={cn(
                  "min-h-[360px] border border-slate-200 bg-slate-100/60 transition-colors",
                  overStage === stage.value && "border-brand-blue bg-blue-50/70",
                )}
              >
                <div className="space-y-2 p-2">
                  {isLoading ? (
                    Array.from({ length: 2 }, (_, index) => <div key={index} className="h-32 animate-pulse bg-white" />)
                  ) : items.length === 0 ? (
                    <div className="border border-dashed border-slate-300 bg-white/60 px-3 py-8 text-center text-xs text-slate-500">No businesses in this stage</div>
                  ) : (
                    items.map((business) => (
                      <article
                        key={business.id}
                        data-business-item-id={String(business.id)}
                        draggable={business.status === "Active" && !mutation.isPending}
                        onDragStart={() => setDraggedId(business.id)}
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
                          "group cursor-pointer border bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-500",
                          isBusinessHighlighted(business.id)
                            ? "border-brand-blue bg-blue-50/80 ring-2 ring-brand-blue/20"
                            : "border-slate-200",
                          business.status === "Active" ? "hover:border-slate-300 hover:shadow-md" : "cursor-default opacity-60",
                          String(draggedId) === String(business.id) && "opacity-40",
                        )}
                      >
                        <div className="flex items-start gap-2.5">
                          <GripVertical className="mt-1 size-4 shrink-0 text-slate-300 group-hover:text-slate-500" />
                          <Avatar className={cn("size-9", business.avatarBg)}>
                            <AvatarFallback className={cn("text-xs font-bold", business.avatarBg, business.avatarTextColor)}>{business.initials}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <h4 className="truncate text-sm font-bold text-slate-900">{business.name}</h4>
                            <p className="mt-0.5 truncate text-xs text-slate-500">{business.category}</p>
                          </div>
                          {business.status === "Active" && <DropdownMenu>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <DropdownMenuTrigger asChild onClick={(event) => event.stopPropagation()}>
                                  <PlainButton size="icon-sm" aria-label={`More actions for ${business.name}`} className="size-7 text-slate-500"><MoreVertical className="size-4" /></PlainButton>
                                </DropdownMenuTrigger>
                              </TooltipTrigger>
                              <TooltipContent>More actions</TooltipContent>
                            </Tooltip>
                            <DropdownMenuContent align="end" className="w-40 bg-white" onClick={(event) => event.stopPropagation()}>
                              <DropdownMenuItem onSelect={() => { highlightBusiness(business.id, true); router.push(`/businesses/${business.id}`); }} className="gap-2"><Eye className="size-4" />View details</DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => { highlightBusiness(business.id, true); router.push(`/businesses/form/${business.id}`); }} className="gap-2"><Pencil className="size-4" />Edit business</DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => setAssignmentBusiness(business)} className="gap-2"><UserRoundCog className="size-4" />{business.assignedToId ? "Reassign owner" : "Assign owner"}</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>}
                        </div>

                        <div className="mt-3 space-y-2 border-t border-slate-100 pt-2.5 text-xs text-slate-600">
                          <div className="flex items-center gap-2"><UserRound className="size-3.5 text-slate-400" /><span className="truncate">{business.owner || "Unassigned"}</span></div>
                          {business.lastFollowUp !== "-" && <div className="flex items-center gap-2"><CalendarClock className="size-3.5 shrink-0 text-slate-400" /><span className="shrink-0 text-slate-500">Last:</span>{business.lastFollowUpId && business.status === "Active" ? <Link href={`/follow-ups/${business.lastFollowUpId}`} className="truncate font-semibold text-primary hover:underline">{business.lastFollowUp}</Link> : <span className="truncate">{business.lastFollowUp}</span>}</div>}
                          {business.nextFollowUp !== "-" && <div className="flex items-center gap-2"><CalendarClock className="size-3.5 shrink-0 text-slate-400" /><span className="shrink-0 text-slate-500">Next:</span>{business.nextFollowUpId && business.status === "Active" ? <Link href={`/follow-ups/${business.nextFollowUpId}`} className="truncate font-semibold text-primary hover:underline">{business.nextFollowUp}</Link> : <span className="truncate">{business.nextFollowUp}</span>}</div>}
                        </div>
                        {business.status === "Inactive" ? <ActivityStateText active={false} className="mt-3" /> : <div className="mt-3 flex items-center gap-1 border-t border-slate-100 pt-2" onClick={(event) => event.stopPropagation()}><PhoneActionMenu numbers={business.phoneNumbers} fallback={business.phone} onAction={() => highlightBusiness(business.id)} /><WhatsAppActionMenu numbers={business.whatsappNumbers} fallback={business.alternatePhone} onAction={() => highlightBusiness(business.id)} /></div>}
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
