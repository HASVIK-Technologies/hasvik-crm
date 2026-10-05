"use client";

import { Bell } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
}

export default function FollowUpReminderSelect({
  value,
  onChange,
  options,
  placeholder = "Select reminder",
  className = "h-10 text-xs",
  invalid = false,
  showIcon = false,
  emptyOption,
}: FollowUpReminderSelectProps) {
  const allOptions = emptyOption ? [emptyOption, ...options] : options;

  return (
    <Select value={value || undefined} onValueChange={onChange}>
      <SelectTrigger className={className} aria-invalid={invalid}>
        {showIcon ? (
          <span className="flex items-center gap-2">
            <Bell className="size-3.5 text-[#94a3b8]" />
            <SelectValue placeholder={placeholder} />
          </span>
        ) : (
          <SelectValue placeholder={placeholder} />
        )}
      </SelectTrigger>
      <SelectContent className="bg-white">
        {allOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
