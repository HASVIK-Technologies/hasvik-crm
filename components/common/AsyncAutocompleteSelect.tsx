"use client";

import { useId, useState, type ComponentType } from "react";
import { Check, ChevronDown, Loader2, Search, X } from "lucide-react";
import type { LucideProps } from "lucide-react";
import FieldLabel from "@/components/businesses/FieldLabel";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface AutocompleteSelectOption {
  value: string;
  label: string;
}

interface AsyncAutocompleteSelectProps {
  id?: string;
  label?: string;
  value: string;
  valueLabel?: string;
  onChange: (value: string, label: string) => void;
  options: AutocompleteSelectOption[];
  loading?: boolean;
  searchValue: string;
  onSearchChange: (search: string) => void;
  onOpenChange?: (open: boolean) => void;
  placeholder: string;
  searchPlaceholder: string;
  emptyMessage: string;
  icon: ComponentType<LucideProps>;
  required?: boolean;
  invalid?: boolean;
  emptyOption?: { value: string; label: string };
  className?: string;
}

export default function AsyncAutocompleteSelect({
  id,
  label,
  value,
  valueLabel,
  onChange,
  options,
  loading = false,
  searchValue,
  onSearchChange,
  onOpenChange,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  icon: Icon,
  required,
  invalid = false,
  emptyOption,
  className,
}: AsyncAutocompleteSelectProps) {
  const [open, setOpen] = useState(false);
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const listId = `${controlId}-options`;
  const selectedLabel =
    options.find((option) => option.value === value)?.label ??
    valueLabel ??
    "";

  const select = (nextValue: string, nextLabel: string) => {
    onChange(nextValue, nextLabel);
    setOpen(false);
  };

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <FieldLabel htmlFor={controlId} required={required} invalid={invalid}>
          {label}
        </FieldLabel>
      )}
      <Popover
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          onOpenChange?.(nextOpen);
        }}
      >
        <div className="flex h-10 w-full items-center rounded-xl border border-[#e2e8f0] bg-white transition-colors focus-within:border-[#0b63e5]">
          <PopoverTrigger asChild>
            <button
              id={controlId}
              type="button"
              role="combobox"
              aria-controls={listId}
              aria-expanded={open}
              aria-invalid={invalid}
              className={cn(
                "flex h-full min-w-0 flex-1 items-center gap-2 rounded-xl px-3 text-left text-xs font-medium text-[#334155] outline-none",
                !selectedLabel && "text-[#64748b]",
              )}
            >
              <Icon className="size-3.5 shrink-0 text-[#64748b]" />
              <span className="min-w-0 flex-1 truncate">
                {selectedLabel || placeholder}
              </span>
              <ChevronDown
                className={cn(
                  "size-4 shrink-0 text-[#64748b] transition-transform",
                  open && "rotate-180",
                )}
              />
            </button>
          </PopoverTrigger>
          {value && (
            <button
              type="button"
              aria-label={`Clear ${label ?? placeholder}`}
              onClick={() => onChange("", "")}
              className="mr-2 rounded p-1 text-[#94a3b8] hover:bg-[#f1f5f9] hover:text-[#334155]"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
        <PopoverContent
          align="start"
          className="w-(--radix-popover-trigger-width) overflow-hidden rounded-xl border border-[#e2e8f0] bg-white p-0 shadow-xl"
        >
          <div className="border-b border-[#f1f5f9] p-2.5">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 size-3.5 text-[#94a3b8]" />
              <input
                autoFocus
                value={searchValue}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                className="h-8.5 w-full rounded-lg border border-[#e2e8f0] bg-[#f8fafc] pl-8 text-xs outline-none focus:border-[#0b63e5] focus:bg-white"
              />
            </div>
          </div>
          <div
            id={listId}
            role="listbox"
            aria-label={label ?? placeholder}
            className="max-h-60 overflow-y-auto p-1.5"
          >
            {emptyOption && (
              <button
                type="button"
                role="option"
                aria-selected={!value}
                onClick={() => select(emptyOption.value, emptyOption.label)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs hover:bg-[#f8fafc]",
                  !value && "bg-[#eff6ff] text-[#1d4ed8]",
                )}
              >
                {emptyOption.label}
                {!value && <Check className="size-3.5" />}
              </button>
            )}
            {loading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="size-4 animate-spin text-[#0b63e5]" />
              </div>
            ) : options.length === 0 ? (
              <p className="px-2.5 py-5 text-center text-xs text-[#94a3b8]">
                {emptyMessage}
              </p>
            ) : (
              options.map((option) => (
                <button
                  type="button"
                  role="option"
                  aria-selected={value === option.value}
                  key={option.value}
                  onClick={() => select(option.value, option.label)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs hover:bg-[#f8fafc]",
                    value === option.value && "bg-[#eff6ff] text-[#1d4ed8]",
                  )}
                >
                  {option.label}
                  {value === option.value && <Check className="size-3.5" />}
                </button>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
