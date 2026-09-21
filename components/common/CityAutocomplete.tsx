"use client";

import { useEffect, useState } from "react";
import { Check, ChevronDown, Loader2, MapPin, Search, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCityAutocomplete } from "@/hooks/use-filter-options";
import { cn } from "@/lib/utils";

interface CityAutocompleteProps { value?: string; onChange?: (city: string) => void; placeholder?: string; className?: string; }

export default function CityAutocomplete({ value = "", onChange, placeholder = "All Cities", className }: CityAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { data: options = [], isLoading } = useCityAutocomplete(debouncedSearch, open);
  useEffect(() => { const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 300); return () => window.clearTimeout(timer); }, [search]);
  const selected = Boolean(value);
  const clear = () => { onChange?.(""); setSearch(""); };

  return <div className={cn("w-full", className)}><Popover open={open} onOpenChange={setOpen}><PopoverTrigger asChild><button type="button" aria-expanded={open} className={cn("flex h-10 w-full items-center justify-between rounded-xl border border-[#e2e8f0] bg-white px-3.5 text-xs font-medium text-[#334155]", selected && "border-[#0b63e5]/50 bg-[#f8faff]")}><span className="flex min-w-0 items-center gap-2"><MapPin className="size-3.5 shrink-0 text-[#64748b]" /><span className="truncate">{value || placeholder}</span></span><span className="flex items-center gap-1.5"><span role="button" tabIndex={0} onClick={(event) => { event.stopPropagation(); clear(); }} className={cn("rounded p-0.5 text-[#94a3b8] hover:bg-[#e2e8f0]", !selected && "invisible")} title="Clear city filter"><X className="size-3.5" /></span><ChevronDown className={cn("size-3.5 text-[#64748b]", open && "rotate-180")} /></span></button></PopoverTrigger><PopoverContent align="start" className="w-70 p-0 overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white"><div className="border-b border-[#f1f5f9] p-2.5"><div className="relative"><Search className="absolute left-3 top-2.5 size-3.5 text-[#94a3b8]" /><input autoFocus value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search cities..." className="h-8.5 w-full rounded-lg border border-[#e2e8f0] bg-[#f8fafc] pl-8 text-xs outline-none" /></div></div><div className="max-h-60 overflow-y-auto p-1.5"><button type="button" onClick={() => { clear(); setOpen(false); }} className={cn("flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs", !selected ? "bg-[#eff6ff] text-[#1d4ed8]" : "hover:bg-[#f8fafc]")}>All Cities{!selected && <Check className="size-3.5" />}</button>{isLoading ? <div className="flex justify-center py-6"><Loader2 className="size-4 animate-spin text-[#0b63e5]" /></div> : options.map((option) => <button key={option.city} type="button" onClick={() => { onChange?.(option.city); setOpen(false); }} className={cn("flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs hover:bg-[#f8fafc]", value === option.city && "bg-[#eff6ff] text-[#1d4ed8]")}>{option.city}{value === option.city && <Check className="size-3.5" />}</button>)}</div></PopoverContent></Popover></div>;
}