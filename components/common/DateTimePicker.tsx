"use client";

import { useState } from "react";
import { CalendarDays, X } from "lucide-react";
import Calendar from "@/components/common/Calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { fromDateTimeLocalValue, toDateTimeLocalValue } from "@/lib/forms/date-time";
import { cn } from "@/lib/utils";

interface DateTimePickerProps {
  id?: string;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minDate?: Date;
  invalid?: boolean;
  disabled?: boolean;
}

export default function DateTimePicker({ id, value = "", onChange, placeholder = "Select date and time", minDate, invalid, disabled }: DateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const [threshold, setThreshold] = useState(() => new Date());
  const parsed = fromDateTimeLocalValue(value);
  const selectedValue = parsed ? new Date(parsed) : undefined;
  const draftIso = fromDateTimeLocalValue(draft);
  const selectedDraft = draftIso ? new Date(draftIso) : undefined;
  const time = draft.split("T")[1] || "09:00";
  const minimum = minDate ?? threshold;
  const minimumDay = new Date(minimum.getFullYear(), minimum.getMonth(), minimum.getDate());
  const unchanged = draft === value;
  const canApply = Boolean(selectedDraft && (unchanged || selectedDraft.getTime() >= minimum.getTime() - 60_000));

  function changeTime(hour: string, minute: string) {
    const date = draft.split("T")[0] || toDateTimeLocalValue(minimum).split("T")[0];
    setDraft(`${date}T${hour}:${minute}`);
  }

  return (
    <Popover open={open} onOpenChange={(next) => { if (next) { setDraft(value); setThreshold(new Date()); } setOpen(next); }}>
      <div className="relative">
        <PopoverTrigger asChild>
          <button id={id} type="button" disabled={disabled} aria-label={invalid ? "Date and time, invalid selection" : undefined} className={cn("flex h-10 w-full items-center gap-2 rounded-xl border border-line bg-surface px-3 pr-10 text-left text-xs text-ink-soft focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50", invalid && "border-bad/30")}>
            <CalendarDays className="size-4 shrink-0 text-muted" />
            <span className="truncate">{selectedValue ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(selectedValue) : placeholder}</span>
          </button>
        </PopoverTrigger>
        {value && !disabled && <button type="button" onClick={() => onChange("")} aria-label="Clear date and time" className="absolute right-1 top-1 flex size-8 items-center justify-center rounded-md text-muted hover:bg-surface-2"><X className="size-4" /></button>}
      </div>
      <PopoverContent align="start" collisionPadding={12} className="flex max-h-[var(--radix-popover-content-available-height)] w-[min(22rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-xl p-0">
        <div className="min-h-0 overflow-y-auto overscroll-contain p-3">
        <fieldset className="mb-3 flex items-center gap-2 border-b border-surface-2 pb-3">
          <legend className="px-1 text-xs font-semibold text-ink-soft">Time (24-hour)</legend>
          <label className="flex-1 text-xs text-muted">Hour<select aria-label="Hour" value={time.slice(0, 2)} onChange={(event) => changeTime(event.target.value, time.slice(3, 5))} className="mt-1 h-10 w-full rounded-lg border border-line bg-surface px-2 text-sm text-ink">{Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0")).map((hour) => <option key={hour}>{hour}</option>)}</select></label>
          <label className="flex-1 text-xs text-muted">Minute<select aria-label="Minute" value={time.slice(3, 5)} onChange={(event) => changeTime(time.slice(0, 2), event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-line bg-surface px-2 text-sm text-ink">{Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0")).map((minute) => <option key={minute}>{minute}</option>)}</select></label>
        </fieldset>
        {open && <Calendar mode="single" selected={selectedDraft} defaultMonth={selectedDraft ?? minimum} disabled={{ before: minimumDay }} onSelect={(date) => {
          if (!date) return;
          const datePart = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
          const candidate = `${datePart}T${time}`;
          const instant = fromDateTimeLocalValue(candidate);
          setDraft(instant && new Date(instant).getTime() < minimum.getTime() - 60_000 ? toDateTimeLocalValue(minimum) : candidate);
        }} />}
        {!canApply && draft && <p role="status" className="mt-2 text-xs text-warn">Choose a future date and time.</p>}
        </div>
        <div className="flex shrink-0 justify-end gap-2 border-t border-surface-2 bg-surface p-3">
          <button type="button" onClick={() => setOpen(false)} className="h-9 rounded-lg px-3 text-xs font-semibold text-muted hover:bg-surface-2">Cancel</button>
          <button type="button" disabled={!canApply} onClick={() => { if (!unchanged) onChange(draft); setOpen(false); }} className="h-9 rounded-lg bg-btn px-4 text-xs font-semibold text-white disabled:opacity-40">Apply</button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
