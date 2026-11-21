"use client";

import { useId, useMemo, useState } from "react";
import { Check, ChevronDown, Loader2, Search } from "lucide-react";
import { useTagAutocompleteQuery } from "@/hooks/use-tags";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import TagBadge from "@/components/tags/TagBadge";
import type { TagEntity } from "@/types/tag";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export default function TagSelectionField({ id, entity, value, onChange, compact = false }: {
  id?: string;
  entity: TagEntity;
  value: string[];
  onChange: (value: string[]) => void;
  compact?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const entityType = entity === "FOLLOW_UP" ? "FOLLOWUP" : "BUSINESS";
  const { data = [], isLoading, isFetching } = useTagAutocompleteQuery({ entityType, search, limit: 100 });
  const selectedTags = useMemo(() => {
    const byId = new Map(data.map((tag) => [tag.id, tag]));
    return value.flatMap((id) => { const tag = byId.get(id); return tag ? [tag] : []; });
  }, [data, value]);
  const toggle = (id: string) => onChange(value.includes(id) ? value.filter((item) => item !== id) : [...value, id]);

  if (compact) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            id={controlId}
            type="button"
            role="combobox"
            aria-controls={`${controlId}-options`}
            aria-expanded={open}
            className={cn(
              "flex min-h-10 w-full items-center gap-2 border border-slate-300 bg-white px-3 py-1.5 text-left text-xs shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition-colors hover:border-slate-400 focus-visible:border-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/15",
              !value.length && "text-slate-400",
            )}
          >
            {selectedTags.length > 0 ? (
              <>
                <TagBadge name={selectedTags[0].name} color={selectedTags[0].color} compact />
                {value.length > 1 && (
                  <span className="shrink-0 text-[11px] font-medium text-slate-500">
                    +{value.length - 1}
                  </span>
                )}
              </>
            ) : value.length > 0 ? (
              <span className="text-slate-600">{value.length} selected</span>
            ) : (
              <span className="flex-1">Search and select tags...</span>
            )}
            <ChevronDown className="ml-auto size-4 shrink-0 text-slate-400" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-(--radix-popover-trigger-width) overflow-hidden border border-slate-200 bg-white p-0 shadow-xl"
        >
          <div className="border-b border-slate-100 p-2.5">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 size-3.5 text-slate-400" />
              <Input
                autoFocus
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search tags..."
                aria-label="Search tags"
                className="h-8.5 pl-8 text-xs"
              />
            </div>
          </div>
          <div
            id={`${controlId}-options`}
            role="listbox"
            aria-label="Tags"
            aria-multiselectable="true"
            className="max-h-52 overflow-y-auto p-1.5"
          >
            {isLoading || isFetching ? (
              <div className="flex justify-center py-5">
                <Loader2 className="size-4 animate-spin text-primary" />
              </div>
            ) : data.length ? (
              data.map((tag) => {
                const selected = value.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => toggle(tag.id)}
                    className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-slate-50"
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "flex size-4 shrink-0 items-center justify-center rounded-[4px] border",
                        selected
                          ? "border-primary bg-primary text-white"
                          : "border-slate-300 bg-white",
                      )}
                    >
                      {selected && <Check className="size-3" />}
                    </span>
                    <TagBadge name={tag.name} color={tag.color} compact />
                  </button>
                );
              })
            ) : (
              <p className="py-5 text-center text-xs text-slate-500">No tags found</p>
            )}
          </div>
          {value.length > 0 && (
            <div className="border-t border-slate-100 px-3 py-2">
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-xs font-medium text-slate-500 underline underline-offset-2 hover:text-slate-800"
              >
                Clear all
              </button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex min-h-8 flex-wrap items-center gap-1.5">
        {selectedTags.length ? <><TagBadge name={selectedTags[0].name} color={selectedTags[0].color} className="px-2.5 py-1 text-xs" />{selectedTags.length > 1 && <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-600">+{selectedTags.length - 1}</span>}</> : <span className="text-xs text-slate-400">No tags selected</span>}
      </div>
      <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tags..." className="h-9 text-xs" />
      <div className="max-h-44 space-y-1 overflow-y-auto border border-slate-200 p-2">
        {isLoading || isFetching ? <p className="py-4 text-center text-xs text-slate-500">Loading tags...</p> : data.length ? data.map((tag) => <label key={tag.id} className="flex cursor-pointer items-center gap-2 rounded px-1.5 py-1.5 hover:bg-slate-50"><Checkbox checked={value.includes(tag.id)} onCheckedChange={() => toggle(tag.id)} /><TagBadge name={tag.name} color={tag.color} /></label>) : <p className="py-4 text-center text-xs text-slate-500">No tags found</p>}
      </div>
      {value.length > 0 && <button type="button" onClick={() => onChange([])} className="text-xs font-medium text-slate-500 underline underline-offset-2 hover:text-slate-800">Clear all</button>}
    </div>
  );
}
