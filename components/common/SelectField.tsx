"use client";

import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface SelectFieldOption {
  value: string;
  label: string;
}

// Radix does not allow an empty string as an item value, so "no choice" travels as this token.
const EMPTY = "__empty__";

/**
 * The one dropdown for short fixed lists (stage, role, hour, report filters ...). It replaces every native <select>
 * so the control, its list and its focus ring look and behave the same everywhere, in both themes.
 */
export default function SelectField({ value, defaultValue = "", name, onChange, options, placeholder, ariaLabel, id, disabled, invalid, className }: {
  value?: string;
  /** For plain <form>s: start value when `value` is not controlled. */
  defaultValue?: string;
  /** Submits the choice with the surrounding form. */
  name?: string;
  onChange?: (value: string) => void;
  options: SelectFieldOption[];
  placeholder?: string;
  /** Required when there is no visible <label> pointing at `id`. */
  ariaLabel?: string;
  id?: string;
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
}) {
  const [inner, setInner] = useState(defaultValue);
  const actual = value ?? inner;
  const current = actual === "" && options.some((option) => option.value === "") ? EMPTY : actual;
  return (
    <>
    {name && <input type="hidden" name={name} value={actual} />}
    <Select value={current} onValueChange={(next) => { const real = next === EMPTY ? "" : next; setInner(real); onChange?.(real); }} disabled={disabled}>
      <SelectTrigger id={id} aria-label={ariaLabel} aria-invalid={invalid} className={cn("w-full", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value || EMPTY} value={option.value === "" ? EMPTY : option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    </>
  );
}
