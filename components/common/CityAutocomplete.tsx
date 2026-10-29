"use client";

import { useEffect, useState } from "react";
import { Check, ChevronDown, Loader2, MapPin, Search, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCityAutocomplete } from "@/hooks/use-filter-options";
import { cn } from "@/lib/utils";
import FieldLabel from "@/components/businesses/FieldLabel";

interface CityAutocompleteProps {
  value?: string;
  onChange?: (city: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  formLabel?: string;
  required?: boolean;
  invalid?: boolean;
}

export default function CityAutocomplete({ value = "", onChange, placeholder = "All cities", className, id, formLabel, required, invalid }: CityAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { data: options = [], isLoading } = useCityAutocomplete(debouncedSearch, open);
  useEffect(() => { const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 300); return () => window.clearTimeout(timer); }, [search]);
  const selected = Boolean(value);
  const clear = () => { onChange?.(""); setSearch(""); };

  return <div className={cn("w-full", className)}>{formLabel && <FieldLabel htmlFor={id} required={required} invalid={invalid}>{formLabel}</FieldLabel>}<Popover open={open} onOpenChange={setOpen}><PopoverTrigger asChild><button id={id} type="button" aria-expanded={open} data-invalid={invalid ? "true" : undefined} className={cn("flex h-10 w-full items-center justify-between border border-line bg-surface px-3 text-sm font-medium text-ink-soft shadow-card hover:border-muted focus-visible:border-brand-strong focus-visible:ring-2 focus-visible:ring-brand/15", selected && "border-brand-strong/60 bg-brand-soft/40")}><span className="flex min-w-0 items-center gap-2"><MapPin className="size-3.5 shrink-0 text-muted" /><span className="truncate">{value || placeholder}</span></span><span className="flex items-center gap-1.5"><span role="button" tabIndex={0} onClick={(event) => { event.stopPropagation(); clear(); }} className={cn("p-0.5 text-muted hover:bg-line", !selected && "invisible")} title="Clear city"><X className="size-3.5" /></span><ChevronDown className={cn("size-3.5 text-muted", open && "rotate-180")} /></span></button></PopoverTrigger><PopoverContent align="start" className="w-(--radix-popover-trigger-width) overflow-hidden border border-line bg-surface p-0 shadow-xl rounded-2xl"><div className="border-b border-surface-2 p-2.5"><div className="relative"><Search className="absolute left-3 top-2.5 size-3.5 text-muted" /><input autoFocus value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search cities..." className="h-8.5 w-full border border-line bg-surface-2 pl-8 text-xs outline-none focus:border-brand-strong" /></div></div><div className="max-h-60 overflow-y-auto p-1.5"><button type="button" onClick={() => { clear(); setOpen(false); }} className={cn("flex w-full items-center justify-between px-2.5 py-2 text-left text-xs", !selected ? "bg-brand-soft text-brand-strong" : "hover:bg-surface-2")}>All Cities{!selected && <Check className="size-3.5" />}</button>{isLoading ? <div className="flex justify-center py-6"><Loader2 className="size-4 animate-spin text-brand-strong" /></div> : options.map((option) => <button key={option.city} type="button" onClick={() => { onChange?.(option.city); setOpen(false); }} className={cn("flex w-full items-center justify-between px-2.5 py-2 text-left text-xs hover:bg-surface-2", value === option.city && "bg-brand-soft text-brand-strong")}>{option.city}{value === option.city && <Check className="size-3.5" />}</button>)}</div></PopoverContent></Popover></div>;
}
