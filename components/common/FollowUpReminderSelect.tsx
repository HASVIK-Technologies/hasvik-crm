"use client";

import { Bell } from "lucide-react";
import TypeaheadField from "@/components/common/TypeaheadField";

export interface FollowUpReminderOption {
  value: string;
  label: string;
}

interface FollowUpReminderSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: FollowUpReminderOption[];
  placeholder?: string;
  className?: string;
  invalid?: boolean;
  showIcon?: boolean;
  emptyOption?: FollowUpReminderOption;
  id?: string;
}

export default function FollowUpReminderSelect({
  value,
  onChange,
  options,
  placeholder = "Select reminder",
  className,
  invalid = false,
  showIcon = false,
  emptyOption,
  id,
}: FollowUpReminderSelectProps) {
  const baseOptions = emptyOption ? [emptyOption, ...options] : options;
  const allOptions = value && !baseOptions.some((option) => option.value === value)
    ? [...baseOptions, { value, label: value }]
    : baseOptions;
  return (
    <TypeaheadField
      id={id}
      ariaLabel="Reminder"
      icon={showIcon ? Bell : undefined}
      placeholder={placeholder}
      options={allOptions}
      value={value}
      onChange={(next) => onChange(next || (emptyOption?.value ?? ""))}
      invalid={invalid}
      className={className}
    />
  );
}
