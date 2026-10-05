import axios from "axios";
import { apiClient } from "@/lib/api/api-client";
import type {
  ApiBusiness,
  BusinessKpiParams,
  BusinessKpisResponse,
  BusinessQueryParams,
  BusinessesResponse,
  CreateBusinessPayload,
} from "@/types/business-api";

export interface ApiCategory {
  _id: string;
  name: string;
  description?: string;
  isActive?: boolean;
}

interface CategoriesResponse {
  data: ApiCategory[];
}

export async function getBusinesses(
  params: BusinessQueryParams,
  signal?: AbortSignal,
): Promise<BusinessesResponse> {
  const response = await apiClient.get<BusinessesResponse>("/businesses", {
    params,
    signal,
  });
  return response.data;
}

export async function getBusinessKpis(
  params: BusinessKpiParams,
  signal?: AbortSignal,
): Promise<BusinessKpisResponse> {
  const response = await apiClient.get<BusinessKpisResponse>(
    "/businesses/kpis",
    { params, signal },
  );
  return response.data;
}

export async function getBusinessRaw(
  id: string,
  signal?: AbortSignal,
): Promise<ApiBusiness> {
  const response = await apiClient.get<ApiBusiness>(`/businesses/${id}`, {
    signal,
  });
  return response.data;
}

export async function getCategories(): Promise<ApiCategory[]> {
  const response = await apiClient.get<CategoriesResponse>("/categories");
  return response.data.data ?? [];
}

async function updateBusinessRequest(
  id: string | number,
  payload: Record<string, unknown>,
): Promise<ApiBusiness> {
  try {
    const response = await apiClient.patch<ApiBusiness>(
      `/businesses/${id}`,
      payload,
    );
    return response.data;
  } catch (error: unknown) {
    if (
      axios.isAxiosError(error) &&
      (error.response?.status === 404 || error.response?.status === 405)
    ) {
      const response = await apiClient.put<ApiBusiness>(
        `/businesses/${id}`,
        payload,
      );
      return response.data;
    }
    throw error;
  }
}

export async function updateBusinessStatus(
  id: string | number,
  status: "Active" | "Inactive",
): Promise<ApiBusiness> {
  return updateBusinessRequest(id, { isActive: status === "Active" });
}

export async function updateBusinessData(
  id: string,
  payload: Partial<ApiBusiness> & Record<string, unknown>,
): Promise<ApiBusiness> {
  return updateBusinessRequest(id, payload);
}

export async function createBusinessData(
  payload: Partial<ApiBusiness> & Record<string, unknown>,
): Promise<ApiBusiness> {
  const response = await apiClient.post<ApiBusiness>("/businesses", payload);
  return response.data;
}

export async function createBusinessRequest(
  payload: CreateBusinessPayload,
): Promise<ApiBusiness> {
  return createBusinessData(payload);
}
