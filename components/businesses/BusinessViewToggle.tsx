"use client";

import { Columns3, List } from "lucide-react";
import SegmentedControl from "@/components/common/SegmentedControl";
import type { BusinessListView } from "@/store/business-list-store";

export type BusinessView = BusinessListView;

export default function BusinessViewToggle({
  value,
  onChange,
}: {
  value: BusinessView;
  onChange: (value: BusinessView) => void;
}) {
  return (
    <SegmentedControl
      ariaLabel="Business view"
      value={value}
      onChange={onChange}
      options={[
        { value: "table", label: "Table", shortLabel: "List", icon: List },
        { value: "kanban", label: "Kanban", shortLabel: "Board", icon: Columns3 },
      ]}
    />
  );
}
