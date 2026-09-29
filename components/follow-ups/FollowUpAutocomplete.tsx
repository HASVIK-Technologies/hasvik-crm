"use client";

import { useEffect, useState } from "react";
import {
  Check,
  ChevronDown,
  Loader2,
  Search,
  UserRound,
  X,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useFollowUpAutocomplete } from "@/hooks/use-follow-ups";
import type { FollowUpOption } from "@/types/follow-up";
import { cn } from "@/lib/utils";

interface FollowUpAutocompleteProps {
  kind: "business" | "user";
  value?: string;
  label?: string;
  onChange: (option?: FollowUpOption) => void;
  placeholder: string;
}

export default function FollowUpAutocomplete({
  kind,
  value = "",
  label = "",
  onChange,
  placeholder,
}: FollowUpAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const path =
    kind === "business" ? "/businesses/autocomplete" : "/users/autocomplete";
  const { data: options = [], isLoading } = useFollowUpAutocomplete(
    path,
    debouncedSearch,
    open,
  );

  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedSearch(search.trim()),
      250,
    );
    return () => window.clearTimeout(timer);
  }, [search]);

  const Icon = kind === "business" ? Search : UserRound;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-expanded={open}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-xl border border-[#e2e8f0] bg-white px-3 text-xs font-medium text-[#334155]",
            value && "border-[#0b63e5]/50 bg-[#f8faff]",
          )}
        >
          <span className="flex min-w-0 items-center gap-2">
            <Icon className="size-3.5 shrink-0 text-[#64748b]" />
            <span className="truncate">{label || placeholder}</span>
          </span>
          <span className="flex items-center gap-1">
            <span
              className={cn(
                "rounded p-0.5 text-[#94a3b8] hover:bg-[#e2e8f0]",
                !value && "invisible",
              )}
              onClick={(event) => {
                event.stopPropagation();
                onChange(undefined);
              }}
            >
              <X className="size-3.5" />
            </span>
            <ChevronDown className="size-3.5 text-[#64748b]" />
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-72 overflow-hidden rounded-2xl bg-white p-0"
      >
        <div className="border-b border-[#f1f5f9] p-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 size-3.5 text-[#94a3b8]" />
            <input
              autoFocus
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={`Search ${kind === "business" ? "businesses" : "team members"}...`}
              className="h-8.5 w-full rounded-lg border border-[#e2e8f0] bg-[#f8fafc] pl-8 text-xs outline-none"
            />
          </div>
        </div>
        <div className="max-h-60 overflow-y-auto p-1.5">
          <button
            type="button"
            onClick={() => {
              onChange(undefined);
              setOpen(false);
            }}
            className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs hover:bg-[#f8fafc]"
          >
            Any {kind === "business" ? "business" : "team member"}
            {!value && <Check className="size-3.5 text-[#0b63e5]" />}
          </button>
          {isLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="size-4 animate-spin text-[#0b63e5]" />
            </div>
          ) : (
            options.map((option) => (
              <button
                type="button"
                key={option.id}
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs hover:bg-[#f8fafc]",
                  value === option.id && "bg-[#eff6ff] text-[#1d4ed8]",
                )}
              >
                <span>
                  <span className="block font-semibold">{option.label}</span>
                  {option.subtitle && (
                    <span className="text-[10px] text-[#94a3b8]">
                      {option.subtitle}
                    </span>
                  )}
                </span>
                {value === option.id && <Check className="size-3.5" />}
              </button>
            ))
          )}
          {!isLoading && options.length === 0 && (
            <p className="px-2.5 py-5 text-center text-xs text-[#94a3b8]">
              No matches found
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
