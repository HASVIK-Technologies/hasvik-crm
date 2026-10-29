"use client";

import { Users } from "lucide-react";
import TypeaheadField from "@/components/common/TypeaheadField";
import { useBusinessStatuses } from "@/hooks/use-filter-options";
import { formatLeadStatus, STATUS_OPTIONS } from "@/lib/business/form-options";

interface LeadStatusSelectProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  id?: string;
  label?: string;
  required?: boolean;
  invalid?: boolean;
}

/** Stage filter. Empty means "All stages". */
export default function LeadStatusSelect({ value = "", onChange, className, id, label, required, invalid }: LeadStatusSelectProps) {
  const { data: statuses = {} } = useBusinessStatuses();
  return (
    <TypeaheadField
      id={id}
      label={label}
      ariaLabel="Stage"
      icon={Users}
      placeholder="All stages"
      options={STATUS_OPTIONS.map((option) => ({ value: option.value, label: formatLeadStatus(option.value, statuses) }))}
      value={value}
      onChange={(next) => onChange?.(next)}
      required={required}
      invalid={invalid}
      className={className}
    />
  );
}
