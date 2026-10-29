"use client";

import { CircleMinus } from "lucide-react";
import PlainButton from "@/components/common/PlainButton";
import FieldLabel from "@/components/businesses/FieldLabel";

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
              {canRemove && (
                <button
                  type="button"
                  aria-label={`Remove number ${index + 1}`}
                  onClick={() => onRemove(index)}
                  className="grid size-11 shrink-0 place-items-center rounded-xl text-muted transition-colors hover:bg-bad-soft hover:text-bad sm:size-10"
                >
                  <CircleMinus className="size-5" aria-hidden />
                </button>
              )}
            </div>
          );
        })}
        <PlainButton
          type="button"
          onClick={onAdd}
          className="h-11 justify-center gap-1.5 rounded-xl border border-dashed border-line text-sm font-semibold text-brand-strong hover:bg-brand-soft sm:h-10"
        >
          <AddIcon className="size-4" />
          {addLabel}
        </PlainButton>
      </div>
    </div>
  );
}
