"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createUser,
  deleteUser,
  getUsers,
  updateUser,
} from "@/lib/users/api";
import type {
  CreateUserPayload,
  UpdateUserPayload,
  UserRole,
} from "@/types/user";

export const userQueryKeys = {
  all: ["users"] as const,
  lists: () => [...userQueryKeys.all, "list"] as const,
  list: (
    search: string,
    role: UserRole | "ALL",
    page: number,
    limit: number,
    sortBy: string,
    sortOrder: "asc" | "desc",
    isActive?: boolean,
    tenantId?: string,
  ) =>
    [...userQueryKeys.lists(), { search, role, page, limit, sortBy, sortOrder, isActive, tenantId }] as const,
};

export function useUsersQuery(
  search: string,
  role: UserRole | "ALL",
  page = 1,
  limit = 10,
  sortBy = "fullName",
  sortOrder: "asc" | "desc" = "asc",
  isActive?: boolean,
  tenantId?: string,
) {
  return useQuery({
    queryKey: userQueryKeys.list(search, role, page, limit, sortBy, sortOrder, isActive, tenantId),
    queryFn: ({ signal }) =>
      getUsers(signal, { search, role, page, limit, sortBy, sortOrder, isActive, tenantId }),
  });
}

export function useUpdateUserStatus() {
  const refresh = useRefreshUsers();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => updateUser(id, { isActive }),
    onSuccess: (_, variables) => {
      void refresh();
      toast.success(variables.isActive ? "User activated." : "User deactivated.");
    },
    onError: (error) => { if (error instanceof Error) toast.error(error.message); },
  });
}

function useRefreshUsers() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
}

export function useCreateUser() {
  const refresh = useRefreshUsers();
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => createUser(payload),
    onSuccess: () => {
      void refresh();
      toast.success("User created.");
    },
  });
}

export function useUpdateUser() {
  const refresh = useRefreshUsers();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      updateUser(id, payload),
    onSuccess: () => {
      void refresh();
      toast.success("User updated.");
    },
  });
}

export function useDeleteUser() {
  const refresh = useRefreshUsers();
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      void refresh();
      toast.success("User deactivated.");
    },
  });
}
