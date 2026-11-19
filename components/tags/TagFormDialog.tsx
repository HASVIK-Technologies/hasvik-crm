"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Building2, Calendar, Check, LoaderCircle, Tag, X } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import TagBadge from "./TagBadge";
import type { TagEntityDisplay, TagItem, TagPayload } from "@/types/tag";
import {
  TAG_COLORS,
  getColorCode,
  getColorName,
  normalizeTagEntity,
  toTagEntityEnum,
} from "@/lib/tags/api";

interface TagFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tagToEdit?: TagItem | null;
  existingTags?: TagItem[];
  onSubmit: (payload: TagPayload) => Promise<unknown>;
  isSubmitting?: boolean;
}

export default function TagFormDialog({
  open,
  onOpenChange,
  tagToEdit,
  existingTags = [],
  onSubmit,
  isSubmitting = false,
}: TagFormDialogProps) {
  const isEditing = Boolean(tagToEdit);

  const [name, setName] = useState("");
  const [entity, setEntity] = useState<TagEntityDisplay>("Business");
  const [selectedColor, setSelectedColor] = useState("Blue");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (tagToEdit) {
      setName(tagToEdit.name);
      setEntity(normalizeTagEntity(tagToEdit.entity));
      setSelectedColor(getColorName(tagToEdit.color));
      setDescription(tagToEdit.description ?? "");
      setError("");
    } else {
      setName("");
      setEntity("Business");
      setSelectedColor("Blue");
      setDescription("");
      setError("");
    }
  }, [tagToEdit, open]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();

    // 1. Validation: Tag Name cannot be empty
    if (!trimmedName) {
      setError("Tag Name is required.");
      return;
    }

    // 2. Validation: Duplicate tag names within the same entity are not allowed
    const targetEntityEnum = toTagEntityEnum(entity);
    const isDuplicate = existingTags.some((t) => {
      if (tagToEdit && (t.id === tagToEdit.id || t._id === tagToEdit.id)) {
        return false;
      }
      return (
        t.name.trim().toLowerCase() === trimmedName.toLowerCase() &&
        toTagEntityEnum(t.entity) === targetEntityEnum
      );
    });

    if (isDuplicate) {
      setError(`A tag named "${trimmedName}" already exists for ${entity}.`);
      return;
    }

    try {
      setError("");
      await onSubmit({
        name: trimmedName,
        entity,
        color: selectedColor, // Sends color name: "Blue", "Red", etc.
        description: description.trim(),
      });
      onOpenChange(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred while saving the tag.");
      }
    }
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
        
        {/* Right-Side Drawer Container */}
        <DialogPrimitive.Content
          className="fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right"
          aria-describedby="tag-drawer-description"
        >
          {/* Drawer Header */}
          <header className="flex shrink-0 items-center justify-between border-b border-slate-200 px-6 py-4">
            <div>
              <DialogPrimitive.Title className="text-base font-bold text-slate-900">
                {isEditing ? "Edit Tag" : "Add Tag"}
              </DialogPrimitive.Title>
              <p id="tag-drawer-description" className="text-xs text-slate-500 mt-0.5">
                {isEditing
                  ? "Update tag details and entity assignment."
                  : "Create a new tag to organize business leads and follow-ups."}
              </p>
            </div>
            <DialogPrimitive.Close asChild>
              <button
                type="button"
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                aria-label="Close drawer"
              >
                <X className="size-5" />
              </button>
            </DialogPrimitive.Close>
          </header>

          {/* Drawer Form Body */}
          <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col justify-between">
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {error && (
                <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-none">
                  {error}
                </div>
              )}

              {/* Tag Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Tag Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="e.g. Hot Lead, Proposal Sent"
                  className="h-9 text-xs sm:text-sm rounded-none border-slate-300 focus-visible:ring-1 focus-visible:ring-emerald-500"
                  autoFocus
                />
              </div>

              {/* Target Entity */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Entity <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEntity("Business")}
                    className={`flex items-center justify-center gap-2 py-2 px-3 border text-xs font-medium transition-colors rounded-none ${
                      entity === "Business"
                        ? "border-emerald-600 bg-emerald-50/50 text-emerald-800 font-semibold"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Building2 className="size-4 shrink-0" />
                    <span>Business</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEntity("Follow-up")}
                    className={`flex items-center justify-center gap-2 py-2 px-3 border text-xs font-medium transition-colors rounded-none ${
                      entity === "Follow-up"
                        ? "border-emerald-600 bg-emerald-50/50 text-emerald-800 font-semibold"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Calendar className="size-4 shrink-0" />
                    <span>Follow-up</span>
                  </button>
                </div>
              </div>

              {/* Color Selection - Set of 5 Defined Colors */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Color <span className="text-rose-500">*</span>
                  </label>
                  {/* Live Badge Preview */}
                  <TagBadge
                    name={name.trim() || "Preview Tag"}
                    color={getColorCode(selectedColor)}
                  />
                </div>

                <div className="grid grid-cols-1 gap-2 pt-1">
                  {TAG_COLORS.map((col) => {
                    const isSelected = selectedColor === col.color;
                    return (
                      <button
                        key={col.color}
                        type="button"
                        onClick={() => setSelectedColor(col.color)}
                        className={`flex items-center justify-between px-3 py-2 border rounded-none text-xs transition-colors ${
                          isSelected
                            ? "border-emerald-600 bg-emerald-50/40 text-slate-900 font-semibold ring-1 ring-emerald-500"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className="size-4 border border-black/10 rounded-none shrink-0"
                            style={{ backgroundColor: col.code }}
                          />
                          <span>{col.color}</span>
                        </div>
                        {isSelected && <Check className="size-4 text-emerald-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description (Optional) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Description <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description of what this tag indicates..."
                  rows={3}
                  className="text-xs rounded-none border-slate-300 resize-none focus-visible:ring-1 focus-visible:ring-emerald-500"
                />
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <footer className="flex shrink-0 items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="h-9 px-4 text-xs rounded-none border-slate-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !name.trim()}
                className="h-9 px-4 text-xs font-semibold bg-[#16a34a] hover:bg-[#15803d] text-white rounded-none shadow-none"
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle className="size-3.5 animate-spin mr-1.5" />
                    Saving...
                  </>
                ) : isEditing ? (
                  "Update Tag"
                ) : (
                  "Create Tag"
                )}
              </Button>
            </footer>
          </form>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}