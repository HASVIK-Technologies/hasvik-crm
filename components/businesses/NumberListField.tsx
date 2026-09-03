"use client";

import { Trash2, type LucideIcon } from "lucide-react";
import MobileInput from "@/components/common/MobileInput";
import FieldLabel from "@/components/businesses/FieldLabel";
import { cn } from "@/lib/utils";

export default function NumberListField({
  label,
  addLabel,
  addIcon: AddIcon,
  values,
  onChange,
  required = false,
  disabled = false,
  headerAction,
}: {
  label: string;
  addLabel: string;
  addIcon: LucideIcon;
  values: string[];
  onChange: (values: string[]) => void;
  required?: boolean;
  /** Greys out and locks the number inputs (used while a field is synced
   * from elsewhere, e.g. WhatsApp mirroring Phone). Add/remove buttons stay
   * usable regardless, so the number of rows can still be adjusted. */
  disabled?: boolean;
  headerAction?: React.ReactNode;
}) {
  const updateAt = (index: number, value: string) => {
    onChange(values.map((v, i) => (i === index ? value : v)));
  };

  const removeAt = (index: number) => {
    if (values.length === 1) return;
    onChange(values.filter((_, i) => i !== index));
  };

  const add = () => {
    onChange([...values, ""]);
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <FieldLabel required={required} className="mb-0">
          {label}
        </FieldLabel>
        {headerAction}
      </div>
      <div className="flex flex-col gap-2">
        {values.map((value, index) => {
          const canRemove = values.length > 1;
          return (
            <div key={index} className="flex items-center gap-2">
              <MobileInput
                value={value}
                onChange={(v) => updateAt(index, v)}
                disabled={disabled}
              />
              <button
                type="button"
                aria-label="Remove number"
                onClick={() => removeAt(index)}
                disabled={!canRemove}
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                  canRemove
                    ? "bg-red-50 text-red-500 hover:bg-red-100"
                    : "cursor-not-allowed bg-[#f3f5f6] text-[#c3ccd1]",
                )}
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          );
        })}
        <button
          type="button"
          onClick={add}
          className="flex h-10 items-center justify-center gap-1.5 rounded-lg border border-dashed border-[#cfe0e6] text-sm font-medium text-[#08765d] transition-colors hover:bg-[#f3faf7]"
        >
          <AddIcon className="size-4" />
          {addLabel}
        </button>
      </div>
    </div>
  );
}
