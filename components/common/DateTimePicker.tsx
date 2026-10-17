"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  X,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DateTimePickerProps {
  id?: string;
  value?: string; // Format: YYYY-MM-DDTHH:mm
  onChange: (value: string) => void;
  placeholder?: string;
  minDate?: Date;
  invalid?: boolean;
  disabled?: boolean;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

function formatDisplayDateTime(isoLocalString?: string): string {
  if (!isoLocalString) return "";
  const [datePart, timePart] = isoLocalString.split("T");
  if (!datePart || !timePart) return isoLocalString;

  const [yearStr, monthStr, dayStr] = datePart.split("-");
  const [hourStr, minStr] = timePart.split(":");

  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const day = parseInt(dayStr, 10);
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minStr, 10);

  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
    return isoLocalString;
  }

  const dateObj = new Date(year, month, day, hour, minute);
  if (Number.isNaN(dateObj.getTime())) return isoLocalString;

  const monthShort = MONTH_NAMES[month]?.slice(0, 3) ?? "";
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  const displayMin = String(minute).padStart(2, "0");

  return `${day} ${monthShort} ${year}, ${String(displayHour).padStart(2, "0")}:${displayMin} ${period}`;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function isBeforeThreshold(date: Date): boolean {
  return date.getTime() < Date.now() - 60_000;
}

export default function DateTimePicker({
  id,
  value = "",
  onChange,
  placeholder = "Select date and time",
  minDate,
  invalid = false,
  disabled = false,
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false);

  const effectiveMinDate = useMemo(() => minDate ?? new Date(), [minDate]);

  // Derived parsed value from prop
  const parsedValue = useMemo(() => {
    if (!value || !value.includes("T")) return null;
    const [dPart, tPart] = value.split("T");
    const [y, m, d] = dPart.split("-").map(Number);
    const [hr, min] = tPart.split(":").map(Number);
    if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return null;
    return new Date(y, m - 1, d, hr || 0, min || 0);
  }, [value]);

  const [viewState, setViewState] = useState<{ year: number; month: number } | null>(null);

  const viewYear =
    viewState?.year ?? parsedValue?.getFullYear() ?? effectiveMinDate.getFullYear();
  const viewMonth =
    viewState?.month ?? parsedValue?.getMonth() ?? effectiveMinDate.getMonth();

  const selectedYear = parsedValue?.getFullYear() ?? null;
  const selectedMonth = parsedValue?.getMonth() ?? null;
  const selectedDay = parsedValue?.getDate() ?? null;
  const selectedHour = parsedValue?.getHours() ?? effectiveMinDate.getHours();
  const selectedMinute = parsedValue?.getMinutes() ?? effectiveMinDate.getMinutes();

  const hoursListRef = useRef<HTMLDivElement>(null);
  const minutesListRef = useRef<HTMLDivElement>(null);

  // When opening, scroll selected hour & minute into view
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        const hourEl = hoursListRef.current?.querySelector(
          `[data-hour="${selectedHour}"]`,
        );
        hourEl?.scrollIntoView({ block: "center", behavior: "auto" });

        const minEl = minutesListRef.current?.querySelector(
          `[data-minute="${selectedMinute}"]`,
        );
        minEl?.scrollIntoView({ block: "center", behavior: "auto" });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [open, selectedHour, selectedMinute]);

  const now = effectiveMinDate;
  const isSelectedDateToday =
    selectedYear === now.getFullYear() &&
    selectedMonth === now.getMonth() &&
    selectedDay === now.getDate();

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayWeekday = new Date(viewYear, viewMonth, 1).getDay();

  const canGoPrevMonth = (() => {
    const minYear = effectiveMinDate.getFullYear();
    const minMonth = effectiveMinDate.getMonth();
    return viewYear > minYear || (viewYear === minYear && viewMonth > minMonth);
  })();

  const handlePrevMonth = () => {
    if (!canGoPrevMonth) return;
    if (viewMonth === 0) {
      setViewState({ year: viewYear - 1, month: 11 });
    } else {
      setViewState({ year: viewYear, month: viewMonth - 1 });
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewState({ year: viewYear + 1, month: 0 });
    } else {
      setViewState({ year: viewYear, month: viewMonth + 1 });
    }
  };

  const emitDateTime = (y: number, m: number, d: number, hr: number, min: number) => {
    const candidateDate = new Date(y, m, d, hr, min);
    let finalHour = hr;
    let finalMinute = min;

    if (isBeforeThreshold(candidateDate)) {
      const current = new Date();
      finalHour = current.getHours();
      finalMinute = current.getMinutes();
    }

    const isoString = `${y}-${pad(m + 1)}-${pad(d)}T${pad(finalHour)}:${pad(finalMinute)}`;
    onChange(isoString);
  };

  const handleDaySelect = (day: number) => {
    let hr = selectedHour;
    let min = selectedMinute;

    const testDate = new Date(viewYear, viewMonth, day, hr, min);
    if (isBeforeThreshold(testDate)) {
      const current = new Date();
      hr = current.getHours();
      min = current.getMinutes();
    }

    emitDateTime(viewYear, viewMonth, day, hr, min);
  };

  const handleHourSelect = (hr: number) => {
    const y = selectedYear ?? viewYear;
    const m = selectedMonth ?? viewMonth;
    const d = selectedDay ?? now.getDate();
    let min = selectedMinute;

    if (
      isSelectedDateToday &&
      hr === now.getHours() &&
      min < now.getMinutes()
    ) {
      min = now.getMinutes();
    }

    emitDateTime(y, m, d, hr, min);
  };

  const handleMinuteSelect = (min: number) => {
    const y = selectedYear ?? viewYear;
    const m = selectedMonth ?? viewMonth;
    const d = selectedDay ?? now.getDate();
    emitDateTime(y, m, d, selectedHour, min);
  };

  const handleSetNow = () => {
    const current = new Date();
    const y = current.getFullYear();
    const m = current.getMonth();
    const d = current.getDate();
    const hr = current.getHours();
    const min = current.getMinutes();

    setViewState({ year: y, month: m });
    emitDateTime(y, m, d, hr, min);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  const displayString = formatDisplayDateTime(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          disabled={disabled}
          aria-expanded={open}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-xl border border-[#e2e8f0] bg-white px-3 text-xs font-medium text-[#334155] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
            value && "border-primary/40 bg-primary/5",
            invalid && "border-red-500",
            disabled && "cursor-not-allowed opacity-50 bg-[#f8fafc]",
          )}
        >
          <span className="flex min-w-0 items-center gap-2">
            <CalendarDays className="size-3.5 shrink-0 text-[#64748b]" />
            <span
              className={cn(
                "truncate",
                !value && "text-[#94a3b8] font-normal",
              )}
            >
              {displayString || placeholder}
            </span>
          </span>
          <span className="flex items-center gap-1">
            {value && !disabled && (
              <span
                role="button"
                aria-label="Clear date and time"
                className="rounded p-0.5 text-[#94a3b8] hover:bg-[#e2e8f0] hover:text-[#475569]"
                onClick={handleClear}
              >
                <X className="size-3.5" />
              </span>
            )}
            <ChevronDown className="size-3.5 text-[#64748b]" />
          </span>
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-auto p-0 rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          {/* Calendar Side */}
          <div className="p-4 w-[280px]">
            {/* Month & Year Header */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-800">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={!canGoPrevMonth}
                  onClick={handlePrevMonth}
                  className={cn(
                    "p-1 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors",
                    !canGoPrevMonth && "opacity-30 cursor-not-allowed hover:bg-transparent",
                  )}
                  aria-label="Previous month"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                  aria-label="Next month"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {WEEKDAYS.map((d) => (
                <span
                  key={d}
                  className="text-[11px] font-semibold text-slate-400 py-1"
                >
                  {d}
                </span>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayWeekday }).map((_, i) => (
                <div key={`empty-${i}`} className="size-8" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const cellDate = new Date(viewYear, viewMonth, day, 23, 59, 59);
                const isPastDay = cellDate < effectiveMinDate;

                const isSelected =
                  selectedYear === viewYear &&
                  selectedMonth === viewMonth &&
                  selectedDay === day;

                const isToday =
                  now.getFullYear() === viewYear &&
                  now.getMonth() === viewMonth &&
                  now.getDate() === day;

                return (
                  <button
                    key={day}
                    type="button"
                    disabled={isPastDay}
                    onClick={() => handleDaySelect(day)}
                    className={cn(
                      "size-8 rounded-lg text-xs font-medium flex items-center justify-center transition-colors",
                      isSelected &&
                        "bg-primary text-white font-bold shadow-sm hover:bg-primary/90",
                      !isSelected &&
                        !isPastDay &&
                        "text-slate-700 hover:bg-slate-100",
                      !isSelected &&
                        isToday &&
                        "border border-primary text-primary font-semibold",
                      isPastDay &&
                        "text-slate-300 cursor-not-allowed opacity-40 hover:bg-transparent",
                    )}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Picker Side */}
          <div className="p-4 w-[210px] flex flex-col bg-slate-50/50">
            <div className="flex items-center gap-1.5 mb-2.5 text-xs font-bold text-slate-800">
              <Clock className="size-3.5 text-slate-500" />
              <span>Time</span>
              {isSelectedDateToday && (
                <span className="ml-auto text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                  Today
                </span>
              )}
            </div>

            {/* Column Headers */}
            <div className="grid grid-cols-2 text-center text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              <span>Hour</span>
              <span>Min</span>
            </div>

            {/* Hour & Minute Scroll Lists */}
            <div className="grid grid-cols-2 gap-2 h-48 border border-slate-200/80 rounded-xl bg-white p-1">
              {/* Hours */}
              <div
                ref={hoursListRef}
                className="overflow-y-auto space-y-1 pr-1 scrollbar-thin"
              >
                {HOURS.map((hr) => {
                  const isHourPast =
                    isSelectedDateToday && hr < now.getHours();
                  const isSelected = selectedHour === hr;

                  return (
                    <button
                      key={hr}
                      type="button"
                      data-hour={hr}
                      disabled={isHourPast}
                      onClick={() => handleHourSelect(hr)}
                      className={cn(
                        "w-full py-1 text-center rounded-md text-xs font-medium transition-colors",
                        isSelected &&
                          "bg-primary text-white font-bold shadow-sm",
                        !isSelected &&
                          !isHourPast &&
                          "text-slate-700 hover:bg-slate-100",
                        isHourPast &&
                          "text-slate-300 cursor-not-allowed opacity-30 pointer-events-none",
                      )}
                    >
                      {pad(hr)}
                    </button>
                  );
                })}
              </div>

              {/* Minutes */}
              <div
                ref={minutesListRef}
                className="overflow-y-auto space-y-1 pr-1 scrollbar-thin"
              >
                {MINUTES.map((min) => {
                  const isMinutePast =
                    isSelectedDateToday &&
                    selectedHour === now.getHours() &&
                    min < now.getMinutes();
                  const isSelected = selectedMinute === min;

                  return (
                    <button
                      key={min}
                      type="button"
                      data-minute={min}
                      disabled={isMinutePast}
                      onClick={() => handleMinuteSelect(min)}
                      className={cn(
                        "w-full py-1 text-center rounded-md text-xs font-medium transition-colors",
                        isSelected &&
                          "bg-primary text-white font-bold shadow-sm",
                        !isSelected &&
                          !isMinutePast &&
                          "text-slate-700 hover:bg-slate-100",
                        isMinutePast &&
                          "text-slate-300 cursor-not-allowed opacity-30 pointer-events-none",
                      )}
                    >
                      {pad(min)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSetNow}
                className="h-7 text-[11px] px-2 font-medium"
              >
                Now
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  if (selectedDay === null) {
                    handleSetNow();
                  }
                  setOpen(false);
                }}
                className="h-7 text-[11px] px-3 font-semibold"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
