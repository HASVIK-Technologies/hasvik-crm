"use client";

import TypeaheadField from "@/components/common/TypeaheadField";
import { FOLLOW_UP_TYPE_OPTIONS } from "@/lib/business/form-options";
import type { FollowUpType } from "@/types/follow-up";

interface FollowUpTypeSelectProps {
  value: FollowUpType | "";
  onChange: (value: FollowUpType) => void;
  placeholder?: string;
  className?: string;
  invalid?: boolean;
  id?: string;
}

export default function FollowUpTypeSelect({
  value,
  onChange,
  placeholder = "Call, meeting, WhatsApp…",
  className,
  invalid = false,
  id,
}: FollowUpTypeSelectProps) {
  return (
    <TypeaheadField
      id={id}
      ariaLabel="Follow-up type"
      placeholder={placeholder}
      options={FOLLOW_UP_TYPE_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
      value={value}
      onChange={(next) => next && onChange(next as FollowUpType)}
      invalid={invalid}
      className={className}
    />
  );
}
