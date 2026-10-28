"use client";

import { CircleMinus } from "lucide-react";
import PlainButton from "@/components/common/PlainButton";
import FieldLabel from "@/components/businesses/FieldLabel";
import { cn } from "@/lib/utils";

export default function NumberListField({
  label,
  addLabel,
  addIcon: AddIcon,
  required = false,
  headerAction,
  rowKeys,
  onAdd,
  onRemove,
  renderRow,
  renderRowActions,
}: {
  label: string;
  addLabel: string;
  addIcon: React.ComponentType<{ className?: string }>;
  required?: boolean;
  headerAction?: React.ReactNode;
  /** Stable keys for each row - use each field's `id` from useFieldArray. */
  rowKeys: string[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  /** Renders the actual input for a given row index (owned by the caller,
   * typically a react-hook-form Controller wrapping MobileInput). */
  renderRow: (index: number) => React.ReactNode;
  /** Optional extra button(s) per row, rendered between the input and the
   * remove button - e.g. the "mark as WhatsApp number" toggle on Phone rows. */
  renderRowActions?: (index: number) => React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <FieldLabel required={required} className="mb-0">
          {label}
        </FieldLabel>
        {headerAction}
      </div>
      <div className="flex flex-col gap-2">
        {rowKeys.map((key, index) => {
          const canRemove = rowKeys.length > 1;
          return (
            <div key={key} className="flex items-center gap-2">
              {renderRow(index)}
              {renderRowActions?.(index)}
              <button
                type="button"
                aria-label="Remove number"
                onClick={() => onRemove(index)}
                disabled={!canRemove}
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                  canRemove
                    ? "bg-surface-2 text-brand-strong hover:bg-surface-2 hover:text-brand-strong"
                    : "cursor-not-allowed bg-surface-2 text-muted",
                )}
              >
                <CircleMinus className="size-4" />
              </button>
            </div>
          );
        })}
        <PlainButton
          type="button"
          onClick={onAdd}
          className="h-10 justify-center gap-1.5 rounded-lg border border-dashed border-line text-sm font-medium text-accent-strong hover:bg-surface-2/10 hover:text-accent-strong"
        >
          <AddIcon className="size-4" />
          {addLabel}
        </PlainButton>
      </div>
    </div>
  );
}
