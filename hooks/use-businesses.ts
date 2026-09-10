import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { ApiBusiness, BusinessesResponse, BusinessQueryParams, BusinessesResult } from "@/types/business-api";
import type { BusinessItem } from "@/types/business";

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

export function toBusinessItem(business: ApiBusiness): BusinessItem {
  const initials = business.name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return {
    id: business._id,
    name: business.name,
    phone: getPrimaryNumber(business.phoneNumbers),
    initials: initials || "NB",
    avatarBg: "bg-[#e0eafe]",
    avatarTextColor: "text-[#2e90fa]",
    category: business.categoryId ?? "Uncategorized",
    city: business.city ?? "-",
    status: business.status === "INACTIVE" ? "Inactive" : "Active",
    lastFollowUp: formatCreatedAt(business.createdAt),
    nextFollowUp: "-",
    nextFollowUpType: "none",
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

  return {
    businesses: response.data.data.map(toBusinessItem),
    total: response.data.total,
    totalPages: response.data.totalPages,
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
