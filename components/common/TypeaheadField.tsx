"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import FieldLabel from "@/components/businesses/FieldLabel";
import { fold } from "@/lib/location/normalise";
import { cn } from "@/lib/utils";

export interface TypeaheadOption {
  value: string;
  label: string;
  /** Second line in the list, e.g. "Uttar Pradesh" under a city, or "From pincode 277001". */
  hint?: string;
}

const CUSTOM = "\u0000use:";

/**
 * The one dropdown for the whole app: click it and start typing, the list narrows as you type, Enter or tap picks.
 * Works with a fixed list (stage, type, reminder), with server search (`onQueryChange` + `loading`), and with free
 * text (`allowCustom`, e.g. a city that is not in any list yet).
 */
export default function TypeaheadField({
  id,
  label,
  ariaLabel,
  placeholder,
  options,
  value,
  valueLabel,
  onChange,
  onQueryChange,
  onOpenChange,
  loading = false,
  allowCustom = false,
  clearable = true,
  emptyText = "No matches.",
  required = false,
  invalid = false,
  disabled = false,
  icon: Icon,
  className,
}: {
  id?: string;
  label?: string;
  /** Needed when there is no visible label. */
  ariaLabel?: string;
  placeholder?: string;
  options: TypeaheadOption[];
  /** The selected option's value ("" for none). */
  value: string;
  /** Label for `value` when it is not in `options` yet (e.g. an edit form before the list loads). */
  valueLabel?: string;
  onChange: (value: string, label: string) => void;
  onQueryChange?: (query: string) => void;
  onOpenChange?: (open: boolean) => void;
  loading?: boolean;
  allowCustom?: boolean;
  /** Show a clear (×) button once something is chosen. Lists that always have a value (filters with an "All" choice) turn it off. */
  clearable?: boolean;
  emptyText?: string;
  required?: boolean;
  invalid?: boolean;
  disabled?: boolean;
  icon?: LucideIcon;
  className?: string;
}) {
  // `draft` is what the user is typing; null means "show the selected label".
  const [draft, setDraft] = useState<string | null>(null);
  const selected = options.find((option) => option.value === value);
  const selectedLabel = selected?.label ?? valueLabel ?? (allowCustom ? value : "");
  const query = fold(draft ?? "");
  const visible = draft === null || !query
    ? options
    : options.filter((option) => fold(option.label).includes(query) || fold(option.hint ?? "").includes(query));
  const typed = (draft ?? "").trim();
  const showCustom = allowCustom && typed.length > 0 && !visible.some((option) => fold(option.label) === fold(typed));
  const items = [...visible.map((option) => option.label), ...(showCustom ? [CUSTOM + typed] : [])];

  const pick = (label: string | null) => {
    setDraft(null);
    onQueryChange?.("");
    if (!label) return onChange("", "");
    if (label.startsWith(CUSTOM)) {
      const text = label.slice(CUSTOM.length);
      return onChange(text, text);
    }
    const option = visible.find((item) => item.label === label) ?? options.find((item) => item.label === label);
    if (option) onChange(option.value, option.label);
  };

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <FieldLabel htmlFor={id} required={required} invalid={invalid}>
          {label}
        </FieldLabel>
      )}
      <Combobox
        items={items}
        filter={null}
        value={selectedLabel || null}
        inputValue={draft ?? selectedLabel}
        disabled={disabled}
        openOnInputClick
        onValueChange={(next) => pick((next as string | null) ?? null)}
        onInputValueChange={(next) => {
          setDraft(next);
          onQueryChange?.(next);
        }}
        onOpenChange={(open) => {
          onOpenChange?.(open);
          if (open) return;
          // Leaving the field: keep free text for fields that allow it, otherwise go back to the chosen value.
          if (allowCustom && draft !== null && draft.trim() !== selectedLabel) {
            const text = draft.trim();
            setDraft(null);
            onChange(text, text);
          } else {
            setDraft(null);
          }
        }}
      >
        <div className="relative">
          {Icon && <Icon className="pointer-events-none absolute top-1/2 left-3.5 z-10 size-4 -translate-y-1/2 text-muted" aria-hidden />}
          <ComboboxInput
            id={id}
            aria-label={label ? undefined : ariaLabel}
            placeholder={placeholder}
            aria-invalid={invalid}
            disabled={disabled}
            className={cn("h-11 w-full rounded-xl sm:h-10", Icon && "[&_input]:pl-10")}
            showTrigger={!(clearable && value)}
            showClear={clearable && Boolean(value) && !disabled}
          />
        </div>
        <ComboboxContent className="rounded-xl">
          <ComboboxList>
            {loading && <p role="status" className="px-3 py-2 text-sm text-muted">Searching…</p>}
            {!loading && <ComboboxEmpty>{emptyText}</ComboboxEmpty>}
            {items.map((item) => {
              if (item.startsWith(CUSTOM)) {
                return (
                  <ComboboxItem key={item} value={item} className="min-h-11 px-2.5 text-sm">
                    Use “{item.slice(CUSTOM.length)}”
                  </ComboboxItem>
                );
              }
              const option = visible.find((entry) => entry.label === item);
              return (
                <ComboboxItem key={item} value={item} className="min-h-11 px-2.5 text-sm">
                  <span className="min-w-0">
                    <span className="block truncate">{item}</span>
                    {option?.hint && <span className="block truncate text-xs text-muted">{option.hint}</span>}
                  </span>
                </ComboboxItem>
              );
            })}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}
