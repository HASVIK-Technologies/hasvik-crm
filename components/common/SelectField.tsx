"use client";

import { useState } from "react";
import TypeaheadField from "@/components/common/TypeaheadField";

export interface SelectFieldOption {
  value: string;
  label: string;
}

/**
 * A pick-one-from-a-list field with the same click-and-type feel as every other dropdown in the app (it is a
 * TypeaheadField underneath). Use it for fixed lists: filters, roles, rows per page, times. It also works inside a
 * plain <form>: pass `name` (and optionally `defaultValue`) and the choice is submitted with the form.
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
  return (
    <>
      {name && <input type="hidden" name={name} value={actual} />}
      <TypeaheadField
        id={id}
        ariaLabel={ariaLabel}
        placeholder={placeholder}
        options={options}
        value={actual}
        onChange={(next) => {
          setInner(next);
          onChange?.(next);
        }}
        clearable={false}
        disabled={disabled}
        invalid={invalid}
        className={className}
      />
    </>
  );
}
