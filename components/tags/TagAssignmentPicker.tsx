"use client";

import { useMemo, useState } from "react";
import { ChevronDown, LoaderCircle, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTagAutocompleteQuery } from "@/hooks/use-tags";
import TagBadge from "@/components/tags/TagBadge";
import { useAssignTags } from "@/hooks/use-tag-assignment";
import type { AssignedTag, TagEntity } from "@/types/tag";

export default function TagAssignmentPicker({ entity, entityId, tags = [], tagIds = [], variant = "compact" }: {
  entity: TagEntity;
  entityId: string;
  tags?: AssignedTag[];
  tagIds?: string[];
  variant?: "compact" | "table" | "summary" | "single-summary" | "card-summary" | "business-card-summary" | "calendar-card-summary" | "details";
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const assignedIds = useMemo(() => [...new Set([...tags.map((tag) => tag.id), ...tagIds])], [tags, tagIds]);
  const [savingTagId, setSavingTagId] = useState<string | null>(null);
  const entityType = entity === "FOLLOW_UP" ? "FOLLOWUP" : "BUSINESS";
  const { data = [], isLoading, isFetching } = useTagAutocompleteQuery({ entityType, search, limit: 100 }, open || Boolean(tagIds.length && !tags.length));
  const mutation = useAssignTags();
  const available = useMemo(() => {
    const catalog = new Map([...tags, ...data].map((tag) => [tag.id, tag]));
    const assignedButNotListed = assignedIds.flatMap((id) => {
      const tag = catalog.get(id);
      return tag && !data.some((item) => item.id === id) ? [tag] : [];
    });
    return [...assignedButNotListed, ...data];
  }, [tags, data, assignedIds]);
  const selectedTags = useMemo(() => {
    const byId = new Map([...tags, ...available].map((tag) => [tag.id, tag]));
    return assignedIds.flatMap((id) => { const tag = byId.get(id); return tag ? [tag] : []; });
  }, [tags, assignedIds, available]);
  const visibleTags = variant === "details" ? selectedTags.slice(0, 10) : variant === "table" ? selectedTags.slice(0, 4) : selectedTags.slice(0, 2);
  const hiddenTagCount = Math.max(0, selectedTags.length - visibleTags.length);
  const triggerOverflowCount = variant === "single-summary" || variant === "summary" ? Math.max(0, selectedTags.length - 1) : hiddenTagCount;
  const isCompactStrip = variant === "single-summary" || variant === "summary" || variant === "card-summary" || variant === "business-card-summary" || variant === "calendar-card-summary";
  async function toggle(id: string) {
    if (mutation.isPending) return;
    const nextIds = assignedIds.includes(id)
      ? assignedIds.filter((assignedId) => assignedId !== id)
      : [...assignedIds, id];
    setSavingTagId(id);
    try {
      await mutation.mutateAsync({ entity, entityId, tagIds: nextIds });
    } catch {
      // Keep the menu open; the committed assignment remains unchanged on failure.
    } finally {
      setSavingTagId(null);
    }
  }

  return (
    <div className={isCompactStrip ? "inline-flex min-w-0 max-w-full" : variant === "details" ? "flex min-w-0 flex-wrap items-center gap-2" : variant === "table" ? "flex min-w-0 max-w-64 flex-wrap items-center gap-1" : "flex min-w-0 flex-nowrap items-center gap-1.5 whitespace-nowrap"}>
      {isCompactStrip ? null : variant === "details" || variant === "table" ? <>
        {visibleTags.map((tag) => <TagBadge key={tag.id} name={tag.name} color={tag.color} compact={variant === "table"} className={variant === "table" ? "max-w-full" : "px-2 py-1 text-[11px]"} />)}
        {!selectedTags.length && <span className="text-sm text-slate-500">No tags assigned</span>}
      </> : selectedTags.length ? <>
          {visibleTags.map((tag) => <TagBadge key={tag.id} name={tag.name} color={tag.color} className="max-w-28 truncate px-1.5 py-0.5 text-[10px]" />)}
        </> : <span className="text-xs font-medium text-slate-500">Add tag</span>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          {isCompactStrip ? <Button type="button" variant={variant === "card-summary" || variant === "business-card-summary" || variant === "calendar-card-summary" || variant === "single-summary" ? "ghost" : "outline"} aria-label={`Manage tags${selectedTags.length ? `, ${selectedTags.length} assigned` : ", none assigned"}`} aria-haspopup="dialog" className={variant === "card-summary" || variant === "business-card-summary" || variant === "calendar-card-summary" || variant === "single-summary" ? "h-auto w-fit min-w-0 max-w-full cursor-pointer justify-start gap-1.5 rounded-md !border-0 bg-transparent px-1 py-1 text-slate-700 shadow-none transition-all duration-150 hover:!border-0 hover:bg-blue-50 hover:text-brand-blue hover:shadow-sm focus-visible:ring-2 focus-visible:ring-brand-blue/30" : "h-8 w-fit min-w-0 max-w-full cursor-pointer justify-start gap-1.5 rounded-md border-slate-300 bg-white px-2 text-slate-700 shadow-none transition-colors hover:border-brand-blue/50 hover:bg-blue-50 hover:text-brand-blue"}>
            {selectedTags.length ? <>
              {variant === "card-summary" ? <>
                {selectedTags.slice(0, 1).map((tag) => <TagBadge key={tag.id} name={tag.name} color={tag.color} compact className="max-w-none shrink-0 md:hidden" />)}
                {selectedTags.slice(0, 2).map((tag) => <TagBadge key={tag.id} name={tag.name} color={tag.color} compact className="hidden max-w-none shrink-0 md:inline-flex" />)}
                {selectedTags.length > 1 && <span title={`Additional tags: ${selectedTags.slice(1).map((tag) => tag.name).join(", ")}`} className="inline-flex shrink-0 items-center rounded-md bg-slate-100 px-1.5 py-1 text-[10px] font-semibold leading-none text-slate-600 md:hidden">+{selectedTags.length - 1}</span>}
                {selectedTags.length > 2 && <span title={`Additional tags: ${selectedTags.slice(2).map((tag) => tag.name).join(", ")}`} className="hidden shrink-0 items-center rounded-md bg-slate-100 px-1.5 py-1 text-[10px] font-semibold leading-none text-slate-600 md:inline-flex">+{selectedTags.length - 2}</span>}
              </> : variant === "business-card-summary" ? <>
                {selectedTags.slice(0, 1).map((tag) => <TagBadge key={tag.id} name={tag.name} color={tag.color} compact className="max-w-none shrink-0 sm:hidden" />)}
                {selectedTags.slice(0, 2).map((tag) => <TagBadge key={tag.id} name={tag.name} color={tag.color} compact className="hidden max-w-none shrink-0 sm:inline-flex" />)}
                {selectedTags.length > 1 && <span title={`Additional tags: ${selectedTags.slice(1).map((tag) => tag.name).join(", ")}`} className="inline-flex shrink-0 items-center rounded-md bg-slate-100 px-1.5 py-1 text-[10px] font-semibold leading-none text-slate-600 sm:hidden">+{selectedTags.length - 1}</span>}
                {selectedTags.length > 2 && <span title={`Additional tags: ${selectedTags.slice(2).map((tag) => tag.name).join(", ")}`} className="hidden shrink-0 items-center rounded-md bg-slate-100 px-1.5 py-1 text-[10px] font-semibold leading-none text-slate-600 sm:inline-flex">+{selectedTags.length - 2}</span>}
              </> : variant === "calendar-card-summary" ? <>
                {selectedTags.slice(0, 2).map((tag) => <TagBadge key={tag.id} name={tag.name} color={tag.color} compact className="max-w-none shrink-0" />)}
                {selectedTags.length > 2 && <span title={`Additional tags: ${selectedTags.slice(2).map((tag) => tag.name).join(", ")}`} className="inline-flex shrink-0 items-center rounded-md bg-slate-100 px-1.5 py-1 text-[10px] font-semibold leading-none text-slate-600">+{selectedTags.length - 2}</span>}
              </> : <>
                <span className="flex min-w-0 flex-1 overflow-hidden text-left"><TagBadge name={selectedTags[0].name} color={selectedTags[0].color} compact className="max-w-none shrink-0" /></span>
                {triggerOverflowCount > 0 && <span title={`Additional tags: ${selectedTags.slice(1).map((tag) => tag.name).join(", ")}`} className="inline-flex shrink-0 items-center rounded-md bg-slate-100 px-1.5 py-1 text-[10px] font-semibold leading-none text-slate-600">+{triggerOverflowCount}</span>}
              </>}
              <ChevronDown className="size-3.5 shrink-0 text-slate-500" />
            </> : <><Tag className="size-3.5 shrink-0 text-slate-500" /><span className="min-w-0 flex-1 truncate text-left text-xs font-medium text-slate-500">Add tag</span><ChevronDown className="size-3.5 shrink-0 text-slate-500" />
            </>}
          </Button> : <Button type="button" variant="outline" size="icon-sm" aria-label={`Manage tags${selectedTags.length ? `, ${selectedTags.length} assigned` : ", none assigned"}`} aria-haspopup="dialog" className="cursor-pointer border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"><Tag className="size-4" /></Button>}
        </PopoverTrigger>
        <PopoverContent align="start" side="bottom" className="w-[min(17rem,calc(100vw-2rem))] overflow-hidden p-0">
          <div className="border-b border-slate-100 p-3">
            <p className="text-sm font-semibold text-slate-900">Assign tags</p>
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tags..." aria-label="Search available tags" className="mt-2 h-8 text-xs" autoFocus />
          </div>
          <div className="max-h-64 overflow-y-auto p-2">
            {isLoading && !available.length || isFetching && !available.length ? <p className="px-2 py-5 text-center text-xs text-slate-500">Loading tags...</p> : available.length ? <div className="space-y-0.5">{available.map((tag) => {
              const checked = assignedIds.includes(tag.id);
              const saving = savingTagId === tag.id && mutation.isPending;
              return <label key={tag.id} className={`flex items-center gap-2.5 rounded-md px-2 py-2 ${mutation.isPending ? "cursor-wait opacity-70" : "cursor-pointer hover:bg-slate-50"}`}>
                <Checkbox checked={checked} disabled={mutation.isPending} onCheckedChange={() => void toggle(tag.id)} />
                <TagBadge name={tag.name} color={tag.color} className="max-w-full px-2 py-1 text-[11px]" />
                {saving && <LoaderCircle aria-label="Saving tag" className="ml-auto size-3.5 animate-spin text-slate-400" />}
              </label>;
            })}</div> : <p className="px-2 py-5 text-center text-xs text-slate-500">{search ? "No matching tags" : "No tags available"}</p>}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
