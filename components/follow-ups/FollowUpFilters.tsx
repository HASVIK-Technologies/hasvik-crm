"use client";

import ResponsiveFilters, { type ResponsiveFilter } from "@/components/common/ResponsiveFilters";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FollowUpStatusSelect from "@/components/follow-ups/FollowUpStatusSelect";
import FollowUpAutocomplete from "@/components/follow-ups/FollowUpAutocomplete";
import AssigneeAutocomplete from "@/components/common/AssigneeAutocomplete";
import TagAutocomplete from "@/components/common/TagAutocomplete";
import FollowUpDateRange from "@/components/follow-ups/FollowUpDateRange";
import type {
  FollowUpFilters as Filters,
  FollowUpOption,
} from "@/types/follow-up";
import type { FollowUpView } from "@/components/follow-ups/FollowUpViewToggle";

interface Props {
  filters: Filters;
  setFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  reset: () => void;
  view: FollowUpView;
}

export default function FollowUpFilters({ filters, setFilter, reset, view }: Props) {
  const setOption = (key: "business" | "user", option?: FollowUpOption) => {
    if (key === "business") {
      setFilter("businessId", option?.id ?? "");
      setFilter("businessName", option?.label ?? "");
    } else {
      setFilter("assignedTo", option?.id ?? "");
      setFilter("assignedToName", option?.label ?? "");
    }
  };

  const usesDateRange = view === "table";

  const fields: ResponsiveFilter[] = [
    // 1. All Businesses
    {
      key: "business",
      label: "Business",
      active: Boolean(filters.businessId),
      reset: () => setOption("business"),
      control: (
        <FollowUpAutocomplete
          kind="business"
          value={filters.businessId}
          label={filters.businessName}
          onChange={(option) => setOption("business", option)}
          placeholder="All Businesses"
        />
      ),
    },
    // 2. All Team Members
    {
      key: "assignee",
      label: "Team member",
      active: Boolean(filters.assignedTo),
      reset: () => setOption("user"),
      control: (
        <AssigneeAutocomplete
          value={filters.assignedTo}
          label={filters.assignedToName}
          onChange={(option) => setOption("user", option)}
          placeholder="All Team Members"
        />
      ),
    },
    // 3. All Follow-up Statuses
    {
      key: "status",
      label: "Status",
      active: Boolean(filters.status),
      reset: () => setFilter("status", ""),
      control: (
        <FollowUpStatusSelect
          value={filters.status}
          onChange={(value) => setFilter("status", value)}
        />
      ),
    },
    // 4. All Tags (between Status and More Filters!)
    {
      key: "tag",
      label: "Tag",
      active: Boolean(filters.tagId),
      reset: () => {
        setFilter("tagId", "");
        setFilter("tagName", "");
      },
      control: (
        <TagAutocomplete
          value={filters.tagId}
          label={filters.tagName}
          onChange={(id, name) => {
            setFilter("tagId", id);
            setFilter("tagName", name ?? "");
          }}
          entityType="FOLLOWUP"
          placeholder="All Tags"
        />
      ),
    },
    // 5. Type (inside More Filters)
    {
      key: "type",
      label: "Type",
      active: Boolean(filters.type),
      reset: () => setFilter("type", ""),
      control: (
        <Select
          value={filters.type || "ALL"}
          onValueChange={(value) => setFilter("type", value === "ALL" ? "" : value)}
        >
          <SelectTrigger className="w-full bg-white text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="CALL">Call</SelectItem>
            <SelectItem value="MEETING">Meeting</SelectItem>
            <SelectItem value="EMAIL">Email</SelectItem>
            <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
            <SelectItem value="OTHER">Other</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
  ];

  if (usesDateRange) {
    fields.push({
      key: "dates",
      label: "Date range",
      active: Boolean(filters.fromDate || filters.toDate),
      reset: () => {
        setFilter("fromDate", "");
        setFilter("toDate", "");
      },
      control: (
        <>
          <FollowUpDateRange
            from={filters.fromDate}
            to={filters.toDate}
            onChange={(from, to) => {
              setFilter("tab", "all");
              setFilter("fromDate", from);
              setFilter("toDate", to);
            }}
          />
          <p className="mt-1.5 text-[11px] leading-4 text-slate-500">
            Choosing a custom range switches to All follow-ups.
          </p>
        </>
      ),
    });
  }

  return <ResponsiveFilters fields={fields} onReset={reset} maxVisible={4} />;
}