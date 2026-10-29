"use client";

import TypeaheadField from "@/components/common/TypeaheadField";
import { useBusinessStatuses } from "@/hooks/use-filter-options";
import { formatLeadStatus, STATUS_OPTIONS } from "@/lib/business/form-options";

interface FormLeadStatusSelectProps {
  id?: string;
  label: string;
  value?: string;
  onChange: (value: string) => void;
  required?: boolean;
  invalid?: boolean;
}

export default function FormLeadStatusSelect({
  id,
  label,
  value = "",
  onChange,
  required,
  invalid,
}: FormLeadStatusSelectProps) {
  const { data: statuses = {} } = useBusinessStatuses();
  // Always the shared stage order; the API's list only supplies names when it has them.
  const options = STATUS_OPTIONS.map((option) => ({ value: option.value, label: formatLeadStatus(option.value, statuses) }));

  return (
    <TypeaheadField
      id={id}
      label={label}
      ariaLabel="Stage"
      clearable={false}
      placeholder="Select a stage"
      options={options}
      value={value}
      onChange={(next) => onChange(next)}
      required={required}
      invalid={invalid}
    />
  );
}
