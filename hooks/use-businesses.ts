import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { updateBusiness } from "@/lib/business-store";
import type { ApiBusiness, BusinessesResponse, BusinessQueryParams, BusinessesResult } from "@/types/business-api";
import type { BusinessItem } from "@/types/business";

export type CategoryOption = {
  id: string;
  name: string;
};

const defaultQueryParams: Required<Pick<BusinessQueryParams, "page" | "limit" | "sortBy">> = {
  page: 1,
  limit: 10,
  sortBy: "-createdAt",
};

function getPrimaryNumber(numbers: ApiBusiness["phoneNumbers"]): string {
  return numbers?.find((number) => number.isPrimary)?.number ?? numbers?.[0]?.number ?? "";
}

function formatCreatedAt(createdAt: string | undefined): string {
  if (!createdAt) return "-";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(createdAt));
}

function parseFollowUp(dateStr: string | undefined): {
  nextFollowUp: string;
  nextFollowUpType: BusinessItem["nextFollowUpType"];
} {
  if (!dateStr) {
    return { nextFollowUp: "-", nextFollowUpType: "none" };
  }

  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    return { nextFollowUp: dateStr, nextFollowUpType: "none" };
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const formattedDate = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);

  if (diffDays === 0) {
    return { nextFollowUp: "Today", nextFollowUpType: "today" };
  } else if (diffDays === 1) {
    return { nextFollowUp: "Tomorrow", nextFollowUpType: "tomorrow" };
  } else if (diffDays < 0) {
    return { nextFollowUp: formattedDate, nextFollowUpType: "overdue" };
  } else {
    return { nextFollowUp: formattedDate, nextFollowUpType: "date" };
  }
}

export function toBusinessItem(business: ApiBusiness): BusinessItem {
  const initials = business.name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const followUpInfo = parseFollowUp(business.nextFollowupDate);

  let resolvedCategory = "Uncategorized";
  const catObj = business.category as unknown;
  if (typeof catObj === "object" && catObj !== null && "name" in (catObj as Record<string, unknown>)) {
    resolvedCategory = String((catObj as { name?: string }).name || "Uncategorized");
  } else if (typeof business.category === "string" && business.category) {
    resolvedCategory = business.category;
  } else if (typeof business.categoryId === "string" && business.categoryId) {
    resolvedCategory = business.categoryId;
  }

  return {
    id: business._id,
    name: business.name,
    phone: getPrimaryNumber(business.phoneNumbers),
    initials: initials || "NB",
    avatarBg: "bg-[#e0eafe]",
    avatarTextColor: "text-[#2e90fa]",
    category: resolvedCategory,
    city: business.city ?? "-",
    state: business.state ?? "-",
    status: business.isActive === false || business.status === "INACTIVE" ? "Inactive" : "Active",
    lastFollowUp: formatCreatedAt(business.createdAt),
    nextFollowUp: followUpInfo.nextFollowUp,
    nextFollowUpType: followUpInfo.nextFollowUpType,
    nextFollowupDate: business.nextFollowupDate,
    reminder: business.reminder,
    description: business.description,
    notes: business.notes,
    owner: business.assignedTo,
    address: business.address,
    email: business.email,
    website: business.website,
    leadSource: business.leadSource,
    businessType: business.businessType,
    assignedTo: business.assignedTo,
    alternatePhone: getPrimaryNumber(business.whatsappNumbers),
  };
}

export async function getBusinesses(params: BusinessQueryParams = {}): Promise<BusinessesResult> {
  const response = await apiClient.get<BusinessesResponse>("/businesses", {
    params: { ...defaultQueryParams, isDeleted: false, ...params },
  });

  const limit = params.limit ?? defaultQueryParams.limit;
  const total = response.data.total ?? response.data.data?.length ?? 0;
  const totalPages =
    response.data.totalPages ?? Math.max(1, Math.ceil(total / limit));

  return {
    businesses: (response.data.data || []).map(toBusinessItem),
    total,
    totalPages,
  };
}

export async function getBusiness(id: string): Promise<BusinessItem> {
  const response = await apiClient.get<ApiBusiness>(`/businesses/${id}`);
  return toBusinessItem(response.data);
}

export function useBusinessesQuery(params: BusinessQueryParams) {
  return useQuery({
    queryKey: ["businesses", params],
    queryFn: () => getBusinesses(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useBusinessQuery(id: string | undefined) {
  return useQuery({
    queryKey: ["business", id],
    queryFn: () => getBusiness(id as string),
    enabled: Boolean(id),
  });
}

export type ApiCategory = {
  _id: string;
  name: string;
  description?: string;
  isActive?: boolean;
};

export type CategoriesResponse = {
  data: ApiCategory[];
};

export async function getCategories(): Promise<ApiCategory[]> {
  try {
    const response = await apiClient.get<CategoriesResponse>("/categories");
    return response.data.data || [];
  } catch {
    return [];
  }
}

export function useCategoriesQuery() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000,
  });
}


export async function updateBusinessStatus(
  id: string | number,
  status: "Active" | "Inactive",
): Promise<unknown> {
  const isNowActive = status === "Active";
  const payload = {
    isActive: isNowActive,
  };

  try {
    const response = await apiClient.patch(`/businesses/${id}`, payload);
    return response.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && (err.response?.status === 405 || err.response?.status === 404)) {
      const response = await apiClient.put(`/businesses/${id}`, payload);
      return response.data;
    }
    throw err;
  }
}

export function useUpdateBusinessStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string | number;
      status: "Active" | "Inactive";
    }) => {
      const result = await updateBusinessStatus(id, status);
      updateBusiness(id, { status });
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.setQueriesData(
        { queryKey: ["businesses"] },
        (oldData: BusinessesResult | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            businesses: oldData.businesses.map((item) =>
              String(item.id) === String(variables.id)
                ? { ...item, status: variables.status }
                : item,
            ),
          };
        },
      );

      queryClient.invalidateQueries({ queryKey: ["businesses"] });
      queryClient.invalidateQueries({ queryKey: ["business", String(variables.id)] });

      toast.success(
        variables.status === "Active"
          ? "Business activated successfully."
          : "Business deactivated successfully.",
      );
    },
    onError: (error) => {
      if (!axios.isAxiosError(error)) {
        toast.error(
          error instanceof Error ? error.message : "Failed to update business status.",
        );
      }
    },
  });
}

export async function getCategoryOptions(search: string): Promise<CategoryOption[]> {
  const response = await apiClient.get<unknown>("/categories/autocomplete", {
    params: { search },
  });
  const payload = response.data as { data?: unknown } | unknown[];
  const options = Array.isArray(payload)
    ? payload
    : Array.isArray(payload.data)
      ? payload.data
      : [];

  return options.flatMap((option) => {
    if (!option || typeof option !== "object") return [];
    const item = option as { _id?: unknown; id?: unknown; name?: unknown; label?: unknown };
    const id = item._id ?? item.id;
    const name = item.name ?? item.label;
    return typeof id === "string" && typeof name === "string" ? [{ id, name }] : [];
  });
}

export function useCategoryAutocomplete(search: string) {
  return useQuery({
    queryKey: ["categories", "autocomplete", search],
    queryFn: () => getCategoryOptions(search),
    enabled: search.trim().length > 0,
    staleTime: 60_000,
  });
}

export async function getBusinessRaw(id: string): Promise<ApiBusiness> {
  const response = await apiClient.get<ApiBusiness>(`/businesses/${id}`);
  return response.data;
}

export async function updateBusinessData(
  id: string,
  payload: Partial<ApiBusiness> & Record<string, unknown>,
): Promise<ApiBusiness> {
  try {
    const response = await apiClient.patch<ApiBusiness>(`/businesses/${id}`, payload);
    return response.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && (err.response?.status === 405 || err.response?.status === 404)) {
      const response = await apiClient.put<ApiBusiness>(`/businesses/${id}`, payload);
      return response.data;
    }
    throw err;
  }
}

export async function createBusinessData(
  payload: Partial<ApiBusiness> & Record<string, unknown>,
): Promise<ApiBusiness> {
  const response = await apiClient.post<ApiBusiness>("/businesses", payload);
  return response.data;
}

export function useUpdateBusinessMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<ApiBusiness> & Record<string, unknown>;
    }) => updateBusinessData(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["businesses"] });
      queryClient.invalidateQueries({ queryKey: ["business", String(variables.id)] });
      toast.success("Business updated successfully.");
    },
    onError: (error) => {
      if (!axios.isAxiosError(error)) {
        toast.error(
          error instanceof Error ? error.message : "Failed to update business.",
        );
      }
    },
  });
}

export function useCreateBusinessMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<ApiBusiness> & Record<string, unknown>) =>
      createBusinessData(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businesses"] });
      toast.success("Business created successfully.");
    },
    onError: (error) => {
      if (!axios.isAxiosError(error)) {
        toast.error(
          error instanceof Error ? error.message : "Failed to create business.",
        );
      }
    },
  });
}

