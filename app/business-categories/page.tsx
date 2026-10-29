"use client";

import { changedFields } from "@/lib/forms/changed-fields";

import { useListActionHighlight } from "@/hooks/use-list-action-highlight";

import { useMemo, useState, type FormEvent } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import {
  Check,
  ChartNoAxesCombined,
  CircleAlert,
  FolderKanban,
  LoaderCircle,
  Plus,
  Tags,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Actions from "@/components/common/Actions";
import KpiCards from "@/components/common/KpiCards";
import Breadcrumb from "@/components/common/Breadcrumb";
import ManagementConfirmDialog from "@/components/common/ManagementConfirmDialog";
import ManagementRowActions from "@/components/common/ManagementRowActions";
import ListPagination from "@/components/common/ListPagination";
import ListTableToolbar from "@/components/common/ListTableToolbar";
import { DataTableMobileCard, DataTableMobileList, DataTableShell } from "@/components/common/DataTableLayout";
import ListPageLayout from "@/components/layout/ListPageLayout";
import SortableColumnHeader from "@/components/common/SortableColumnHeader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  useBusinessCategoriesQuery,
  useCreateBusinessCategory,
  useSetBusinessCategoryStatus,
  useUpdateBusinessCategory,
} from "@/hooks/use-business-categories";
import { getApiErrorMessage } from "@/lib/api/api-error";
import type { BusinessCategory } from "@/types/category";

function categoryId(category: BusinessCategory) {
  return category._id ?? category.id ?? "";
}

export default function BusinessCategoriesPage() {
  const { highlightItem, isItemHighlighted } = useListActionHighlight("categories");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showStats, setShowStats] = useState(true);
  const [editingCategory, setEditingCategory] = useState<BusinessCategory | null>(null);
  const [changingStatusCategory, setChangingStatusCategory] =
    useState<BusinessCategory | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const categoriesQuery = useBusinessCategoriesQuery(
    debouncedSearch,
    true,
    page,
    limit,
    sortBy,
    sortOrder,
  );
  const createMutation = useCreateBusinessCategory();
  const updateMutation = useUpdateBusinessCategory();
  const statusMutation = useSetBusinessCategoryStatus();
  const allCategories = useMemo(
    () => categoriesQuery.data?.items ?? [],
    [categoriesQuery.data],
  );
  const categories = allCategories;
  const activeCount = allCategories.filter((category) => category.isActive !== false).length;
  const inactiveCount = allCategories.length - activeCount;
  const total = categoriesQuery.data?.total ?? 0;
  const mutationPending = createMutation.isPending || updateMutation.isPending;

  function toggleSort(field: string) {
    if (sortBy === field) {
      setSortOrder((order) => (order === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setPage(1);
  }

  function setSortPreset(value: string) {
    const [field, direction] = value.split(":");
    setSortBy(field);
    setSortOrder(direction === "desc" ? "desc" : "asc");
    setPage(1);
  }

  function openCreate() {
    setEditingCategory(null);
    setFormError("");
    setDialogOpen(true);
  }

  function openEdit(category: BusinessCategory) {
    if (category.isActive === false) return;
    setEditingCategory(category);
    setFormError("");
    setDialogOpen(true);
  }

  async function submitCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim(),
    };

    try {
      if (editingCategory) {
        if ((categories.find((item) => categoryId(item) === categoryId(editingCategory)) ?? editingCategory).isActive === false) throw new Error("Activate the category before editing it.");
        const id = categoryId(editingCategory);
        if (!id) throw new Error("This category has no ID and cannot be updated.");
        const updates = changedFields(payload, { name: editingCategory.name.trim(), description: (editingCategory.description ?? "").trim() });
        if (Object.keys(updates).length) await updateMutation.mutateAsync({ id, payload: updates });
        highlightItem(id);
      } else {
        await createMutation.mutateAsync(payload);
      }
      setDialogOpen(false);
      setEditingCategory(null);
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    }
  }

  async function confirmStatusChange() {
    if (!changingStatusCategory) return;
    const id = categoryId(changingStatusCategory);
    if (!id) return;
    const activate = changingStatusCategory.isActive === false;
    try {
      await statusMutation.mutateAsync({ id, isActive: activate });
      highlightItem(id);
      setChangingStatusCategory(null);
    } catch {
      // The API interceptor displays the request error.
    }
  }

  return (
    <ListPageLayout
      breadcrumb={<Breadcrumb items={[{ label: "Business categories" }]} />}
      searchValue={search}
      onSearchChange={(value) => {
        setSearch(value);
        setPage(1);
      }}
      searchPlaceholder="Search categories"
      showStats={showStats}
      stats={
        <KpiCards items={[
            { label: "All categories", value: total, icon: FolderKanban, tone: "text-brand-strong bg-brand-soft" },
            { label: "Active on page", value: activeCount, icon: Check, tone: "text-ok bg-ok-soft" },
            { label: "Inactive on page", value: inactiveCount, icon: CircleAlert, tone: "text-warn bg-warn-soft" },
          ].map((item, index) => ({ ...item, tone: (["blue", "green", "amber"] as const)[index] }))} />
      }
      actions={
        <Actions
          primary={{ label: "Add category", onSelect: openCreate, icon: <Plus className="size-4" /> }}
          menuItems={[
            { label: showStats ? "Hide KPIs" : "Show KPIs", icon: <ChartNoAxesCombined className="size-4" />, onSelect: () => setShowStats((visible) => !visible) },
          ]}
        />
      }
      content={
        <>
        <DataTableShell>
          <ListTableToolbar
            title="Categories"
            total={total}
            sortValue={`${sortBy}:${sortOrder}`}
            sortOptions={[
              { value: "name:asc", label: "Name A–Z" },
              { value: "name:desc", label: "Name Z–A" },
              { value: "isActive:desc", label: "Active first" },
              { value: "isActive:asc", label: "Inactive first" },
            ]}
            onSortChange={setSortPreset}
          />
        {categoriesQuery.isPending ? (
          <div className="flex min-h-44 items-center justify-center"><LoaderCircle className="size-5 animate-spin text-brand-strong" /><span className="ml-2 text-sm text-muted">Loading categories…</span></div>
        ) : categoriesQuery.isError ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm font-semibold text-ink">Categories couldn’t be loaded</p>
            <p className="mt-1 text-xs text-muted">Check your access and connection, then try again.</p>
            <Button variant="outline" size="sm" onClick={() => void categoriesQuery.refetch()} className="mt-4 rounded-lg">Try again</Button>
          </div>
        ) : categories.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <Tags className="mx-auto size-7 text-muted" />
            <p className="mt-3 text-sm font-semibold text-ink">No categories found</p>
            <p className="mt-1 text-xs text-muted">Create a category or adjust your search filters.</p>
          </div>
        ) : (
          <>
            <DataTableMobileList>
              {categories.map((category, index) => {
                const id = categoryId(category) || `${category.name}-${index}`;
                const active = category.isActive !== false;
                return (
                  <DataTableMobileCard key={id} className={`flex items-start justify-between gap-3 ${isItemHighlighted(id) ? "border-brand-strong bg-brand-soft/80 ring-2 ring-brand/20" : ""}`}>
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-strong"><Tags className="size-4" /></span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-ink">{category.name}</p>
                        <p className="mt-1 text-xs leading-5 text-muted">{category.description || "No description provided."}</p>
                        <span className={`mt-2 inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-bold ${active ? "bg-ok-soft text-ok" : "bg-surface-2 text-muted"}`}>{active ? "Active" : "Inactive"}</span>
                      </div>
                    </div>
                    <ManagementRowActions
      readOnly={category.isActive === false}
                      activity={{ entityType: "CATEGORY", entityId: categoryId(category), name: category.name }}
                      editLabel={`Edit ${category.name}`}
                      actionLabel={active ? "Deactivate category" : "Activate category"}
                      actionDestructive={active}
                      disabled={statusMutation.isPending}
                      onEdit={() => openEdit(category)}
                      onAction={() => setChangingStatusCategory(category)}
                    />
                  </DataTableMobileCard>
                );
              })}
            </DataTableMobileList>
            <div data-layout-desktop>
              <Table className="w-full min-w-205 text-left">
              <TableHeader>
                  <TableRow className="border-b border-surface-2 hover:bg-transparent">
                    <TableHead className="py-4 pl-6 pr-4">
                      <SortableColumnHeader label="Category" field="name" sortBy={sortBy} sortOrder={sortOrder} onSort={toggleSort} />
                    </TableHead>
                    <TableHead className="px-4 py-4 font-semibold">Description</TableHead>
                    <TableHead className="px-4 py-4">
                      <SortableColumnHeader label="Status" field="isActive" sortBy={sortBy} sortOrder={sortOrder} onSort={toggleSort} />
                    </TableHead>
                    <TableHead className="sticky right-0 bg-surface-2 py-4 pl-4 pr-6 text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-surface-2 text-sm text-ink-soft">
                  {categories.map((category, index) => {
                    const id = categoryId(category) || `${category.name}-${index}`;
                    const active = category.isActive !== false;
                    return (
                      <TableRow key={id} className={`group border-b border-surface-2 transition-colors duration-500 hover:bg-surface-2/80 ${isItemHighlighted(id) ? "bg-brand-soft ring-2 ring-inset ring-brand/25" : ""}`}>
                        <TableCell className="py-4 pl-6 pr-4">
                          <div className="flex items-center gap-3">
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-btn/10 text-brand-strong"><Tags className="size-4" /></span>
                            <span className="text-sm font-bold text-ink">{category.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-90 px-4 py-4 text-xs leading-5 text-ink-soft">{category.description || "No description provided."}</TableCell>
                        <TableCell className="px-4 py-4">
                          <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-bold ${active ? "bg-ok-soft text-ok" : "bg-surface-2 text-muted"}`}>{active ? "Active" : "Inactive"}</span>
                        </TableCell>
                        <TableCell className="sticky right-0 bg-surface py-4 pl-4 pr-6 group-hover:bg-surface-2">
                          <ManagementRowActions
      readOnly={category.isActive === false}
                            activity={{ entityType: "CATEGORY", entityId: categoryId(category), name: category.name }}
                            editLabel={`Edit ${category.name}`}
                            actionLabel={active ? "Deactivate category" : "Activate category"}
                            actionDestructive={active}
                            disabled={statusMutation.isPending}
                            onEdit={() => openEdit(category)}
                            onAction={() => setChangingStatusCategory(category)}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </>
        )}
        {!categoriesQuery.isPending && !categoriesQuery.isError && (
          <ListPagination
            total={total}
            page={page}
            limit={limit}
            onPageChange={setPage}
            onLimitChange={(nextLimit) => {
              setLimit(nextLimit);
              setPage(1);
            }}
          />
        )}
      </DataTableShell>

      <DialogPrimitive.Root open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-[2px]" />
          <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-line bg-surface p-5 shadow-2xl outline-none sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div><DialogPrimitive.Title className="text-lg font-bold text-ink">{editingCategory ? "Edit category" : "Add a category"}</DialogPrimitive.Title><DialogPrimitive.Description className="mt-1 text-xs leading-5 text-muted">Use a clear name and short description so teammates can classify businesses consistently.</DialogPrimitive.Description></div>
              <DialogPrimitive.Close aria-label="Close" className="rounded-lg p-2 text-muted hover:bg-surface-2"><X className="size-4" /></DialogPrimitive.Close>
            </div>
            <form onSubmit={(event) => void submitCategory(event)} className="space-y-4">
              <div className="space-y-1.5"><label htmlFor="category-name" className="text-xs font-semibold text-ink-soft">Category name</label><Input id="category-name" name="name" required maxLength={100} defaultValue={editingCategory?.name ?? ""} placeholder="e.g. Manufacturing" className="h-11 rounded-xl" /></div>
              <div className="space-y-1.5"><label htmlFor="category-description" className="text-xs font-semibold text-ink-soft">Description <span className="font-normal text-muted">(optional)</span></label><textarea id="category-description" name="description" maxLength={500} defaultValue={editingCategory?.description ?? ""} rows={4} placeholder="Describe which businesses belong in this category…" className="w-full resize-y rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none placeholder:text-muted focus:border-brand focus:ring-2 focus:ring-brand/15" /></div>
              {formError && <p role="alert" className="rounded-lg bg-bad-soft p-3 text-xs text-bad">{formError}</p>}
              <div className="flex justify-end gap-2 border-t border-surface-2 pt-4">
                <Button type="button" variant="outline" disabled={mutationPending} onClick={() => setDialogOpen(false)} className="rounded-xl">Cancel</Button>
                <Button type="submit" disabled={mutationPending} className="rounded-xl">{mutationPending && <LoaderCircle className="size-4 animate-spin" />}{editingCategory ? "Save changes" : "Create category"}</Button>
              </div>
            </form>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
      <ManagementConfirmDialog
        open={Boolean(changingStatusCategory)}
        title={
          changingStatusCategory?.isActive === false
            ? "Activate category?"
            : "Deactivate category?"
        }
        description={
          changingStatusCategory
            ? `Are you sure you want to ${
                changingStatusCategory.isActive === false ? "activate" : "deactivate"
              } the “${changingStatusCategory.name}” category?`
            : ""
        }
        confirmLabel={
          changingStatusCategory?.isActive === false
            ? "Activate category"
            : "Deactivate category"
        }
        destructive={changingStatusCategory?.isActive !== false}
        pending={statusMutation.isPending}
        onCancel={() => setChangingStatusCategory(null)}
        onConfirm={() => void confirmStatusChange()}
      />
        </>
      }
    />
  );
}
