"use client";

import { useEffect, useState } from "react";
import { Check, ChevronDown, Loader2, Search, Tag, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCategoryAutocomplete } from "@/hooks/use-filter-options";
import { cn } from "@/lib/utils";
import FieldLabel from "@/components/businesses/FieldLabel";

interface CategoryAutocompleteProps {
  value?: string;
  label?: string;
  onChange?: (id: string, name?: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  formLabel?: string;
  required?: boolean;
  invalid?: boolean;
}

export default function CategoryAutocomplete({ value = "", label = "", onChange, placeholder = "All Categories", className, id, formLabel, required, invalid }: CategoryAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedLabel, setSelectedLabel] = useState(label);
  const { data: options = [], isLoading } = useCategoryAutocomplete(debouncedSearch, open);

  useEffect(() => { const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 300); return () => window.clearTimeout(timer); }, [search]);
  const selected = Boolean(value);
  const clear = () => { onChange?.("", ""); setSelectedLabel(""); setSearch(""); };

  return <div className={cn("w-full", className)}>{formLabel && <FieldLabel htmlFor={id} required={required} invalid={invalid}>{formLabel}</FieldLabel>}<Popover open={open} onOpenChange={setOpen}><PopoverTrigger asChild><button id={id} type="button" aria-expanded={open} data-invalid={invalid ? "true" : undefined} className={cn("flex h-10 w-full items-center justify-between border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.05)] hover:border-slate-400 focus-visible:border-brand-blue focus-visible:ring-2 focus-visible:ring-brand-blue/15", selected && "border-brand-blue/60 bg-blue-50/40")}><span className="flex min-w-0 items-center gap-2"><Tag className="size-3.5 shrink-0 text-[#64748b]" /><span className="truncate">{label || selectedLabel || placeholder}</span></span><span className="flex items-center gap-1.5"><span role="button" tabIndex={0} onClick={(event) => { event.stopPropagation(); clear(); }} className={cn("p-0.5 text-[#94a3b8] hover:bg-[#e2e8f0]", !selected && "invisible")} title="Clear category"><X className="size-3.5" /></span><ChevronDown className={cn("size-3.5 text-[#64748b]", open && "rotate-180")} /></span></button></PopoverTrigger><PopoverContent align="start" className="w-(--radix-popover-trigger-width) overflow-hidden border border-slate-200 bg-white p-0 shadow-xl"><div className="border-b border-[#f1f5f9] p-2.5"><div className="relative"><Search className="absolute left-3 top-2.5 size-3.5 text-[#94a3b8]" /><input autoFocus value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search categories..." className="h-8.5 w-full border border-slate-300 bg-slate-50 pl-8 text-xs outline-none focus:border-brand-blue" /></div></div><div className="max-h-60 overflow-y-auto p-1.5"><button type="button" onClick={() => { clear(); setOpen(false); }} className={cn("flex w-full items-center justify-between px-2.5 py-2 text-left text-xs", !selected ? "bg-blue-50 text-brand-blue" : "hover:bg-slate-50")}>All Categories{!selected && <Check className="size-3.5" />}</button>{isLoading ? <div className="flex justify-center py-6"><Loader2 className="size-4 animate-spin text-brand-blue" /></div> : options.map((option) => <button key={option._id} type="button" onClick={() => { onChange?.(option._id, option.name); setSelectedLabel(option.name); setOpen(false); }} className={cn("flex w-full items-center justify-between px-2.5 py-2 text-left text-xs hover:bg-slate-50", value === option._id && "bg-blue-50 text-brand-blue")}>{option.name}{value === option._id && <Check className="size-3.5" />}</button>)}</div></PopoverContent></Popover></div>;
}
