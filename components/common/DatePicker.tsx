"use client";

import { useState } from "react";
import { CalendarDays } from "lucide-react";
import Calendar from "@/components/common/Calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function dateInputValue(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default function DatePicker({ value, onChange, label = "Select date" }: { value: string; onChange: (value: string) => void; label?: string }) {
  const [open, setOpen] = useState(false);
  const date = value ? new Date(`${value}T00:00:00`) : undefined;
  const selected = date && !Number.isNaN(date.getTime()) ? date : undefined;
  return <Popover open={open} onOpenChange={setOpen}>
    <PopoverTrigger asChild><button type="button" aria-label={label} className="flex h-9 w-full items-center justify-center gap-2 px-2 text-xs font-semibold text-slate-700"><CalendarDays className="size-4 shrink-0" />{selected ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(selected) : label}</button></PopoverTrigger>
    <PopoverContent collisionPadding={12} className="max-h-[var(--radix-popover-content-available-height)] w-[min(22rem,calc(100vw-1.5rem))] overflow-y-auto rounded-xl p-3">{open && <Calendar mode="single" selected={selected} defaultMonth={selected} onSelect={(day) => { if (day) { onChange(dateInputValue(day)); setOpen(false); } }} />}</PopoverContent>
  </Popover>;
}
