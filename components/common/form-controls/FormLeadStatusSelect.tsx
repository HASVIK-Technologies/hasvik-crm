"use client";

import FieldLabel from "@/components/businesses/FieldLabel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useBusinessStatuses } from "@/hooks/use-filter-options";

interface FormLeadStatusSelectProps {
  id?: string;
  label: string;
  value?: string;
  onChange: (value: string) => void;
  required?: boolean;
  invalid?: boolean;
}

export default function FormLeadStatusSelect({
  id,
  label,
  value = "",
  onChange,
  required,
  invalid,
}: FormLeadStatusSelectProps) {
  const { data: statuses = {} } = useBusinessStatuses();

  return (
    <div>
      <FieldLabel htmlFor={id} required={required} invalid={invalid}>
        {label}
      </FieldLabel>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} aria-invalid={invalid} className="w-full">
          <span className="truncate text-left">
            {value ? statuses[value] ?? value : "Select status"}
          </span>
        </SelectTrigger>
        <SelectContent>
          {Object.entries(statuses).map(([status, displayName]) => (
            <SelectItem key={status} value={status}>
              {displayName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
