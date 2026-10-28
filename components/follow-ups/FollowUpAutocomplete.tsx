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

import { useAuthStore } from "@/store/auth-store";

interface FollowUpAutocompleteProps {
  kind: "business" | "user";
  value?: string;
  label?: string;
  onChange: (option?: FollowUpOption) => void;
  placeholder: string;
  invalid?: boolean;
}

export default function FollowUpAutocomplete({
  kind,
  value = "",
  label = "",
  onChange,
  placeholder,
  invalid = false,
}: FollowUpAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const path =
    kind === "business" ? "/businesses/autocomplete" : "/users/autocomplete";

  const isLabelMissingOrRawId = Boolean(
    !label || (value && label.trim().toLowerCase() === value.trim().toLowerCase()),
  );
  const shouldFetchOptions = open || Boolean(value && isLabelMissingOrRawId);

  const { data: options = [], isLoading } = useFollowUpAutocomplete(
    path,
    debouncedSearch,
    shouldFetchOptions,
  );

  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedSearch(search.trim()),
      250,
    );
    return () => window.clearTimeout(timer);
  }, [search]);

  const matchedOption = options.find((opt) => opt.id === value);
  const authUser = kind === "user" ? useAuthStore.getState().user : null;
  const authUserMatch =
    authUser &&
    (authUser.userId === value ||
      ("_id" in authUser &&
        (authUser as { _id?: string })._id === value))
      ? authUser.fullName || `${authUser.firstName} ${authUser.lastName}`.trim()
      : undefined;

  const displayLabel =
    (!isLabelMissingOrRawId ? label : undefined) ??
    matchedOption?.label ??
    authUserMatch ??
    (!isLabelMissingOrRawId ? label : undefined) ??
    "";

  const Icon = kind === "business" ? Search : UserRound;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-expanded={open}
          className={cn(
            "flex h-10 w-full items-center justify-between border border-line bg-surface px-3 text-xs font-medium text-ink-soft shadow-card hover:border-muted focus-visible:border-brand-strong focus-visible:ring-2 focus-visible:ring-brand/15",
            value && "border-brand-strong/60 bg-brand-soft/40",
            invalid && "border-bad/30",
          )}
        >
          <span className="flex min-w-0 items-center gap-2">
            <Icon className="size-3.5 shrink-0 text-muted" />
            <span className="truncate">{displayLabel || placeholder}</span>
          </span>
          <span className="flex items-center gap-1">
            <span
              className={cn(
                "rounded p-0.5 text-muted hover:bg-line",
                !value && "invisible",
              )}
              onClick={(event) => {
                event.stopPropagation();
                onChange(undefined);
              }}
            >
              <X className="size-3.5" />
            </span>
            <ChevronDown className="size-3.5 text-muted" />
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-(--radix-popover-trigger-width) overflow-hidden border border-line bg-surface p-0 shadow-xl"
      >
        <div className="border-b border-surface-2 p-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 size-3.5 text-muted" />
            <input
              autoFocus
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={`Search ${kind === "business" ? "businesses" : "team members"}...`}
              className="h-8.5 w-full rounded-lg border border-line bg-surface-2 pl-8 text-xs outline-none"
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
            className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs hover:bg-surface-2"
          >
            Any {kind === "business" ? "business" : "team member"}
            {!value && <Check className="size-3.5 text-brand-strong" />}
          </button>
          {isLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="size-4 animate-spin text-brand-strong" />
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
                  "flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs hover:bg-surface-2",
                  value === option.id && "bg-btn/10 text-brand-strong",
                )}
              >
                <span>
                  <span className="block font-semibold">{option.label}</span>
                  {option.subtitle && (
                    <span className="text-[10px] text-muted">
                      {option.subtitle}
                    </span>
                  )}
                </span>
                {value === option.id && <Check className="size-3.5" />}
              </button>
            ))
          )}
          {!isLoading && options.length === 0 && (
            <p className="px-2.5 py-5 text-center text-xs text-muted">
              No matches found
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
