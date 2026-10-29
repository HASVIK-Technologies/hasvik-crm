"use client";

import { Activity } from "lucide-react";
import TypeaheadField from "@/components/common/TypeaheadField";
import { useFollowUpStatusesQuery } from "@/hooks/use-follow-ups";
import { formatFollowUpStatus } from "@/lib/follow-ups/status";

interface FollowUpStatusSelectProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

/** Follow-up status filter. Empty means "All statuses". */
export default function FollowUpStatusSelect({ value = "", onChange, className }: FollowUpStatusSelectProps) {
  const { data: statuses = {} } = useFollowUpStatusesQuery();
  return (
    <TypeaheadField
      ariaLabel="Follow-up status"
      icon={Activity}
      placeholder="All statuses"
      options={Object.entries(statuses).map(([key, label]) => ({ value: key, label: formatFollowUpStatus(label || key) }))}
      value={value}
      onChange={(next) => onChange?.(next)}
      className={className}
    />
  );
}
