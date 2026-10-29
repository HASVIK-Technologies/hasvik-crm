"use client";

import { useState } from "react";
import { Search, UserRound } from "lucide-react";
import TypeaheadField from "@/components/common/TypeaheadField";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useFollowUpAutocomplete } from "@/hooks/use-follow-ups";
import type { FollowUpOption } from "@/types/follow-up";
import { useAuthStore } from "@/store/auth-store";

interface FollowUpAutocompleteProps {
  kind: "business" | "user";
  value?: string;
  label?: string;
  onChange: (option?: FollowUpOption) => void;
  placeholder: string;
  invalid?: boolean;
}

/** Business or team-member picker with server search. Clearing it means "any". */
export default function FollowUpAutocomplete({
  kind,
  value = "",
  label = "",
  onChange,
  placeholder,
  invalid = false,
}: FollowUpAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim(), 250);
  const path = kind === "business" ? "/businesses/autocomplete" : "/users/autocomplete";

  const isLabelMissingOrRawId = Boolean(!label || (value && label.trim().toLowerCase() === value.trim().toLowerCase()));
  const shouldFetchOptions = open || Boolean(value && isLabelMissingOrRawId);
  const { data: options = [], isFetching } = useFollowUpAutocomplete(path, debouncedSearch, shouldFetchOptions);

  const matchedOption = options.find((option) => option.id === value);
  const authUser = kind === "user" ? useAuthStore.getState().user : null;
  const authUserMatch =
    authUser && (authUser.userId === value || ("_id" in authUser && (authUser as { _id?: string })._id === value))
      ? authUser.fullName || `${authUser.firstName} ${authUser.lastName}`.trim()
      : undefined;
  const displayLabel = (!isLabelMissingOrRawId ? label : undefined) ?? matchedOption?.label ?? authUserMatch ?? "";

  return (
    <TypeaheadField
      ariaLabel={kind === "business" ? "Business" : "Team member"}
      icon={kind === "business" ? Search : UserRound}
      placeholder={placeholder}
      options={options.map((option) => ({ value: option.id, label: option.label, hint: option.subtitle }))}
      value={value}
      valueLabel={displayLabel}
      onChange={(next) => onChange(next ? options.find((option) => option.id === next) ?? { id: next, label: displayLabel } : undefined)}
      onQueryChange={setSearch}
      onOpenChange={setOpen}
      loading={open && isFetching && options.length === 0}
      emptyText={kind === "business" ? "No matching business." : "No matching team member."}
      invalid={invalid}
    />
  );
}
