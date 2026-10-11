import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createTenant,
  getTenant,
  getTenants,
  updateTenant,
  updateTenantStatus,
} from "@/lib/tenants/api";
import type { CreateTenantPayload, UpdateTenantPayload } from "@/types/tenant";

export const tenantQueryKeys = {
  all: ["tenants"] as const,
  detail: (id: string) => [...tenantQueryKeys.all, "detail", id] as const,
  list: (scopeKey?: string) =>
    [...tenantQueryKeys.all, "list", scopeKey ?? "all"] as const,
};

export function useTenantQuery(id?: string, enabled = true) {
  return useQuery({
    queryKey: tenantQueryKeys.detail(id ?? ""),
    enabled: enabled && Boolean(id),
    queryFn: ({ signal }) => {
      if (!id) throw new Error("A tenant ID is required to load workspace details.");
      return getTenant(id, signal);
    },
  });
}

export function useTenantsQuery(enabled = true, scopeKey?: string) {
  return useQuery({
    queryKey: tenantQueryKeys.list(scopeKey),
    enabled,
    queryFn: ({ signal }) => getTenants(signal),
  });
}

function useRefreshTenants() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: tenantQueryKeys.all });
}

export function useCreateTenant() {
  const refresh = useRefreshTenants();
  return useMutation({
    mutationFn: (payload: CreateTenantPayload) => createTenant(payload),
    onSuccess: () => {
      void refresh();
      toast.success("Workspace created. You can now sign in.");
    },
  });
}

export function useUpdateTenant() {
  const refresh = useRefreshTenants();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateTenantPayload;
    }) => updateTenant(id, payload),
    onSuccess: () => {
      void refresh();
      toast.success("Tenant details updated.");
    },
  });
}

export function useUpdateTenantStatus() {
  const refresh = useRefreshTenants();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateTenantStatus(id, isActive),
    onSuccess: (_, variables) => {
      void refresh();
      toast.success(
        variables.isActive ? "Tenant activated." : "Tenant deactivated.",
      );
    },
  });
}
