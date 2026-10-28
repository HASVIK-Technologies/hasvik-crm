"use client";

import DatePicker from "@/components/common/DatePicker";

import { useFollowUpListStore } from "@/store/follow-up-list-store";
import { visibleCalendarItems } from "@/lib/follow-ups/highlight";
import { useState } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Eye, MoreVertical, Pencil, Plus, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import PlainButton from "@/components/common/PlainButton";
import OutlinedButton from "@/components/common/OutlinedButton";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useFollowUpHighlight } from "@/hooks/use-follow-up-highlight";
import { canCancelFollowUp, canCompleteFollowUp, canCreateNextFollowUp, canEditFollowUp } from "@/lib/follow-ups/actions";
import { formatFollowUpType } from "@/lib/business/form-options";
import { cn } from "@/lib/utils";
import type { FollowUpItem } from "@/types/follow-up";
import FollowUpCommunicationActions from "@/components/follow-ups/FollowUpCommunicationActions";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function monthDate(value: string) {
  const [year, month] = value.split("-").map(Number);
  return new Date(year, month - 1, 1);
}

function startOfWeek(value: Date) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return date;
}

function timeLabel(value: string) {
  return new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

interface FollowUpCalendarProps {
  items: FollowUpItem[];
  total: number;
  loading?: boolean;
  month: string;
  onMonthChange: (month: string) => void;
  onAddFollowUp: (scheduledAt: string) => void;
  onEdit: (item: FollowUpItem) => void;
  onCancel: (item: FollowUpItem) => void;
  onComplete: (item: FollowUpItem) => void;
  onNextFollowUp: (item: FollowUpItem) => void;
}

export default function FollowUpCalendar({
  items,
  total,
  loading,
  month,
  onMonthChange,
  onAddFollowUp,
  onEdit,
  onCancel,
  onComplete,
  onNextFollowUp,
}: FollowUpCalendarProps) {
  const router = useRouter();
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [today] = useState(() => new Date());
  const highlightedDate = useFollowUpListStore((state) => state.highlightedFollowUpDate);
  const highlightRevision = useFollowUpListStore((state) => state.highlightRevision);
  const highlightedId = useFollowUpListStore((state) => state.highlightedFollowUpId);
  const [seenHighlightRevision, setSeenHighlightRevision] = useState(highlightRevision);
  const [mobileWeekStart, setMobileWeekStart] = useState(() => {
    if (highlightedDate) return startOfWeek(new Date(`${highlightedDate}T12:00:00`));
    const selectedMonth = monthDate(month);
    const now = new Date();
    return startOfWeek(
      selectedMonth.getFullYear() === now.getFullYear() &&
        selectedMonth.getMonth() === now.getMonth()
        ? now
        : selectedMonth,
    );
  });
  const { highlightFollowUp, isFollowUpHighlighted, isDayHighlighted } = useFollowUpHighlight();
  if (seenHighlightRevision !== highlightRevision) {
    setSeenHighlightRevision(highlightRevision);
    if (highlightedDate) setMobileWeekStart(startOfWeek(new Date(`${highlightedDate}T12:00:00`)));
  }
  const visibleMonth = monthDate(month);
  const firstGridDate = new Date(visibleMonth);
  firstGridDate.setDate(firstGridDate.getDate() - ((firstGridDate.getDay() + 6) % 7));
  const days = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(firstGridDate);
    date.setDate(firstGridDate.getDate() + index);
    return date;
  });
  const mobileDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(mobileWeekStart);
    date.setDate(mobileWeekStart.getDate() + index);
    return date;
  });
  const itemsByDay = items.reduce<Record<string, FollowUpItem[]>>((groups, item) => {
    const key = dateKey(new Date(item.scheduledAt));
    (groups[key] ??= []).push(item);
    return groups;
  }, {});
  Object.values(itemsByDay).forEach((dayItems) =>
    dayItems.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()),
  );

  const changeMonth = (offset: number) => {
    const next = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + offset, 1);
    setMobileWeekStart(startOfWeek(next));
    onMonthChange(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`);
  };
  const selectMonth = (nextMonth: string) => {
    if (!nextMonth) return;
    const next = monthDate(nextMonth);
    setMobileWeekStart(startOfWeek(next));
    onMonthChange(nextMonth);
  };
  const changeWeek = (offset: number) => {
    const next = new Date(mobileWeekStart);
    next.setDate(next.getDate() + offset * 7);
    setMobileWeekStart(next);
    const nextMonth = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`;
    if (nextMonth !== month) onMonthChange(nextMonth);
  };
  const selectWeek = (value: string) => {
    if (!value) return;
    const selected = new Date(`${value}T12:00:00`);
    const next = startOfWeek(selected);
    setMobileWeekStart(next);
    const nextMonth = `${selected.getFullYear()}-${String(selected.getMonth() + 1).padStart(2, "0")}`;
    if (nextMonth !== month) onMonthChange(nextMonth);
  };
  const goToToday = () => {
    setMobileWeekStart(startOfWeek(today));
    onMonthChange(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`);
  };
  const scheduleForDay = (day: Date) => {
    const now = new Date();
    const scheduled = new Date(day);
    const isToday = dateKey(scheduled) === dateKey(now);

    if (isToday) {
      scheduled.setHours(now.getHours() + 1, 0, 0, 0);
    } else {
      scheduled.setHours(10, 0, 0, 0);
    }
    onAddFollowUp(scheduled.toISOString());
  };
  const openDetails = (item: FollowUpItem) => {
    setSelectedDay(null);
    highlightFollowUp(item.id, true);
    router.push(`/follow-ups/${item.id}`);
  };
  const selectedDayItems = selectedDay ? itemsByDay[selectedDay] ?? [] : [];
  const selectedDayDate = selectedDay ? new Date(`${selectedDay}T12:00:00`) : null;
  const canScheduleSelectedDay = Boolean(selectedDay && selectedDay >= dateKey(today));

  return (
    <TooltipProvider>
      <>
      <div className="border border-line bg-surface shadow-card rounded-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-line p-3 md:p-4">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-ink">
              Follow-up calendar <span className="font-medium text-muted">({total})</span>
            </h2>
            <p className="mt-0.5 hidden text-xs text-muted sm:block">Month overview on larger screens and a focused weekly agenda on mobile.</p>
          </div>
        </div>

        <div className="hidden items-center justify-between border-b border-line bg-surface-2/70 px-4 py-2.5 xl:flex rounded-2xl">
          <p className="text-xs font-medium text-muted">Select a month to review scheduled workload.</p>
          <div className="flex items-center gap-2">
            <OutlinedButton size="sm" onClick={goToToday}>Today</OutlinedButton>
            <div className="flex items-center border border-line bg-surface">
              <Tooltip><TooltipTrigger asChild><button type="button" aria-label="Previous month" onClick={() => changeMonth(-1)} className="flex size-9 items-center justify-center border-r border-line text-ink-soft hover:bg-surface-2"><ChevronLeft className="size-4" /></button></TooltipTrigger><TooltipContent>Previous month</TooltipContent></Tooltip>
              <input type="month" value={month} onChange={(event) => selectMonth(event.target.value)} aria-label="Select calendar month" className="h-9 min-w-0 max-w-full border-0 bg-surface px-3 text-xs font-bold text-ink-soft outline-none" />
              <Tooltip><TooltipTrigger asChild><button type="button" aria-label="Next month" onClick={() => changeMonth(1)} className="flex size-9 items-center justify-center border-l border-line text-ink-soft hover:bg-surface-2"><ChevronRight className="size-4" /></button></TooltipTrigger><TooltipContent>Next month</TooltipContent></Tooltip>
            </div>
          </div>
        </div>

        <div className="hidden overflow-x-auto xl:block">
          <div className="min-w-225">
            <div className="grid grid-cols-7 border-b border-line bg-surface-2">
              {WEEKDAYS.map((weekday) => <div key={weekday} className="border-r border-line px-3 py-2 text-xs font-bold uppercase tracking-wide text-muted last:border-r-0">{weekday}</div>)}
            </div>
            <div className="grid grid-cols-7">
              {days.map((day) => {
                const key = dateKey(day);
                const dayItems = itemsByDay[key] ?? [];
                const inMonth = day.getMonth() === visibleMonth.getMonth();
                const isToday = key === dateKey(today);
                const canSchedule = inMonth && key >= dateKey(today);
                return (
                  <div
                    key={key}
                    data-follow-up-date={key}
                    onClick={(event) => {
                      if (!canSchedule || (event.target as HTMLElement).closest("button, [role='menuitem']")) return;
                      scheduleForDay(day);
                    }}
                    className={cn(
                      "group/day min-h-36 border-b border-r border-line p-2 last:border-r-0",
                      !inMonth && "bg-surface-2/70",
                      isDayHighlighted(key) && "bg-brand-soft ring-2 ring-inset ring-brand/50",
                      canSchedule && "cursor-pointer transition-colors hover:bg-brand-soft/30",
                    )}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className={cn("flex size-7 items-center justify-center text-xs font-bold", isToday ? "bg-btn text-white" : inMonth ? "text-ink-soft" : "text-muted")}>{day.getDate()}</span>
                      <div className="flex items-center gap-1">
                        {dayItems.length > 0 && <span className="text-[10px] font-semibold text-muted">{dayItems.length}</span>}
                        {canSchedule && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button type="button" onClick={() => scheduleForDay(day)} aria-label={`Add follow-up on ${day.toLocaleDateString("en-IN")}`} className="flex size-6 items-center justify-center border border-transparent text-muted opacity-0 transition-all hover:border-line hover:bg-surface hover:text-brand-strong group-hover/day:opacity-100 focus-visible:opacity-100"><Plus className="size-3.5" /></button>
                            </TooltipTrigger>
                            <TooltipContent>Add follow-up</TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      {loading ? <div className="h-14 animate-pulse bg-surface-2" /> : visibleCalendarItems(dayItems, highlightedId).map((item) => (
                        <div
                          key={item.id}
                          data-follow-up-item-id={item.id}
                          className={cn("group border-l-2 border-brand-strong bg-brand-soft/70 p-2 transition-colors", isFollowUpHighlighted(item.id) && "bg-brand-soft ring-2 ring-inset ring-brand/30")}
                        >
                          <div className="flex items-start gap-1">
                            <button type="button" onClick={() => openDetails(item)} className="min-w-0 flex-1 text-left">
                              <span className="block truncate text-[11px] font-bold text-ink" title={item.businessName}>{timeLabel(item.scheduledAt)} · {item.businessName}</span>
                              <span className="mt-0.5 block truncate text-[10px] text-muted">{formatFollowUpType(item.type)} · {item.assignedToName || "Unassigned"}</span>
                            </button>
                            <DropdownMenu>
                              <Tooltip><TooltipTrigger asChild><DropdownMenuTrigger asChild><PlainButton size="icon-sm" aria-label={`More actions for ${item.businessName}`} className="size-6 text-muted"><MoreVertical className="size-3.5" /></PlainButton></DropdownMenuTrigger></TooltipTrigger><TooltipContent>More actions</TooltipContent></Tooltip>
                              <DropdownMenuContent align="end" className="w-48 bg-surface">
                                <DropdownMenuItem onSelect={() => openDetails(item)} className="gap-2"><Eye className="size-4" />View details</DropdownMenuItem>
                                {canEditFollowUp(item) && <DropdownMenuItem onSelect={() => { highlightFollowUp(item.id); onEdit(item); }} className="gap-2"><Pencil className="size-4" />Edit follow-up</DropdownMenuItem>}
                                {canCreateNextFollowUp(item) && <DropdownMenuItem onSelect={() => { highlightFollowUp(item.id); onNextFollowUp(item); }} className="gap-2 text-accent-strong"><Plus className="size-4" />Next follow-up</DropdownMenuItem>}
                                {canCompleteFollowUp(item) && <DropdownMenuItem onSelect={() => { highlightFollowUp(item.id); onComplete(item); }} className="gap-2 text-accent-strong"><CheckCircle2 className="size-4" />Mark as completed</DropdownMenuItem>}
                                {canCancelFollowUp(item) && <DropdownMenuItem onSelect={() => { highlightFollowUp(item.id); onCancel(item); }} className="gap-2 text-bad"><Trash2 className="size-4" />Cancel follow-up</DropdownMenuItem>}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <div className="mt-1.5 flex items-center justify-between gap-1"><StatusBadge status={item.status} className="px-1.5 py-0 text-[9px]" /><FollowUpCommunicationActions item={item} className="size-6" onAction={() => highlightFollowUp(item.id)} /></div>
                        </div>
                      ))}
                      {dayItems.length > 3 && (
                        <button
                          type="button"
                          onClick={() => setSelectedDay(key)}
                          className="w-full border border-dashed border-brand-strong/30 bg-brand-soft/50 px-2 py-1.5 text-left text-[10px] font-bold text-brand-strong transition-colors hover:border-brand-strong/60 hover:bg-brand-soft"
                          aria-label={`View all ${dayItems.length} follow-ups for ${day.toLocaleDateString("en-IN")}`}
                        >
                          +{dayItems.length - 3} more · View day
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="xl:hidden">
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 border-b border-line bg-surface-2 px-3 py-2.5 rounded-2xl">
            <button type="button" onClick={() => changeWeek(-1)} aria-label="Previous week" className="flex size-9 items-center justify-center border border-line bg-surface text-ink-soft hover:bg-surface-2"><ChevronLeft className="size-4" /></button>
            <div className="flex min-w-0 flex-col items-center justify-center border border-line bg-surface px-2 py-1 text-center">
              <span className="text-[9px] font-bold uppercase tracking-wide text-muted">Select week</span>
              <DatePicker value={dateKey(mobileWeekStart)} onChange={selectWeek} label="Select week" />
              <p className="text-xs font-bold text-ink-soft">
                {new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(mobileDays[0])}
                {" – "}
                {new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(mobileDays[6])}
              </p>
              <span className="sr-only">Week view</span>
            </div>
            <button type="button" onClick={() => changeWeek(1)} aria-label="Next week" className="flex size-9 items-center justify-center border border-line bg-surface text-ink-soft hover:bg-surface-2"><ChevronRight className="size-4" /></button>
            <button type="button" onClick={goToToday} className="col-span-3 justify-self-center text-[11px] font-bold text-brand-strong hover:underline">Go to this week</button>
          </div>
          <div className="divide-y divide-line">
            {mobileDays.map((day) => {
              const key = dateKey(day);
              const dayItems = itemsByDay[key] ?? [];
              const isToday = key === dateKey(today);
              const canSchedule = key >= dateKey(today);
              return (
                <section key={key} data-follow-up-date={key} aria-label={day.toLocaleDateString("en-IN")} className={cn("bg-surface transition-colors", isDayHighlighted(key) && "bg-brand-soft ring-2 ring-inset ring-brand/50", isToday && "border-l-3 border-brand-strong bg-brand-soft/20")}>
                  <div className="flex items-center justify-between gap-3 bg-surface-2/80 px-3 py-2.5">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className={cn("flex size-9 shrink-0 items-center justify-center text-sm font-bold", isToday ? "bg-btn text-white" : "border border-line bg-surface text-ink-soft")}>{day.getDate()}</span>
                      <div className="min-w-0">
                        <h3 className="text-xs font-bold text-ink">{new Intl.DateTimeFormat("en-IN", { weekday: "long" }).format(day)}{isToday ? " · Today" : ""}</h3>
                        <p className="mt-0.5 text-[10px] text-muted">{new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(day)} · {dayItems.length} {dayItems.length === 1 ? "follow-up" : "follow-ups"}</p>
                      </div>
                    </div>
                    {canSchedule && (
                      <button type="button" onClick={() => scheduleForDay(day)} className="flex h-8 shrink-0 items-center gap-1.5 border border-accent bg-surface px-2.5 text-[11px] font-bold text-accent-strong hover:bg-ok-soft"><Plus className="size-3.5" />Add</button>
                    )}
                  </div>
                  <div className="space-y-2 p-3">
                    {loading ? (
                      <div className="h-16 animate-pulse bg-surface-2" />
                    ) : dayItems.length === 0 ? (
                      <p className="border border-dashed border-line px-3 py-4 text-center text-xs text-muted">No follow-ups scheduled</p>
                    ) : dayItems.map((item) => (
                      <article key={item.id} data-follow-up-item-id={item.id} className={cn("flex items-start gap-3 border border-line bg-surface p-3", isFollowUpHighlighted(item.id) && "border-brand-strong bg-brand-soft ring-2 ring-brand/20")}>
                        <div className="w-14 shrink-0 pt-0.5 text-xs font-bold text-brand-strong">{timeLabel(item.scheduledAt)}</div>
                        <button type="button" onClick={() => openDetails(item)} className="min-w-0 flex-1 text-left">
                          <span className="block truncate text-sm font-bold text-ink" title={item.businessName}>{item.businessName}</span>
                          <span className="mt-0.5 block truncate text-[11px] text-muted">{formatFollowUpType(item.type)} · {item.assignedToName || "Unassigned"}</span>
                          <StatusBadge status={item.status} className="mt-2" />
                        </button>
                        <div className="flex shrink-0 items-center gap-1" onClick={(event) => event.stopPropagation()}><FollowUpCommunicationActions item={item} onAction={() => highlightFollowUp(item.id)} /><DropdownMenu>
                          <Tooltip><TooltipTrigger asChild><DropdownMenuTrigger asChild><PlainButton size="icon-sm" aria-label={`More actions for ${item.businessName}`} className="size-8 shrink-0 text-muted"><MoreVertical className="size-4" /></PlainButton></DropdownMenuTrigger></TooltipTrigger><TooltipContent>More actions</TooltipContent></Tooltip>
                          <DropdownMenuContent align="end" className="w-48 bg-surface">
                            <DropdownMenuItem onSelect={() => openDetails(item)} className="gap-2"><Eye className="size-4" />View details</DropdownMenuItem>
                            {canEditFollowUp(item) && <DropdownMenuItem onSelect={() => { highlightFollowUp(item.id); onEdit(item); }} className="gap-2"><Pencil className="size-4" />Edit follow-up</DropdownMenuItem>}
                            {canCreateNextFollowUp(item) && <DropdownMenuItem onSelect={() => { highlightFollowUp(item.id); onNextFollowUp(item); }} className="gap-2 text-accent-strong"><Plus className="size-4" />Next follow-up</DropdownMenuItem>}
                            {canCompleteFollowUp(item) && <DropdownMenuItem onSelect={() => { highlightFollowUp(item.id); onComplete(item); }} className="gap-2 text-accent-strong"><CheckCircle2 className="size-4" />Mark as completed</DropdownMenuItem>}
                            {canCancelFollowUp(item) && <DropdownMenuItem onSelect={() => { highlightFollowUp(item.id); onCancel(item); }} className="gap-2 text-bad"><Trash2 className="size-4" />Cancel follow-up</DropdownMenuItem>}
                          </DropdownMenuContent>
                        </DropdownMenu></div>
                      </article>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </div>
      <DialogPrimitive.Root open={Boolean(selectedDay)} onOpenChange={(open) => { if (!open) setSelectedDay(null); }}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-[2px]" />
          <DialogPrimitive.Content className="fixed inset-x-0 bottom-0 z-50 max-h-[88vh] overflow-y-auto border border-line bg-surface shadow-2xl outline-none sm:left-1/2 sm:top-1/2 sm:bottom-auto sm:w-[calc(100%-2rem)] sm:max-w-2xl sm:-translate-x-1/2 sm:-translate-y-1/2">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-line bg-surface p-4 sm:p-5 rounded-2xl">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center bg-brand-soft text-brand-strong"><CalendarDays className="size-5" /></div>
                <div className="min-w-0">
                  <DialogPrimitive.Title className="text-base font-bold text-ink sm:text-lg">
                    {selectedDayDate ? new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(selectedDayDate) : "Day agenda"}
                  </DialogPrimitive.Title>
                  <DialogPrimitive.Description className="mt-0.5 text-xs text-muted">
                    {selectedDayItems.length} {selectedDayItems.length === 1 ? "follow-up" : "follow-ups"} scheduled
                  </DialogPrimitive.Description>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {canScheduleSelectedDay && selectedDayDate && (
                  <button type="button" onClick={() => { setSelectedDay(null); scheduleForDay(selectedDayDate); }} className="flex h-9 items-center gap-1.5 border border-accent bg-surface-2 px-3 text-xs font-bold text-white hover:bg-accent-strong"><Plus className="size-3.5" /><span className="hidden sm:inline">Add follow-up</span></button>
                )}
                <DialogPrimitive.Close asChild>
                  <button type="button" className="flex size-9 items-center justify-center border border-line text-muted hover:bg-surface-2 hover:text-ink" aria-label="Close day agenda"><X className="size-4" /></button>
                </DialogPrimitive.Close>
              </div>
            </div>
            <div className="divide-y divide-surface-2 p-3 sm:p-5">
              {selectedDayItems.length === 0 && (
                <div className="border border-dashed border-line bg-surface-2 px-4 py-10 text-center rounded-2xl">
                  <CalendarDays className="mx-auto size-6 text-muted" />
                  <p className="mt-2 text-sm font-semibold text-ink-soft">No follow-ups scheduled</p>
                  <p className="mt-1 text-xs text-muted">Use Add follow-up to schedule the first activity for this day.</p>
                </div>
              )}
              {selectedDayItems.map((item) => (
                <article key={item.id} data-follow-up-item-id={item.id} className={cn("flex gap-3 px-2 py-4 transition-colors", isFollowUpHighlighted(item.id) && "bg-brand-soft ring-2 ring-inset ring-brand/25")}>
                  <div className="w-16 shrink-0 pt-0.5 text-xs font-bold text-ink-soft">{timeLabel(item.scheduledAt)}</div>
                  <button type="button" onClick={() => openDetails(item)} className="min-w-0 flex-1 text-left">
                    <span className="block truncate text-sm font-bold text-ink hover:text-brand-strong" title={item.businessName}>{item.businessName}</span>
                    <span className="mt-1 block text-xs text-muted">{formatFollowUpType(item.type)} · {item.assignedToName || "Unassigned"}</span>
                    <StatusBadge status={item.status} className="mt-2" />
                  </button>
                  <div className="flex shrink-0 items-center gap-1" onClick={(event) => event.stopPropagation()}><FollowUpCommunicationActions item={item} onAction={() => highlightFollowUp(item.id)} /><DropdownMenu>
                    <Tooltip><TooltipTrigger asChild><DropdownMenuTrigger asChild><PlainButton size="icon-sm" aria-label={`More actions for ${item.businessName}`} className="size-8 shrink-0 text-muted"><MoreVertical className="size-4" /></PlainButton></DropdownMenuTrigger></TooltipTrigger><TooltipContent>More actions</TooltipContent></Tooltip>
                    <DropdownMenuContent align="end" className="w-48 bg-surface">
                      <DropdownMenuItem onSelect={() => openDetails(item)} className="gap-2"><Eye className="size-4" />View details</DropdownMenuItem>
                      {canEditFollowUp(item) && <DropdownMenuItem onSelect={() => { setSelectedDay(null); highlightFollowUp(item.id); onEdit(item); }} className="gap-2"><Pencil className="size-4" />Edit follow-up</DropdownMenuItem>}
                      {canCreateNextFollowUp(item) && <DropdownMenuItem onSelect={() => { setSelectedDay(null); highlightFollowUp(item.id); onNextFollowUp(item); }} className="gap-2 text-accent-strong"><Plus className="size-4" />Next follow-up</DropdownMenuItem>}
                      {canCompleteFollowUp(item) && <DropdownMenuItem onSelect={() => { setSelectedDay(null); highlightFollowUp(item.id); onComplete(item); }} className="gap-2 text-accent-strong"><CheckCircle2 className="size-4" />Mark as completed</DropdownMenuItem>}
                      {canCancelFollowUp(item) && <DropdownMenuItem onSelect={() => { setSelectedDay(null); highlightFollowUp(item.id); onCancel(item); }} className="gap-2 text-bad"><Trash2 className="size-4" />Cancel follow-up</DropdownMenuItem>}
                    </DropdownMenuContent>
                  </DropdownMenu></div>
                </article>
              ))}
            </div>
            <footer className="sticky bottom-0 z-10 flex justify-end gap-2 border-t border-line bg-surface p-3 sm:px-5 rounded-2xl">
              <DialogPrimitive.Close asChild><button type="button" className="h-9 border border-line px-4 text-xs font-semibold text-ink-soft hover:bg-surface-2">Close</button></DialogPrimitive.Close>
              {canScheduleSelectedDay && selectedDayDate && <button type="button" onClick={() => { setSelectedDay(null); scheduleForDay(selectedDayDate); }} className="h-9 border border-accent bg-surface-2 px-4 text-xs font-bold text-white hover:bg-accent-strong">Add follow-up</button>}
            </footer>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
      </>
    </TooltipProvider>
  );
}
