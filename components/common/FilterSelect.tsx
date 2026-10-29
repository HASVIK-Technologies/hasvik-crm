"use client";

import { useId } from "react";
import SelectField from "@/components/common/SelectField";
import { cn } from "@/lib/utils";

/** Labelled dropdown for filters (report, forecast, audit): a visible label above the shared select. */
export default function FilterSelect({ label, value, onChange, options, className }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  const id = useId();
  return (
    <div className={cn("min-w-0", className)}>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-muted">{label}</label>
      <SelectField id={id} value={value} onChange={onChange} options={options} />
    </div>
  );
}
