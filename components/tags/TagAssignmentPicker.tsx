"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTagAutocompleteQuery } from "@/hooks/use-tags";
import TagBadge from "@/components/tags/TagBadge";
import { useAssignTags } from "@/hooks/use-tag-assignment";
import type { AssignedTag, TagEntity } from "@/types/tag";

export default function TagAssignmentPicker({ entity, entityId, tags = [], tagIds = [] }: {
  entity: TagEntity;
  entityId: string;
  tags?: AssignedTag[];
  tagIds?: string[];
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>(tags.map((tag) => tag.id));
  const entityType = entity === "FOLLOW_UP" ? "FOLLOWUP" : "BUSINESS";
  const { data = [], isLoading, isFetching } = useTagAutocompleteQuery({ entityType, search, limit: 100 }, open || Boolean(tagIds.length && !tags.length));
  const mutation = useAssignTags();
  const available = data;
  const selectedTags = useMemo(() => {
    const byId = new Map([...tags, ...available].map((tag) => [tag.id, tag]));
    return [...new Set([...tags.map((tag) => tag.id), ...tagIds])].flatMap((id) => { const tag = byId.get(id); return tag ? [tag] : []; });
  }, [tags, tagIds, available]);

  function toggle(id: string) {
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  async function apply() {
    try {
      await mutation.mutateAsync({ entity, entityId, tagIds: selected });
      setOpen(false);
    } catch {
      // Keep the picker open and leave the committed preview unchanged on failure.
    }
  }

  return (
    <div className="flex min-w-0 flex-nowrap items-center gap-1.5 whitespace-nowrap">
      {selectedTags.length ? <TagBadge name={selectedTags[0].name} color={selectedTags[0].color} className="px-2.5 py-1 text-xs" /> : <span className="text-xs text-slate-400">Empty</span>}
      {selectedTags.length > 1 && <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">+{selectedTags.length - 1}</span>}
      <Popover open={open} onOpenChange={(nextOpen) => { if (nextOpen) setSelected([...new Set([...tags.map((tag) => tag.id), ...tagIds])]); setOpen(nextOpen); }}>
        <PopoverTrigger asChild>
          <Button type="button" variant="ghost" size="icon" aria-label="Manage tags" className="size-7 text-slate-500 hover:text-primary"><Tag className="size-4" /><ChevronDown className="size-3" /></Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-64 p-0">
          <div className="border-b border-slate-100 p-3"><p className="text-xs font-semibold">Manage Tags</p><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tags..." className="mt-2 h-8 text-xs" autoFocus /></div>
          <div className="max-h-56 overflow-y-auto p-2">
            {isLoading || isFetching ? <p className="px-2 py-5 text-center text-xs text-slate-500">Loading tags...</p> : available.length ? available.map((tag) => <label key={tag.id} className="flex cursor-pointer items-center gap-2 rounded px-1.5 py-1.5 hover:bg-slate-50"><Checkbox checked={selected.includes(tag.id)} onCheckedChange={() => toggle(tag.id)} /><TagBadge name={tag.name} color={tag.color} /></label>) : <p className="px-2 py-5 text-center text-xs text-slate-500">No tags found</p>}
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 p-2"><Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setSelected([])}>Clear all</Button><Button size="sm" className="h-7 gap-1 px-2.5 text-xs" disabled={mutation.isPending} onClick={apply}>{mutation.isPending ? "Saving..." : <><Check className="size-3.5" /> Apply</>}</Button></div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
