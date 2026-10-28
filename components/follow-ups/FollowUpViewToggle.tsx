"use client";

import { CalendarDays, List } from "lucide-react";
import SegmentedControl from "@/components/common/SegmentedControl";

export type FollowUpView = "table" | "calendar";

export default function FollowUpViewToggle({
  value,
  onChange,
}: {
  value: FollowUpView;
  onChange: (view: FollowUpView) => void;
}) {
  return (
    <SegmentedControl
      ariaLabel="Follow-up view"
      value={value}
      onChange={onChange}
      options={[
        { value: "table", label: "Table", shortLabel: "List", icon: List },
        { value: "calendar", label: "Calendar", icon: CalendarDays },
      ]}
    />
  );
}
