"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Building2, Calendar, Check, LoaderCircle, Tag, X } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import TagBadge from "./TagBadge";
import type { TagEntity, TagEntityDisplay, TagItem, TagPayload } from "@/types/tag";
import { normalizeHexColor, normalizeTagEntity } from "@/lib/tags/api";

export const TAG_COLOR_PRESETS = [
  { label: "Emerald", hex: "#20B83F" },
  { label: "Classic Blue", hex: "#0876D1" },
  { label: "Lime Green", hex: "#63D329" },
  { label: "Amber Orange", hex: "#FFA500" },
  { label: "Crimson Red", hex: "#EF4444" },
  { label: "Violet Purple", hex: "#8B5CF6" },
  { label: "Cyan Sky", hex: "#08A9E6" },
  { label: "Slate Gray", hex: "#6B7280" },
];

interface TagFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tagToEdit?: TagItem | null;
  onSubmit: (payload: TagPayload) => Promise<unknown>;
  isSubmitting?: boolean;
}

export default function TagFormDialog({
  open,
  onOpenChange,
  tagToEdit,
  onSubmit,
  isSubmitting = false,
}: TagFormDialogProps) {
  const isEditing = Boolean(tagToEdit);

  const [name, setName] = useState("");
  const [entity, setEntity] = useState<TagEntityDisplay>("Business");
  const [color, setColor] = useState("#20B83F");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (tagToEdit) {
      setName(tagToEdit.name);
      setEntity(normalizeTagEntity(tagToEdit.entity));
      setColor(normalizeHexColor(tagToEdit.color));
      setDescription(tagToEdit.description ?? "");
      setError("");
    } else {
      setName("");
      setEntity("Business");
      setColor("#20B83F");
      setDescription("");
      setError("");
    }
  }, [tagToEdit, open]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Tag name is required");
      return;
    }

    try {
      setError("");
      await onSubmit({
        name: trimmedName,
        entity,
        color: normalizeHexColor(color),
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
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs animate-in fade-in-0" />
        <DialogPrimitive.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 bg-white shadow-2xl border border-slate-200 rounded-none focus:outline-none p-6"
          aria-describedby="tag-dialog-description"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <DialogPrimitive.Title className="text-lg font-bold text-slate-900">
                {isEditing ? "Edit Tag" : "Add Tag"}
              </DialogPrimitive.Title>
              <p id="tag-dialog-description" className="text-xs text-slate-500 mt-0.5">
                {isEditing
                  ? "Update tag name, color, entity assignment and description."
                  : "Create a new tag to organize your business leads and follow-ups."}
              </p>
            </div>
            <DialogPrimitive.Close asChild>
              <button
                type="button"
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </DialogPrimitive.Close>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {error && (
              <div className="p-2.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-none">
                {error}
              </div>
            )}

            {/* Tag Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tag Name <span className="text-rose-500">*</span>
              </label>
              <Input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError("");
                }}
                placeholder="e.g. Hot Lead, Proposal Sent"
                className="h-9 text-sm rounded-none border-slate-300 focus-visible:ring-1 focus-visible:ring-emerald-500"
                autoFocus
              />
            </div>

            {/* Target Entity */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Applies To (Entity) <span className="text-rose-500">*</span>
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
                  <span>Business Leads</span>
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
                  <span>Follow-ups</span>
                </button>
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tag Color <span className="text-rose-500">*</span>
              </label>
              
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="size-8 border border-slate-300 rounded-none shrink-0 relative overflow-hidden"
                  style={{ backgroundColor: color }}
                >
                  <input
                    type="color"
                    value={color.startsWith("#") ? color : `#${color}`}
                    onChange={(e) => setColor(normalizeHexColor(e.target.value))}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    title="Choose custom color"
                  />
                </div>
                <Input
                  value={color}
                  onChange={(e) => setColor(normalizeHexColor(e.target.value))}
                  placeholder="#20B83F"
                  className="h-8 text-xs font-mono w-28 uppercase rounded-none border-slate-300"
                />
                
                {/* Live Preview */}
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 font-medium">Preview:</span>
                  <TagBadge name={name.trim() || "Preview Tag"} color={color} />
                </div>
              </div>

              {/* Preset Palette */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {TAG_COLOR_PRESETS.map((preset) => {
                  const isSelected =
                    normalizeHexColor(color).toLowerCase() === preset.hex.toLowerCase();
                  return (
                    <button
                      key={preset.hex}
                      type="button"
                      onClick={() => setColor(preset.hex)}
                      title={`${preset.label} (${preset.hex})`}
                      className={`size-6 rounded-none flex items-center justify-center transition-transform hover:scale-105 border ${
                        isSelected
                          ? "ring-2 ring-emerald-500 ring-offset-1 border-white"
                          : "border-slate-200"
                      }`}
                      style={{ backgroundColor: preset.hex }}
                    >
                      {isSelected && <Check className="size-3 text-white drop-shadow-sm" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description of what this tag indicates..."
                rows={2}
                className="text-xs rounded-none border-slate-300 resize-none focus-visible:ring-1 focus-visible:ring-emerald-500"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
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
            </div>
          </form>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

