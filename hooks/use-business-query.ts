import apiClient from "@/api-client/api-client";
import { useQuery } from "@tanstack/react-query";

export const useBusinessQuery = ({ searchTerm, categoryId, page, limit }: { searchTerm: string; categoryId: string; page: number; limit: number }) => {
  return useQuery({
    queryKey: ["businesses-list", { searchTerm, categoryId, page, limit }],
    queryFn: async () => {
      const queryParams: Record<string, string> = {};
      if (searchTerm) {
        queryParams.search = searchTerm;
      }
      if (categoryId && categoryId !== "all") {
        queryParams.categoryId = categoryId;
      }
      queryParams.page = page.toString();
      queryParams.limit = limit.toString();
      const response = await apiClient.get("/api/businesses", { params: queryParams });
      return response.data;
    },
  });
};

export const useBusinessCategoriesQuery = ({ searchTerm }: { searchTerm: string }) => {
  return useQuery({
    queryKey: ["businesses-categories", { category: searchTerm }],
    queryFn: async () => {
      const response = await apiClient.get("/api/categories", { params: { search: searchTerm } });
      return response.data;
    }
  });
};