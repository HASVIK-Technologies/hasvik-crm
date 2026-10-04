"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FOLLOW_UP_TYPE_OPTIONS } from "@/lib/business-form-options";
import type { FollowUpType } from "@/types/follow-up";

interface FollowUpTypeSelectProps {
  value: FollowUpType | "";
  onChange: (value: FollowUpType) => void;
  placeholder?: string;
  className?: string;
  invalid?: boolean;
}

export default function FollowUpTypeSelect({
  value,
  onChange,
  placeholder = "Select follow-up type",
  className = "h-10 text-xs",
  invalid = false,
}: FollowUpTypeSelectProps) {
  return (
    <Select
      value={value || undefined}
      onValueChange={(selected) => onChange(selected as FollowUpType)}
    >
      <SelectTrigger className={className} aria-invalid={invalid}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-white">
        {FOLLOW_UP_TYPE_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
