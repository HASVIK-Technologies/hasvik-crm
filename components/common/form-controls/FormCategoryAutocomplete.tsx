"use client";

import { useEffect, useState } from "react";
import { Check, ChevronDown, Loader2, Search, Tag, X } from "lucide-react";
import FieldLabel from "@/components/businesses/FieldLabel";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCategoryAutocomplete } from "@/hooks/use-filter-options";
import { cn } from "@/lib/utils";

interface FormCategoryAutocompleteProps {
  id?: string;
  label: string;
  value?: string;
  valueLabel?: string;
  onChange: (id: string) => void;
  placeholder?: string;
  required?: boolean;
  invalid?: boolean;
}

export default function FormCategoryAutocomplete({
  id,
  label,
  value = "",
  valueLabel = "",
  onChange,
  placeholder = "Select a category",
  required,
  invalid,
}: FormCategoryAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
    const [picked, setPicked] = useState<{ id: string; name: string } | null>(
      null,
    );
    // Derived from the form value so Reset / prefill always show the right text.
    const selectedLabel = !value
      ? ""
      : picked?.id === value
        ? picked.name
        : valueLabel;
  const { data: options = [], isLoading } = useCategoryAutocomplete(
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
              <Tag className="size-3.5 shrink-0 text-[#64748b]" />
              <span className="truncate">{selectedLabel || placeholder}</span>
            </span>
            <ChevronDown className={cn("size-4", open && "rotate-180")} />
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
                placeholder="Search categories..."
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
                No matching category.
              </p>
            ) : (
              options.map((option) => (
                <button
                  key={option._id}
                  type="button"
                  onClick={() => {
                    onChange(option._id);
                    setPicked({ id: option._id, name: option.name });
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs hover:bg-[#f8fafc]",
                    value === option._id && "bg-[#eff6ff] text-[#1d4ed8]",
                  )}
                >
                  {option.name}
                  {value === option._id && <Check className="size-3.5" />}
                </button>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
