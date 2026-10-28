"use client";

import { useState } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { Loader2, UserRound, X } from "lucide-react";
import AssigneeAutocomplete from "@/components/common/AssigneeAutocomplete";
import SaveButton from "@/components/common/SaveButton";
import { Button } from "@/components/ui/button";
import { useAssignBusiness } from "@/hooks/use-businesses";
import type { BusinessItem } from "@/types/business";
import type { FollowUpOption } from "@/types/follow-up";

export default function AssignBusinessDialog({
  business,
  open,
  onOpenChange,
}: {
  business: BusinessItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const mutation = useAssignBusiness();
  const [selectedAssignee, setSelectedAssignee] = useState<FollowUpOption | null>();
  const [error, setError] = useState("");
  const assignee = selectedAssignee !== undefined
    ? selectedAssignee
    : business?.assignedToId
      ? {
          id: business.assignedToId,
          label: business.assignedToName || business.assignedTo || "Assigned user",
        }
      : undefined;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSelectedAssignee(undefined);
      setError("");
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (business?.isActive === false || business?.status === "Inactive") return;
    if (!business || !assignee?.id) {
      setError("Select a responsible person.");
      return;
    }

    if (assignee.id === business.assignedToId) {
      handleOpenChange(false);
      return;
    }

    try {
      await mutation.mutateAsync({
        id: business.id,
        assigneeId: assignee.id,
        assigneeName: assignee.label,
      });
      handleOpenChange(false);
    } catch {
      // The mutation displays the API error.
    }
  };

  return (
    <DialogPrimitive.Root open={open && business?.isActive !== false && business?.status !== "Inactive"} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/35 backdrop-blur-[2px]" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto border border-line bg-surface shadow-2xl outline-none">
          <header className="sticky top-0 z-10 flex items-start justify-between border-b border-line bg-surface px-5 py-4 sm:px-6 rounded-2xl">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center bg-brand-soft text-brand-strong">
                <UserRound className="size-4.5" />
              </div>
              <div className="min-w-0">
                <DialogPrimitive.Title className="text-base font-bold text-ink">
                  Assign responsible person
                </DialogPrimitive.Title>
                <DialogPrimitive.Description className="mt-1 truncate text-xs text-muted">
                  Choose who will own and manage {business?.name || "this business"}.
                </DialogPrimitive.Description>
              </div>
            </div>
            <DialogPrimitive.Close asChild>
              <button
                type="button"
                aria-label="Close dialog"
                className="border border-transparent p-1.5 text-muted hover:border-line hover:bg-surface-2"
              >
                <X className="size-4" />
              </button>
            </DialogPrimitive.Close>
          </header>

          <form onSubmit={handleSubmit} noValidate>
            <div className="px-5 py-5 sm:px-6">
              <label className="mb-1.5 block text-xs font-semibold text-ink-soft">
                Responsible person <span className="text-bad">*</span>
              </label>
              <AssigneeAutocomplete
                value={assignee?.id}
                label={assignee?.label}
                onChange={(option) => {
                  setSelectedAssignee(option ?? null);
                  setError("");
                }}
                invalid={Boolean(error)}
              />
              {error ? (
                <p role="alert" className="mt-1 text-xs text-bad">
                  {error}
                </p>
              ) : (
                <p className="mt-2 text-xs leading-5 text-muted">
                  This person will be shown as the business owner across the list, pipeline, and details views.
                </p>
              )}
            </div>

            <footer className="sticky bottom-0 z-10 flex flex-col-reverse justify-end gap-2 border-t border-line bg-surface px-5 py-4 sm:flex-row sm:px-6 rounded-2xl">
              <DialogPrimitive.Close asChild>
                <Button type="button" variant="outline" disabled={mutation.isPending}>
                  Cancel
                </Button>
              </DialogPrimitive.Close>
              <SaveButton type="submit" disabled={mutation.isPending || !assignee?.id || assignee.id === business?.assignedToId}>
                {mutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" /> Assigning...
                  </span>
                ) : business?.assignedToId ? (
                  "Update assignment"
                ) : (
                  "Assign person"
                )}
              </SaveButton>
            </footer>
          </form>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
