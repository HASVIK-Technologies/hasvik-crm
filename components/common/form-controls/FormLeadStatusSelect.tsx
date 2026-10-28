"use client";

import FieldLabel from "@/components/businesses/FieldLabel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useBusinessStatuses } from "@/hooks/use-filter-options";
import { formatLeadStatus, getLeadStatusVisual, STATUS_OPTIONS } from "@/lib/business/form-options";

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
  const statusKeys = Object.keys(statuses).length > 0
    ? Object.keys(statuses)
    : STATUS_OPTIONS.map((option) => option.value);

  return (
    <div>
      <FieldLabel htmlFor={id} required={required} invalid={invalid}>
        {label}
      </FieldLabel>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} aria-label="Lead status" aria-invalid={invalid} className="w-full">
          <span className="flex items-center gap-2 truncate text-left">
            {value && <span className={`size-2 shrink-0 ${getLeadStatusVisual(value).dot}`} />}
            {value ? formatLeadStatus(value, statuses) : "Select status"}
          </span>
        </SelectTrigger>
        <SelectContent>
          {statusKeys.map((status) => (
            <SelectItem key={status} value={status}>
              <span className="flex items-center gap-2">
                <span className={`size-2 shrink-0 ${getLeadStatusVisual(status).dot}`} />
                {formatLeadStatus(status, statuses)}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
