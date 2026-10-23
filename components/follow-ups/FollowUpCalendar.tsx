"use client";

import { useState } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Eye, MoreVertical, Pencil, Plus, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import PlainButton from "@/components/common/PlainButton";
import OutlinedButton from "@/components/common/OutlinedButton";
import { StatusBadge } from "@/components/common/StatusBadge";
import FollowUpViewToggle, { type FollowUpView } from "./FollowUpViewToggle";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useFollowUpHighlight } from "@/hooks/use-follow-up-highlight";
import { canCancelFollowUp, canCompleteFollowUp, canCreateNextFollowUp, canEditFollowUp } from "@/lib/follow-ups/actions";
import { formatFollowUpType } from "@/lib/business/form-options";
import { cn } from "@/lib/utils";
import type { FollowUpItem } from "@/types/follow-up";

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
  view: FollowUpView;
  onMonthChange: (month: string) => void;
  onViewChange: (view: FollowUpView) => void;
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
  view,
  onMonthChange,
  onViewChange,
  onAddFollowUp,
  onEdit,
  onCancel,
  onComplete,
  onNextFollowUp,
}: FollowUpCalendarProps) {
  const router = useRouter();
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [today] = useState(() => new Date());
  const [mobileWeekStart, setMobileWeekStart] = useState(() => {
    const selectedMonth = monthDate(month);
    const now = new Date();
    return startOfWeek(
      selectedMonth.getFullYear() === now.getFullYear() &&
        selectedMonth.getMonth() === now.getMonth()
        ? now
        : selectedMonth,
    );
  });
  const { highlightFollowUp, isFollowUpHighlighted } = useFollowUpHighlight();
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
  const changeWeek = (offset: number) => {
    const next = new Date(mobileWeekStart);
    next.setDate(next.getDate() + offset * 7);
    setMobileWeekStart(next);
    const nextMonth = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`;
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
      <div className="border border-[#e4ecf2] bg-white shadow-[0_2px_12px_rgba(20,40,60,0.03)]">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between md:p-4">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900">
              Follow-up calendar <span className="font-medium text-slate-500">({total})</span>
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">Review scheduled activity and daily workload.</p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <OutlinedButton size="sm" onClick={goToToday}>Today</OutlinedButton>
            <div className="hidden items-center border border-slate-200 bg-white md:flex">
              <Tooltip><TooltipTrigger asChild><button type="button" aria-label="Previous month" onClick={() => changeMonth(-1)} className="flex size-9 items-center justify-center border-r border-slate-200 text-slate-600 hover:bg-slate-50"><ChevronLeft className="size-4" /></button></TooltipTrigger><TooltipContent>Previous month</TooltipContent></Tooltip>
              <span className="min-w-32 px-3 text-center text-xs font-bold text-slate-700">
                {new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(visibleMonth)}
              </span>
              <Tooltip><TooltipTrigger asChild><button type="button" aria-label="Next month" onClick={() => changeMonth(1)} className="flex size-9 items-center justify-center border-l border-slate-200 text-slate-600 hover:bg-slate-50"><ChevronRight className="size-4" /></button></TooltipTrigger><TooltipContent>Next month</TooltipContent></Tooltip>
            </div>
            <FollowUpViewToggle value={view} onChange={onViewChange} />
          </div>
        </div>

        <div className="hidden overflow-x-auto md:block">
          <div className="min-w-[900px]">
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
              {WEEKDAYS.map((weekday) => <div key={weekday} className="border-r border-slate-200 px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-500 last:border-r-0">{weekday}</div>)}
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
                    onClick={(event) => {
                      if (!canSchedule || (event.target as HTMLElement).closest("button, [role='menuitem']")) return;
                      scheduleForDay(day);
                    }}
                    className={cn(
                      "group/day min-h-36 border-b border-r border-slate-200 p-2 last:border-r-0",
                      !inMonth && "bg-slate-50/70",
                      canSchedule && "cursor-pointer transition-colors hover:bg-blue-50/30",
                    )}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className={cn("flex size-7 items-center justify-center text-xs font-bold", isToday ? "bg-brand-blue text-white" : inMonth ? "text-slate-700" : "text-slate-400")}>{day.getDate()}</span>
                      <div className="flex items-center gap-1">
                        {dayItems.length > 0 && <span className="text-[10px] font-semibold text-slate-400">{dayItems.length}</span>}
                        {canSchedule && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button type="button" onClick={() => scheduleForDay(day)} aria-label={`Add follow-up on ${day.toLocaleDateString("en-IN")}`} className="flex size-6 items-center justify-center border border-transparent text-slate-400 opacity-0 transition-all hover:border-slate-200 hover:bg-white hover:text-brand-blue group-hover/day:opacity-100 focus-visible:opacity-100"><Plus className="size-3.5" /></button>
                            </TooltipTrigger>
                            <TooltipContent>Add follow-up</TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      {loading ? <div className="h-14 animate-pulse bg-slate-100" /> : dayItems.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          data-follow-up-item-id={item.id}
                          className={cn("group border-l-2 border-brand-blue bg-blue-50/70 p-2 transition-colors", isFollowUpHighlighted(item.id) && "bg-blue-100 ring-2 ring-inset ring-brand-blue/30")}
                        >
                          <div className="flex items-start gap-1">
                            <button type="button" onClick={() => openDetails(item)} className="min-w-0 flex-1 text-left">
                              <span className="block truncate text-[11px] font-bold text-slate-800">{timeLabel(item.scheduledAt)} · {item.businessName}</span>
                              <span className="mt-0.5 block truncate text-[10px] text-slate-500">{formatFollowUpType(item.type)} · {item.assignedToName || "Unassigned"}</span>
                            </button>
                            <DropdownMenu>
                              <Tooltip><TooltipTrigger asChild><DropdownMenuTrigger asChild><PlainButton size="icon-sm" aria-label={`More actions for ${item.businessName}`} className="size-6 text-slate-500"><MoreVertical className="size-3.5" /></PlainButton></DropdownMenuTrigger></TooltipTrigger><TooltipContent>More actions</TooltipContent></Tooltip>
                              <DropdownMenuContent align="end" className="w-48 bg-white">
                                <DropdownMenuItem onSelect={() => openDetails(item)} className="gap-2"><Eye className="size-4" />View details</DropdownMenuItem>
                                {canEditFollowUp(item) && <DropdownMenuItem onSelect={() => { highlightFollowUp(item.id); onEdit(item); }} className="gap-2"><Pencil className="size-4" />Edit follow-up</DropdownMenuItem>}
                                {canCreateNextFollowUp(item) && <DropdownMenuItem onSelect={() => { highlightFollowUp(item.id); onNextFollowUp(item); }} className="gap-2 text-brand-green-strong"><Plus className="size-4" />Next follow-up</DropdownMenuItem>}
                                {canCompleteFollowUp(item) && <DropdownMenuItem onSelect={() => { highlightFollowUp(item.id); onComplete(item); }} className="gap-2 text-brand-green-strong"><CheckCircle2 className="size-4" />Mark as completed</DropdownMenuItem>}
                                {canCancelFollowUp(item) && <DropdownMenuItem onSelect={() => { highlightFollowUp(item.id); onCancel(item); }} className="gap-2 text-red-700"><Trash2 className="size-4" />Cancel follow-up</DropdownMenuItem>}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <StatusBadge status={item.status} className="mt-1.5 px-1.5 py-0 text-[9px]" />
                        </div>
                      ))}
                      {dayItems.length > 3 && (
                        <button
                          type="button"
                          onClick={() => setSelectedDay(key)}
                          className="w-full border border-dashed border-brand-blue/30 bg-blue-50/50 px-2 py-1.5 text-left text-[10px] font-bold text-brand-blue transition-colors hover:border-brand-blue/60 hover:bg-blue-50"
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
        <div className="md:hidden">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-2 py-2">
            <button type="button" onClick={() => changeWeek(-1)} aria-label="Previous week" className="flex size-9 items-center justify-center border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"><ChevronLeft className="size-4" /></button>
            <div className="text-center">
              <p className="text-xs font-bold text-slate-700">
                {new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(mobileDays[0])}
                {" – "}
                {new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(mobileDays[6])}
              </p>
              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Week view</p>
            </div>
            <button type="button" onClick={() => changeWeek(1)} aria-label="Next week" className="flex size-9 items-center justify-center border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"><ChevronRight className="size-4" /></button>
          </div>
          <div className="divide-y divide-slate-200">
            {mobileDays.map((day) => {
              const key = dateKey(day);
              const dayItems = itemsByDay[key] ?? [];
              const isToday = key === dateKey(today);
              const canSchedule = key >= dateKey(today);
              return (
                <section key={key} aria-label={day.toLocaleDateString("en-IN")} className={cn("bg-white", isToday && "border-l-3 border-brand-blue bg-blue-50/20")}>
                  <div className="flex items-center justify-between gap-3 bg-slate-50/80 px-3 py-2.5">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className={cn("flex size-9 shrink-0 items-center justify-center text-sm font-bold", isToday ? "bg-brand-blue text-white" : "border border-slate-200 bg-white text-slate-700")}>{day.getDate()}</span>
                      <div className="min-w-0">
                        <h3 className="text-xs font-bold text-slate-800">{new Intl.DateTimeFormat("en-IN", { weekday: "long" }).format(day)}{isToday ? " · Today" : ""}</h3>
                        <p className="mt-0.5 text-[10px] text-slate-500">{new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(day)} · {dayItems.length} {dayItems.length === 1 ? "follow-up" : "follow-ups"}</p>
                      </div>
                    </div>
                    {canSchedule && (
                      <button type="button" onClick={() => scheduleForDay(day)} className="flex h-8 shrink-0 items-center gap-1.5 border border-brand-green bg-white px-2.5 text-[11px] font-bold text-brand-green-strong hover:bg-emerald-50"><Plus className="size-3.5" />Add</button>
                    )}
                  </div>
                  <div className="space-y-2 p-3">
                    {loading ? (
                      <div className="h-16 animate-pulse bg-slate-100" />
                    ) : dayItems.length === 0 ? (
                      <p className="border border-dashed border-slate-200 px-3 py-4 text-center text-xs text-slate-400">No follow-ups scheduled</p>
                    ) : dayItems.map((item) => (
                      <article key={item.id} data-follow-up-item-id={item.id} className={cn("flex items-start gap-3 border border-slate-200 bg-white p-3", isFollowUpHighlighted(item.id) && "border-brand-blue bg-blue-50 ring-2 ring-brand-blue/20")}>
                        <div className="w-14 shrink-0 pt-0.5 text-xs font-bold text-brand-blue">{timeLabel(item.scheduledAt)}</div>
                        <button type="button" onClick={() => openDetails(item)} className="min-w-0 flex-1 text-left">
                          <span className="block truncate text-sm font-bold text-slate-900">{item.businessName}</span>
                          <span className="mt-0.5 block truncate text-[11px] text-slate-500">{formatFollowUpType(item.type)} · {item.assignedToName || "Unassigned"}</span>
                          <StatusBadge status={item.status} className="mt-2" />
                        </button>
                        <DropdownMenu>
                          <Tooltip><TooltipTrigger asChild><DropdownMenuTrigger asChild><PlainButton size="icon-sm" aria-label={`More actions for ${item.businessName}`} className="size-8 shrink-0 text-slate-500"><MoreVertical className="size-4" /></PlainButton></DropdownMenuTrigger></TooltipTrigger><TooltipContent>More actions</TooltipContent></Tooltip>
                          <DropdownMenuContent align="end" className="w-48 bg-white">
                            <DropdownMenuItem onSelect={() => openDetails(item)} className="gap-2"><Eye className="size-4" />View details</DropdownMenuItem>
                            {canEditFollowUp(item) && <DropdownMenuItem onSelect={() => { highlightFollowUp(item.id); onEdit(item); }} className="gap-2"><Pencil className="size-4" />Edit follow-up</DropdownMenuItem>}
                            {canCreateNextFollowUp(item) && <DropdownMenuItem onSelect={() => { highlightFollowUp(item.id); onNextFollowUp(item); }} className="gap-2 text-brand-green-strong"><Plus className="size-4" />Next follow-up</DropdownMenuItem>}
                            {canCompleteFollowUp(item) && <DropdownMenuItem onSelect={() => { highlightFollowUp(item.id); onComplete(item); }} className="gap-2 text-brand-green-strong"><CheckCircle2 className="size-4" />Mark as completed</DropdownMenuItem>}
                            {canCancelFollowUp(item) && <DropdownMenuItem onSelect={() => { highlightFollowUp(item.id); onCancel(item); }} className="gap-2 text-red-700"><Trash2 className="size-4" />Cancel follow-up</DropdownMenuItem>}
                          </DropdownMenuContent>
                        </DropdownMenu>
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
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-[2px]" />
          <DialogPrimitive.Content className="fixed inset-x-0 bottom-0 z-50 max-h-[88vh] overflow-y-auto border border-slate-200 bg-white shadow-2xl outline-none sm:left-1/2 sm:top-1/2 sm:bottom-auto sm:w-[calc(100%-2rem)] sm:max-w-2xl sm:-translate-x-1/2 sm:-translate-y-1/2">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-slate-200 bg-white p-4 sm:p-5">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center bg-blue-50 text-brand-blue"><CalendarDays className="size-5" /></div>
                <div className="min-w-0">
                  <DialogPrimitive.Title className="text-base font-bold text-slate-900 sm:text-lg">
                    {selectedDayDate ? new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(selectedDayDate) : "Day agenda"}
                  </DialogPrimitive.Title>
                  <DialogPrimitive.Description className="mt-0.5 text-xs text-slate-500">
                    {selectedDayItems.length} {selectedDayItems.length === 1 ? "follow-up" : "follow-ups"} scheduled
                  </DialogPrimitive.Description>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {canScheduleSelectedDay && selectedDayDate && (
                  <button type="button" onClick={() => { setSelectedDay(null); scheduleForDay(selectedDayDate); }} className="flex h-9 items-center gap-1.5 border border-brand-green bg-brand-green px-3 text-xs font-bold text-white hover:bg-brand-green-strong"><Plus className="size-3.5" /><span className="hidden sm:inline">Add follow-up</span></button>
                )}
                <DialogPrimitive.Close asChild>
                  <button type="button" className="flex size-9 items-center justify-center border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900" aria-label="Close day agenda"><X className="size-4" /></button>
                </DialogPrimitive.Close>
              </div>
            </div>
            <div className="divide-y divide-slate-100 p-3 sm:p-5">
              {selectedDayItems.length === 0 && (
                <div className="border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center">
                  <CalendarDays className="mx-auto size-6 text-slate-300" />
                  <p className="mt-2 text-sm font-semibold text-slate-700">No follow-ups scheduled</p>
                  <p className="mt-1 text-xs text-slate-500">Use Add follow-up to schedule the first activity for this day.</p>
                </div>
              )}
              {selectedDayItems.map((item) => (
                <article key={item.id} data-follow-up-item-id={item.id} className={cn("flex gap-3 px-2 py-4 transition-colors", isFollowUpHighlighted(item.id) && "bg-blue-50 ring-2 ring-inset ring-brand-blue/25")}>
                  <div className="w-16 shrink-0 pt-0.5 text-xs font-bold text-slate-700">{timeLabel(item.scheduledAt)}</div>
                  <button type="button" onClick={() => openDetails(item)} className="min-w-0 flex-1 text-left">
                    <span className="block truncate text-sm font-bold text-slate-900 hover:text-brand-blue">{item.businessName}</span>
                    <span className="mt-1 block text-xs text-slate-500">{formatFollowUpType(item.type)} · {item.assignedToName || "Unassigned"}</span>
                    <StatusBadge status={item.status} className="mt-2" />
                  </button>
                  <DropdownMenu>
                    <Tooltip><TooltipTrigger asChild><DropdownMenuTrigger asChild><PlainButton size="icon-sm" aria-label={`More actions for ${item.businessName}`} className="size-8 shrink-0 text-slate-500"><MoreVertical className="size-4" /></PlainButton></DropdownMenuTrigger></TooltipTrigger><TooltipContent>More actions</TooltipContent></Tooltip>
                    <DropdownMenuContent align="end" className="w-48 bg-white">
                      <DropdownMenuItem onSelect={() => openDetails(item)} className="gap-2"><Eye className="size-4" />View details</DropdownMenuItem>
                      {canEditFollowUp(item) && <DropdownMenuItem onSelect={() => { setSelectedDay(null); highlightFollowUp(item.id); onEdit(item); }} className="gap-2"><Pencil className="size-4" />Edit follow-up</DropdownMenuItem>}
                      {canCreateNextFollowUp(item) && <DropdownMenuItem onSelect={() => { setSelectedDay(null); highlightFollowUp(item.id); onNextFollowUp(item); }} className="gap-2 text-brand-green-strong"><Plus className="size-4" />Next follow-up</DropdownMenuItem>}
                      {canCompleteFollowUp(item) && <DropdownMenuItem onSelect={() => { setSelectedDay(null); highlightFollowUp(item.id); onComplete(item); }} className="gap-2 text-brand-green-strong"><CheckCircle2 className="size-4" />Mark as completed</DropdownMenuItem>}
                      {canCancelFollowUp(item) && <DropdownMenuItem onSelect={() => { setSelectedDay(null); highlightFollowUp(item.id); onCancel(item); }} className="gap-2 text-red-700"><Trash2 className="size-4" />Cancel follow-up</DropdownMenuItem>}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </article>
              ))}
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
      </>
    </TooltipProvider>
  );
}
