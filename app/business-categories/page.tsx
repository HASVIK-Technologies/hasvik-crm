"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import {
  Check,
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
import Breadcrumb from "@/components/common/Breadcrumb";
import ManagementConfirmDialog from "@/components/common/ManagementConfirmDialog";
import ManagementRowActions from "@/components/common/ManagementRowActions";
import ListPagination from "@/components/common/ListPagination";
import ListTableToolbar from "@/components/common/ListTableToolbar";
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
        const id = categoryId(editingCategory);
        if (!id) throw new Error("This category has no ID and cannot be updated.");
        await updateMutation.mutateAsync({ id, payload });
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
        <section className="grid grid-cols-2 gap-3 xl:grid-cols-3">
          {[
            { label: "All categories", value: total, icon: FolderKanban, tone: "text-primary bg-blue-50" },
            { label: "Active on page", value: activeCount, icon: Check, tone: "text-emerald-700 bg-emerald-50" },
            { label: "Inactive on page", value: inactiveCount, icon: CircleAlert, tone: "text-amber-700 bg-amber-50" },
          ].map(({ label, value, icon: Icon, tone }) => (
            <article key={label} className="flex items-center gap-3 rounded-2xl border border-[#e4ecf2] bg-white p-4 shadow-[0_4px_16px_rgba(20,40,60,0.03)] sm:p-5">
              <span className={`flex size-10 items-center justify-center rounded-xl ${tone}`}><Icon className="size-4" /></span>
              <span><span className="block text-xl font-bold text-slate-900">{value}</span><span className="mt-1 block text-xs text-slate-500">{label}</span></span>
            </article>
          ))}
        </section>
      }
      actions={
        <Actions
          primary={{ label: "Add category", onSelect: openCreate, icon: <Plus className="size-4" /> }}
          menuItems={[
            { label: showStats ? "Hide KPIs" : "Show KPIs", onSelect: () => setShowStats((visible) => !visible) },
          ]}
        />
      }
      content={
        <>
        <section className="overflow-hidden rounded-2xl border border-[#e4ecf2] bg-white shadow-[0_4px_16px_rgba(20,40,60,0.03)]">
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
          <div className="flex min-h-44 items-center justify-center"><LoaderCircle className="size-5 animate-spin text-primary" /><span className="ml-2 text-sm text-slate-500">Loading categories…</span></div>
        ) : categoriesQuery.isError ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm font-semibold text-slate-900">Categories couldn’t be loaded</p>
            <p className="mt-1 text-xs text-slate-500">Check your access and connection, then try again.</p>
            <Button variant="outline" size="sm" onClick={() => void categoriesQuery.refetch()} className="mt-4 rounded-lg">Try again</Button>
          </div>
        ) : categories.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <Tags className="mx-auto size-7 text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-800">No categories found</p>
            <p className="mt-1 text-xs text-slate-500">Create a category or adjust your search filters.</p>
          </div>
        ) : (
          <>
            <div data-layout-mobile className="flex flex-col gap-3 p-3 md:gap-4 md:p-4">
              {categories.map((category, index) => {
                const id = categoryId(category) || `${category.name}-${index}`;
                const active = category.isActive !== false;
                return (
                  <article key={id} className="flex items-start justify-between gap-3 rounded-2xl border border-[#eaf0f6] bg-white p-3 shadow-[0_2px_8px_rgba(20,40,60,0.02)] sm:p-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-primary"><Tags className="size-4" /></span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-[#0f172a]">{category.name}</p>
                        <p className="mt-1 text-xs leading-5 text-[#64748b]">{category.description || "No description provided."}</p>
                        <span className={`mt-2 inline-flex w-fit rounded-full px-2.5 py-1 text-[10px] font-bold ${active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{active ? "Active" : "Inactive"}</span>
                      </div>
                    </div>
                    <ManagementRowActions
                      editLabel={`Edit ${category.name}`}
                      actionLabel={active ? "Deactivate category" : "Activate category"}
                      actionDestructive={active}
                      disabled={statusMutation.isPending}
                      onEdit={() => openEdit(category)}
                      onAction={() => setChangingStatusCategory(category)}
                    />
                  </article>
                );
              })}
            </div>
            <div data-layout-desktop>
              <Table className="w-full min-w-[820px] text-left">
                <TableHeader className="text-[11px] font-semibold text-[#64748b]">
                  <TableRow className="border-b border-[#f1f5f9] hover:bg-transparent">
                    <TableHead className="py-4 pl-6 pr-4">
                      <SortableColumnHeader label="Category" field="name" sortBy={sortBy} sortOrder={sortOrder} onSort={toggleSort} />
                    </TableHead>
                    <TableHead className="px-4 py-4 font-semibold">Description</TableHead>
                    <TableHead className="px-4 py-4">
                      <SortableColumnHeader label="Status" field="isActive" sortBy={sortBy} sortOrder={sortOrder} onSort={toggleSort} />
                    </TableHead>
                    <TableHead className="py-4 pl-4 pr-6 text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-[#f1f5f9] text-sm text-[#334155]">
                  {categories.map((category, index) => {
                    const id = categoryId(category) || `${category.name}-${index}`;
                    const active = category.isActive !== false;
                    return (
                      <TableRow key={id} className="border-b border-[#f1f5f9] transition-colors hover:bg-[#f8fafc]/80">
                        <TableCell className="py-4 pl-6 pr-4">
                          <div className="flex items-center gap-3">
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-primary"><Tags className="size-4" /></span>
                            <span className="text-sm font-bold text-[#0f172a]">{category.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[360px] px-4 py-4 text-xs leading-5 text-[#475569]">{category.description || "No description provided."}</TableCell>
                        <TableCell className="px-4 py-4">
                          <span className={`inline-flex rounded-md px-2.5 py-1 text-[10px] font-bold ${active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{active ? "Active" : "Inactive"}</span>
                        </TableCell>
                        <TableCell className="py-4 pl-4 pr-6">
                          <ManagementRowActions
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
      </section>

      <DialogPrimitive.Root open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-[2px]" />
          <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl outline-none sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div><DialogPrimitive.Title className="text-lg font-bold text-slate-900">{editingCategory ? "Edit category" : "Add a category"}</DialogPrimitive.Title><DialogPrimitive.Description className="mt-1 text-xs leading-5 text-slate-500">Use a clear name and short description so teammates can classify businesses consistently.</DialogPrimitive.Description></div>
              <DialogPrimitive.Close aria-label="Close" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X className="size-4" /></DialogPrimitive.Close>
            </div>
            <form onSubmit={(event) => void submitCategory(event)} className="space-y-4">
              <div className="space-y-1.5"><label htmlFor="category-name" className="text-xs font-semibold text-slate-700">Category name</label><Input id="category-name" name="name" required maxLength={100} defaultValue={editingCategory?.name ?? ""} placeholder="e.g. Manufacturing" className="h-11 rounded-xl" /></div>
              <div className="space-y-1.5"><label htmlFor="category-description" className="text-xs font-semibold text-slate-700">Description <span className="font-normal text-slate-400">(optional)</span></label><textarea id="category-description" name="description" maxLength={500} defaultValue={editingCategory?.description ?? ""} rows={4} placeholder="Describe which businesses belong in this category…" className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/15" /></div>
              {formError && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">{formError}</p>}
              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
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
