"use client";

import { useMemo, useState } from "react";
import { useTagAutocompleteQuery } from "@/hooks/use-tags";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import TagBadge from "@/components/tags/TagBadge";
import type { TagEntity } from "@/types/tag";

export default function TagSelectionField({ entity, value, onChange }: {
  entity: TagEntity;
  value: string[];
  onChange: (value: string[]) => void;
}) {
  const [search, setSearch] = useState("");
  const entityType = entity === "FOLLOW_UP" ? "FOLLOWUP" : "BUSINESS";
  const { data = [], isLoading, isFetching } = useTagAutocompleteQuery({ entityType, search, limit: 100 });
  const selectedTags = useMemo(() => {
    const byId = new Map(data.map((tag) => [tag.id, tag]));
    return value.flatMap((id) => { const tag = byId.get(id); return tag ? [tag] : []; });
  }, [data, value]);
  const toggle = (id: string) => onChange(value.includes(id) ? value.filter((item) => item !== id) : [...value, id]);

  return (
    <div className="space-y-3">
      <div className="flex min-h-8 flex-wrap items-center gap-1.5">
        {selectedTags.length ? <><TagBadge name={selectedTags[0].name} color={selectedTags[0].color} className="px-2.5 py-1 text-xs" />{selectedTags.length > 1 && <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">+{selectedTags.length - 1}</span>}</> : <span className="text-xs text-slate-400">No tags selected</span>}
      </div>
      <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tags..." className="h-9 text-xs" />
      <div className="max-h-44 space-y-1 overflow-y-auto border border-slate-200 p-2">
        {isLoading || isFetching ? <p className="py-4 text-center text-xs text-slate-500">Loading tags...</p> : data.length ? data.map((tag) => <label key={tag.id} className="flex cursor-pointer items-center gap-2 rounded px-1.5 py-1.5 hover:bg-slate-50"><Checkbox checked={value.includes(tag.id)} onCheckedChange={() => toggle(tag.id)} /><TagBadge name={tag.name} color={tag.color} /></label>) : <p className="py-4 text-center text-xs text-slate-500">No tags found</p>}
      </div>
      {value.length > 0 && <button type="button" onClick={() => onChange([])} className="text-xs font-medium text-slate-500 underline underline-offset-2 hover:text-slate-800">Clear all</button>}
    </div>
  );
}
