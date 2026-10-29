"use client";

import TypeaheadField from "@/components/common/TypeaheadField";
import { STATE_OPTIONS } from "@/lib/business/form-options";

interface StateAutocompleteProps {
  value?: string;
  onChange?: (state: string) => void;
  id?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  invalid?: boolean;
}

const OPTIONS = STATE_OPTIONS.map((state) => ({ value: state, label: state }));

export default function StateAutocomplete({
  value = "",
  onChange,
  id,
  label,
  placeholder = "Start typing a state or union territory",
  required = false,
  invalid = false,
}: StateAutocompleteProps) {
  return (
    <TypeaheadField
      id={id}
      label={label}
      ariaLabel="State"
      placeholder={placeholder}
      options={OPTIONS}
      value={value}
      onChange={(next) => onChange?.(next)}
      emptyText="No matching state or union territory."
      required={required}
      invalid={invalid}
    />
  );
}
