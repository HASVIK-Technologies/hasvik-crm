"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchWithSuggestionsProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  placeholder?: string;
  wrapperClassName?: string;
  className?: string;
  isSearching?: boolean;
}

export default function SearchWithSuggestions({
  searchTerm,
  onSearchTermChange,
  placeholder = "Search by business name or phone number...",
  wrapperClassName,
  className,
  isSearching = false,
}: SearchWithSuggestionsProps) {
  // Local input state for instant responsive typing without keystroke delay
  const [inputValue, setInputValue] = useState(searchTerm);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync with external resets (e.g. Reset filters button or URL change)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInputValue(searchTerm);
  }, [searchTerm]);

  const triggerSearch = (val: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    const cleanQuery = val.trim().toLowerCase();
    if (cleanQuery !== searchTerm.toLowerCase().trim()) {
      onSearchTermChange(cleanQuery);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVal = e.target.value;
    setInputValue(nextVal);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Debounce search input by 350ms before triggering server-side request
    debounceTimerRef.current = setTimeout(() => {
      triggerSearch(nextVal);
    }, 350);
  };

  const handleClear = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setInputValue("");
    onSearchTermChange("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      triggerSearch(inputValue);
    } else if (e.key === "Escape") {
      handleClear();
    }
  };

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div className={cn("relative flex items-center w-full", wrapperClassName)}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />

      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label={placeholder.replace(/\.+$/, "")}
        className={cn(
          "h-11 w-full rounded-xl border border-line bg-surface pl-10 pr-10 text-base text-ink shadow-card transition-colors placeholder:text-muted hover:border-muted focus-visible:border-brand-strong focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-(--ring) sm:h-10 sm:text-sm",
          Boolean(inputValue) && "border-brand/40",
          className,
        )}
      />

      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {isSearching && (
          <Loader2 className="size-3.5 animate-spin text-brand-strong" />
        )}
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="grid size-7 place-items-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-ink"
            aria-label="Clear search"
            title="Clear search"
          >
            <X className="size-4" aria-hidden />
          </button>
        )}
      </div>
    </div>
  );
}
