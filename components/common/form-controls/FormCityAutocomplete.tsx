"use client";

import { useEffect, useState } from "react";
import { Check, ChevronDown, Loader2, MapPin, Search, X } from "lucide-react";
import FieldLabel from "@/components/businesses/FieldLabel";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCityAutocomplete } from "@/hooks/use-filter-options";
import { cn } from "@/lib/utils";

interface FormCityAutocompleteProps {
  id?: string;
  label: string;
  value?: string;
  onChange: (city: string) => void;
  placeholder?: string;
  required?: boolean;
  invalid?: boolean;
}

export default function FormCityAutocomplete({
  id,
  label,
  value = "",
  onChange,
  placeholder = "Start typing a city",
  required,
  invalid,
}: FormCityAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { data: options = [], isLoading } = useCityAutocomplete(
    debouncedSearch,
    open,
  );

  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedSearch(search.trim()),
      300,
    );
    return () => window.clearTimeout(timer);
  }, [search]);

  return (
    <div className="w-full">
      <FieldLabel htmlFor={id} required={required} invalid={invalid}>
        {label}
      </FieldLabel>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            id={id}
            type="button"
            aria-expanded={open}
            aria-invalid={invalid}
            className={cn(
              "flex h-9 w-full items-center justify-between rounded-lg border border-input bg-white px-3 text-sm font-medium text-[#334155]",
              invalid && "border-destructive",
            )}
          >
            <span className="flex min-w-0 items-center gap-2">
              <MapPin className="size-3.5 shrink-0 text-[#64748b]" />
              <span className="truncate">{value || placeholder}</span>
            </span>
            {value ? (
              <span
                role="button"
                tabIndex={0}
                aria-label="Clear city"
                onClick={(event) => {
                  event.stopPropagation();
                  onChange("");
                }}
                className="rounded p-0.5 text-[#64748b] hover:bg-[#e2e8f0]"
              >
                <X className="size-4" />
              </span>
            ) : (
              <ChevronDown className={cn("size-4", open && "rotate-180")} />
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-(--radix-popover-trigger-width) overflow-hidden rounded-lg border border-input bg-white p-0"
        >
          <div className="border-b border-[#f1f5f9] p-2.5">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 size-3.5 text-[#94a3b8]" />
              <input
                autoFocus
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search cities..."
                className="h-8.5 w-full rounded-lg border border-[#e2e8f0] bg-[#f8fafc] pl-8 text-xs outline-none"
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto p-1.5">
            {isLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="size-4 animate-spin text-[#0b63e5]" />
              </div>
            ) : options.length === 0 ? (
              <p className="py-3 text-center text-xs text-muted-foreground">
                No matching city.
              </p>
            ) : (
              options.map((option) => (
                <button
                  key={option.city}
                  type="button"
                  onClick={() => {
                    onChange(option.city);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs hover:bg-[#f8fafc]",
                    value === option.city && "bg-[#eff6ff] text-[#1d4ed8]",
                  )}
                >
                  {option.city}
                  {value === option.city && <Check className="size-3.5" />}
                </button>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
