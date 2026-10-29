"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * The footer for create / edit forms. Left: leave or undo. Right: the save actions, primary last (and on top on
 * phones). Save buttons stay clickable: pressing Save on an incomplete form shows what is missing instead of a
 * greyed-out button that explains nothing.
 */
export default function FormActionBar({
  cancelLabel = "Cancel",
  onCancel,
  onReset,
  canReset = false,
  primaryLabel,
  primaryValue,
  secondaryLabel,
  secondaryValue,
  submitting = false,
  primaryDisabled = false,
  hint,
  sticky = true,
  className,
}: {
  cancelLabel?: string;
  onCancel: () => void;
  onReset?: () => void;
  /** Show "Reset changes" only when there is something to reset. */
  canReset?: boolean;
  primaryLabel: string;
  /** Sent as the submitter value so the form knows which save was pressed. */
  primaryValue?: string;
  secondaryLabel?: string;
  secondaryValue?: string;
  submitting?: boolean;
  /** e.g. nothing changed yet in an edit form. Pair it with a `hint` that says so. */
  primaryDisabled?: boolean;
  hint?: string;
  sticky?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "-mx-4 mt-8 flex flex-col-reverse gap-3 border-t border-line bg-surface/95 px-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur sm:-mx-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:pb-4",
        sticky && "sticky bottom-0 z-20",
        className,
      )}
    >
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
        <Button type="button" variant="ghost" onClick={onCancel} className="w-full sm:w-auto">
          {cancelLabel}
        </Button>
        {onReset && canReset && (
          <Button type="button" variant="ghost" onClick={onReset} className="w-full text-muted sm:w-auto">
            <RotateCcw className="size-4" aria-hidden />
            Reset changes
          </Button>
        )}
      </div>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:gap-3">
        {hint && <p className="text-center text-sm text-muted sm:text-right">{hint}</p>}
        {secondaryLabel && (
          <Button type="submit" variant="outline" value={secondaryValue} disabled={submitting} className="w-full sm:w-auto">
            {secondaryLabel}
          </Button>
        )}
        <Button type="submit" value={primaryValue} loading={submitting} disabled={primaryDisabled} className="w-full sm:w-auto sm:min-w-36">
          {submitting ? "Saving…" : primaryLabel}
        </Button>
      </div>
    </div>
  );
}
