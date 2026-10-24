"use client";

import { useListActionHighlight } from "@/hooks/use-list-action-highlight";

import { useState, type FormEvent } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import {
  Filter,
  ChartNoAxesCombined,
  LoaderCircle,
  Plus,
  ShieldCheck,
  UserRound,
  UsersRound,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useCreateUser, useDeleteUser, useUpdateUser, useUsersQuery } from "@/hooks/use-users";
import { getApiErrorMessage } from "@/lib/api/api-error";
import type { CreateUserPayload, UserRecord, UserRole } from "@/types/user";

const roles: UserRole[] = ["ADMIN", "MANAGER", "SALES", "USER"];

function userId(user: UserRecord) {
  return user._id ?? user.id ?? user.userId ?? "";
}

function roleLabel(role: string) {
  return role.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function RoleBadge({ role }: { role: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-700">
      <ShieldCheck className="size-3" />
      {roleLabel(role)}
    </span>
  );
}

export default function UsersPage() {
  const { highlightItem, isItemHighlighted } = useListActionHighlight("users");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState("fullName");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showStats, setShowStats] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [deactivatingUser, setDeactivatingUser] = useState<UserRecord | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const usersQuery = useUsersQuery(
    debouncedSearch,
    roleFilter,
    page,
    limit,
    sortBy,
    sortOrder,
  );
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();
  const users = usersQuery.data?.items ?? [];
  const total = usersQuery.data?.total ?? 0;
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
    setEditingUser(null);
    setFormError("");
    setDialogOpen(true);
  }

  function openEdit(user: UserRecord) {
    setEditingUser(user);
    setFormError("");
    setDialogOpen(true);
  }

  async function submitUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const fullName = String(formData.get("fullName") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const role = String(formData.get("role") ?? "USER") as UserRole;
    const password = String(formData.get("password") ?? "");

    try {
      if (editingUser) {
        const id = userId(editingUser);
        if (!id) throw new Error("This user record has no ID and cannot be updated.");
        await updateMutation.mutateAsync({
          id,
          payload: {
            fullName,
            email,
            role,
            ...(password ? { password } : {}),
          },
        });
        highlightItem(id);
      } else {
        const payload: CreateUserPayload = { fullName, email, role, password };
        await createMutation.mutateAsync(payload);
      }
      setDialogOpen(false);
      setEditingUser(null);
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    }
  }

  async function confirmDeactivateUser() {
    if (!deactivatingUser) return;
    const id = userId(deactivatingUser);
    if (!id) return;
    try {
      await deleteMutation.mutateAsync(id);
      highlightItem(id);
      setDeactivatingUser(null);
    } catch {
      // The API interceptor displays the request error.
    }
  }

  return (
    <>
      <ListPageLayout
        breadcrumb={<Breadcrumb items={[{ label: "User management" }]} />}
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Search users by name or email"
        filters={
          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="users-role-filter" className="text-xs font-medium text-slate-600">Role</label>
            <Select
              value={roleFilter}
              onValueChange={(value) => {
                setRoleFilter(value as UserRole | "ALL");
                setPage(1);
              }}
            >
              <SelectTrigger id="users-role-filter" size="sm" className="w-44 rounded-lg text-xs">
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="ALL" className="text-xs">All roles</SelectItem>
                {roles.map((role) => (
                  <SelectItem key={role} value={role} className="text-xs">
                    {roleLabel(role)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters((visible) => !visible)}
        onResetFilters={() => {
          setSearch("");
          setRoleFilter("ALL");
          setPage(1);
        }}
        resultCount={total}
        showStats={showStats}
        stats={
          <KpiCards items={[
              { label: "Team members", value: total, icon: UsersRound, tone: "text-primary bg-blue-50" },
              { label: "Administrators on page", value: users.filter((item) => item.role.toUpperCase() === "ADMIN").length, icon: ShieldCheck, tone: "text-emerald-700 bg-emerald-50" },
              { label: "Workspace roles", value: roles.length, icon: UserRound, tone: "text-violet-700 bg-violet-50" },
            ].map((item, index) => ({ ...item, tone: (["blue", "green", "violet"] as const)[index] }))} />
        }
        actions={
          <Actions
            primary={{ label: "Add user", onSelect: openCreate, icon: <Plus className="size-4" /> }}
            menuItems={[
              { label: showStats ? "Hide KPIs" : "Show KPIs", icon: <ChartNoAxesCombined className="size-4" />, onSelect: () => setShowStats((visible) => !visible) },
              { label: showFilters ? "Hide filters" : "Show filters", onSelect: () => setShowFilters((visible) => !visible), icon: <Filter className="size-4" /> },
            ]}
          />
        }
        content={
          <DataTableShell>
            <ListTableToolbar
              title="Users"
              total={total}
              sortValue={`${sortBy}:${sortOrder}`}
              sortOptions={[
                { value: "fullName:asc", label: "Name A–Z" },
                { value: "fullName:desc", label: "Name Z–A" },
                { value: "email:asc", label: "Email A–Z" },
                { value: "email:desc", label: "Email Z–A" },
              ]}
              onSortChange={setSortPreset}
            />
            {usersQuery.isPending ? (
              <div className="flex min-h-44 items-center justify-center"><LoaderCircle className="size-5 animate-spin text-primary" /><span className="ml-2 text-sm text-slate-500">Loading users…</span></div>
            ) : usersQuery.isError ? (
              <div className="px-5 py-12 text-center">
                <p className="text-sm font-semibold text-slate-900">Users couldn’t be loaded</p>
                <p className="mt-1 text-xs text-slate-500">Check your access and connection, then try again.</p>
                <Button variant="outline" size="sm" onClick={() => void usersQuery.refetch()} className="mt-4 rounded-lg">Try again</Button>
              </div>
            ) : users.length === 0 ? (
              <div className="px-5 py-14 text-center">
                <UserRound className="mx-auto size-7 text-slate-300" />
                <p className="mt-3 text-sm font-semibold text-slate-800">No users found</p>
                <p className="mt-1 text-xs text-slate-500">Try another search or add a teammate.</p>
              </div>
            ) : (
              <>
                <DataTableMobileList>
                  {users.map((user, index) => {
                    const id = userId(user) || `${user.email}-${index}`;
                    const initials = user.fullName.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
                    return (
                      <DataTableMobileCard key={id} className={`flex items-start justify-between gap-3 ${isItemHighlighted(id) ? "border-brand-blue bg-blue-50/80 ring-2 ring-brand-blue/20" : ""}`}>
                        <div className="flex min-w-0 items-start gap-3">
                          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{initials}</span>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-bold text-[#0f172a]">{user.fullName}</span>
                            <span className="mt-0.5 block break-all text-xs text-[#64748b]">{user.email}</span>
                            <span className="mt-1.5 block text-[11px] text-[#64748b]">{user.phoneNumber || "No contact number"}</span>
                            <span className="mt-2 block"><RoleBadge role={user.role} /></span>
                          </span>
                        </div>
                        <ManagementRowActions
                          editLabel={`Edit ${user.fullName}`}
                          actionLabel="Deactivate user"
                          actionDestructive
                          disabled={deleteMutation.isPending}
                          onEdit={() => openEdit(user)}
                          onAction={() => setDeactivatingUser(user)}
                        />
                      </DataTableMobileCard>
                    );
                  })}
                </DataTableMobileList>
                <div data-layout-desktop>
                  <Table className="w-full min-w-[760px] text-left">
                    <TableHeader>
                      <TableRow className="border-b border-[#f1f5f9] hover:bg-transparent">
                        <TableHead className="py-4 pl-6 pr-4">
                          <SortableColumnHeader label="User" field="fullName" sortBy={sortBy} sortOrder={sortOrder} onSort={toggleSort} />
                        </TableHead>
                        <TableHead className="px-4 py-4">
                          <SortableColumnHeader label="Email" field="email" sortBy={sortBy} sortOrder={sortOrder} onSort={toggleSort} />
                        </TableHead>
                        <TableHead className="px-4 py-4 font-semibold">Role</TableHead>
                        <TableHead className="sticky right-0 bg-slate-50 py-4 pl-4 pr-6 text-right font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-[#f1f5f9] text-sm text-[#334155]">
                      {users.map((user, index) => {
                        const id = userId(user) || `${user.email}-${index}`;
                        const initials = user.fullName.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
                        return (
                          <TableRow key={id} className={`group border-b border-[#f1f5f9] transition-colors duration-500 hover:bg-[#f8fafc]/80 ${isItemHighlighted(id) ? "bg-blue-50 ring-2 ring-inset ring-brand-blue/25" : ""}`}>
                            <TableCell className="py-4 pl-6 pr-4">
                              <div className="flex items-center gap-3">
                                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{initials}</span>
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-bold text-[#0f172a]">{user.fullName}</p>
                                  <p className="mt-0.5 text-xs text-[#64748b]">{user.phoneNumber || "No contact number"}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="px-4 py-4 text-xs text-[#475569]">{user.email}</TableCell>
                            <TableCell className="px-4 py-4"><RoleBadge role={user.role} /></TableCell>
                            <TableCell className="sticky right-0 bg-white py-4 pl-4 pr-6 group-hover:bg-slate-50">
                              <ManagementRowActions
                                editLabel={`Edit ${user.fullName}`}
                                actionLabel="Deactivate user"
                                actionDestructive
                                disabled={deleteMutation.isPending}
                                onEdit={() => openEdit(user)}
                                onAction={() => setDeactivatingUser(user)}
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
            {!usersQuery.isPending && !usersQuery.isError && (
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
        }
      />

      <DialogPrimitive.Root open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-[2px]" />
          <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl outline-none sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div><DialogPrimitive.Title className="text-lg font-bold text-slate-900">{editingUser ? "Edit user" : "Add a user"}</DialogPrimitive.Title><DialogPrimitive.Description className="mt-1 text-xs leading-5 text-slate-500">Set the user’s profile details and workspace role.</DialogPrimitive.Description></div>
              <DialogPrimitive.Close aria-label="Close" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X className="size-4" /></DialogPrimitive.Close>
            </div>
            <form onSubmit={(event) => void submitUser(event)} className="space-y-4">
              <div className="space-y-1.5"><label htmlFor="user-full-name" className="text-xs font-semibold text-slate-700">Full name</label><Input id="user-full-name" name="fullName" required defaultValue={editingUser?.fullName ?? ""} autoComplete="name" className="h-11 rounded-xl" /></div>
              <div className="space-y-1.5"><label htmlFor="user-email" className="text-xs font-semibold text-slate-700">Email</label><Input id="user-email" name="email" type="email" required defaultValue={editingUser?.email ?? ""} autoComplete="email" className="h-11 rounded-xl" /></div>
              <div className="space-y-1.5"><label htmlFor="user-role" className="text-xs font-semibold text-slate-700">Role</label><select id="user-role" name="role" defaultValue={editingUser?.role ?? "USER"} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-primary">{roles.map((role) => <option key={role} value={role}>{roleLabel(role)}</option>)}</select></div>
              <div className="space-y-1.5"><label htmlFor="user-password" className="text-xs font-semibold text-slate-700">Password {editingUser && <span className="font-normal text-slate-400">(leave blank to keep current)</span>}</label><Input id="user-password" name="password" type="password" autoComplete={editingUser ? "new-password" : "new-password"} required={!editingUser} minLength={8} className="h-11 rounded-xl" /></div>
              {formError && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">{formError}</p>}
              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <Button type="button" variant="outline" disabled={mutationPending} onClick={() => setDialogOpen(false)} className="rounded-xl">Cancel</Button>
                <Button type="submit" disabled={mutationPending} className="rounded-xl">{mutationPending && <LoaderCircle className="size-4 animate-spin" />}{editingUser ? "Save changes" : "Create user"}</Button>
              </div>
            </form>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
      <ManagementConfirmDialog
        open={Boolean(deactivatingUser)}
        title="Deactivate user?"
        description={
          deactivatingUser
            ? `${deactivatingUser.fullName} will lose access to this workspace.`
            : ""
        }
        confirmLabel="Deactivate user"
        pending={deleteMutation.isPending}
        onCancel={() => setDeactivatingUser(null)}
        onConfirm={() => void confirmDeactivateUser()}
      />
    </>
  );
}
