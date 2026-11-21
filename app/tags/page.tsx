"use client";

import { useMemo, useState } from "react";
import {
  Building2,
  Calendar,
  Columns3,
  Filter,
  Plus,
  Search,
  SlidersHorizontal,
  Tag as TagIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PageContainer from "@/components/layout/PageContainer";
import TagTable from "@/components/tags/TagTable";
import TagFormDialog from "@/components/tags/TagFormDialog";
import DeleteTagDialog from "@/components/tags/DeleteTagDialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  useCreateTag,
  useDeleteTag,
  useTagsQuery,
  useUpdateTag,
} from "@/hooks/use-tags";
import type { TagEntity, TagEntityDisplay, TagItem, TagPayload } from "@/types/tag";

type TabOption = "ALL" | "BUSINESS" | "FOLLOW_UP";

export default function TagsPage() {
  const [activeTab, setActiveTab] = useState<TabOption>("ALL");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tagToEdit, setTagToEdit] = useState<TagItem | null>(null);
  const [tagToDelete, setTagToDelete] = useState<TagItem | null>(null);

  // Column visibility
  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    color: true,
    entity: true,
    description: true,
    actions: true,
  });

  // Calculate entity filter from active tab
  const entityFilter = useMemo<"ALL" | TagEntity>(() => {
    if (activeTab === "BUSINESS") return "BUSINESS";
    if (activeTab === "FOLLOW_UP") return "FOLLOW_UP";
    return "ALL";
  }, [activeTab]);

  const queryParams = useMemo(
    () => ({
      search: debouncedSearch,
      entity: entityFilter,
      page,
      limit,
      sortBy,
      sortOrder,
    }),
    [debouncedSearch, entityFilter, page, limit, sortBy, sortOrder],
  );

  const { data, isLoading } = useTagsQuery(queryParams);
  const createMutation = useCreateTag();
  const updateMutation = useUpdateTag();
  const deleteMutation = useDeleteTag();

  const tags = data?.items ?? [];
  const total = data?.total ?? 0;

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setPage(1);
  };

  const handleTabChange = (tab: TabOption) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleEntityFilterSelect = (val: "ALL" | "BUSINESS" | "FOLLOW_UP") => {
    setActiveTab(val);
    setPage(1);
  };

  const handleOpenAdd = () => {
    setTagToEdit(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (tag: TagItem) => {
    setTagToEdit(tag);
    setDialogOpen(true);
  };

  const handleOpenDelete = (tag: TagItem) => {
    setTagToDelete(tag);
  };

  const handleFormSubmit = async (payload: TagPayload) => {
    if (tagToEdit) {
      await updateMutation.mutateAsync({
        id: tagToEdit.id,
        payload,
      });
    } else {
      await createMutation.mutateAsync(payload);
    }
  };

  const handleConfirmDelete = async () => {
    if (!tagToDelete) return;
    await deleteMutation.mutateAsync(tagToDelete.id);
    setTagToDelete(null);
  };

  return (
    <PageContainer className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header */}
      <div>
        <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
          HASVIK LEADS CRM
        </p>
        <h1 className="text-2xl font-bold text-slate-900 mt-0.5">Tags</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Create and manage tags to organize your business leads and follow-ups.
        </p>
      </div>

      {/* Tabs & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-6 overflow-x-auto -mb-px">
          <button
            type="button"
            onClick={() => handleTabChange("ALL")}
            className={`inline-flex items-center gap-2 pb-3 text-xs sm:text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${
              activeTab === "ALL"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <TagIcon className="size-4" />
            <span>All Tags</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("BUSINESS")}
            className={`inline-flex items-center gap-2 pb-3 text-xs sm:text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${
              activeTab === "BUSINESS"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Building2 className="size-4" />
            <span>Business Tags</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("FOLLOW_UP")}
            className={`inline-flex items-center gap-2 pb-3 text-xs sm:text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${
              activeTab === "FOLLOW_UP"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Calendar className="size-4" />
            <span>Follow-up Tags</span>
          </button>
        </div>

        {/* Add Tag Button */}
        <div className="pb-3 sm:pb-2">
          <Button
            type="button"
            onClick={handleOpenAdd}
            className="h-9 px-4 text-xs font-semibold bg-[#16a34a] hover:bg-[#15803d] text-white rounded-none shadow-none flex items-center gap-1.5"
          >
            <Plus className="size-4" />
            <span>Add Tag</span>
          </Button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search tags by name or description..."
            className="pl-9 h-10 text-xs sm:text-sm bg-white border-slate-200 rounded-none shadow-none focus-visible:ring-1 focus-visible:ring-emerald-500 placeholder:text-slate-400"
          />
        </div>

        {/* Entity Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="h-10 px-3.5 text-xs font-medium text-slate-700 bg-white border-slate-200 rounded-none shadow-none inline-flex items-center gap-2 hover:bg-slate-50"
            >
              <SlidersHorizontal className="size-3.5 text-slate-500" />
              <span>
                {activeTab === "ALL"
                  ? "All Entities"
                  : activeTab === "BUSINESS"
                    ? "Business"
                    : "Follow-up"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 bg-white rounded-none shadow-lg">
            <DropdownMenuItem
              onClick={() => handleEntityFilterSelect("ALL")}
              className="text-xs cursor-pointer"
            >
              All Entities
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleEntityFilterSelect("BUSINESS")}
              className="text-xs cursor-pointer gap-2"
            >
              <Building2 className="size-3.5 text-slate-500" />
              <span>Business</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleEntityFilterSelect("FOLLOW_UP")}
              className="text-xs cursor-pointer gap-2"
            >
              <Calendar className="size-3.5 text-slate-500" />
              <span>Follow-up</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Columns Toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="h-10 px-3.5 text-xs font-medium text-slate-700 bg-white border-slate-200 rounded-none shadow-none inline-flex items-center gap-2 hover:bg-slate-50"
            >
              <Columns3 className="size-3.5 text-slate-500" />
              <span>Columns</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 bg-white rounded-none shadow-lg">
            <DropdownMenuLabel className="text-xs font-semibold text-slate-700">
              Toggle Columns
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={visibleColumns.name}
              onCheckedChange={(checked) =>
                setVisibleColumns((prev) => ({ ...prev, name: Boolean(checked) }))
              }
              className="text-xs cursor-pointer"
            >
              Tag Name
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={visibleColumns.color}
              onCheckedChange={(checked) =>
                setVisibleColumns((prev) => ({ ...prev, color: Boolean(checked) }))
              }
              className="text-xs cursor-pointer"
            >
              Color
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={visibleColumns.entity}
              onCheckedChange={(checked) =>
                setVisibleColumns((prev) => ({ ...prev, entity: Boolean(checked) }))
              }
              className="text-xs cursor-pointer"
            >
              Entity
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={visibleColumns.description}
              onCheckedChange={(checked) =>
                setVisibleColumns((prev) => ({ ...prev, description: Boolean(checked) }))
              }
              className="text-xs cursor-pointer"
            >
              Description
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={visibleColumns.actions}
              onCheckedChange={(checked) =>
                setVisibleColumns((prev) => ({ ...prev, actions: Boolean(checked) }))
              }
              className="text-xs cursor-pointer"
            >
              Actions
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table Section */}
      <TagTable
        tags={tags}
        isLoading={isLoading}
        total={total}
        page={page}
        limit={limit}
        sortBy={sortBy}
        sortOrder={sortOrder}
        visibleColumns={visibleColumns}
        onSort={handleSort}
        onPageChange={setPage}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onAddTag={handleOpenAdd}
      />

      {/* Add / Edit Tag Dialog */}
      <TagFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        tagToEdit={tagToEdit}
        onSubmit={handleFormSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Dialog with Association Warning & Safety Guarantee */}
      <DeleteTagDialog
        open={Boolean(tagToDelete)}
        tag={tagToDelete}
        isDeleting={deleteMutation.isPending}
        onClose={() => setTagToDelete(null)}
        onConfirm={() => void handleConfirmDelete()}
      />
    </PageContainer>
  );
}

