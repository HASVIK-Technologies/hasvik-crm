"use client";

import FollowUpAutocomplete from "@/components/follow-ups/FollowUpAutocomplete";
import type { FollowUpOption } from "@/types/follow-up";

interface AssigneeAutocompleteProps {
  value?: string;
  label?: string;
  onChange: (option?: FollowUpOption) => void;
  placeholder?: string;
  invalid?: boolean;
}

export default function AssigneeAutocomplete({
  value,
  label,
  onChange,
  placeholder = "Select team member",
  invalid = false,
}: AssigneeAutocompleteProps) {
  return (
    <FollowUpAutocomplete
      kind="user"
      value={value}
      label={label}
      onChange={onChange}
      placeholder={placeholder}
      invalid={invalid}
    />
  );
}
