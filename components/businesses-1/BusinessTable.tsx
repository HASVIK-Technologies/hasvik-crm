"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBusinessQuery } from "@/hooks/use-business-query";
import { BusinessListResponse } from "@/types/business-list";
import { useEffect, useState } from "react";
import { Button } from "@base-ui/react";

export function BusinessTable({}) {
  const [category, setCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const limit = 3;
  const {
    data,
    isLoading,
    error,
  }: {
    data: BusinessListResponse | undefined;
    isLoading: boolean;
    error: Error | null;
  } = useBusinessQuery({ searchTerm, categoryId: category, page, limit });

  // const { data: categoriesData } = useBusinessCategoriesQuery({ searchTerm: "" });
  const categoriesData = [
    { _id: "all", name: "All Categories" },
    {
      _id: "6aa2bdced894bfecd9379549",
      name: "Furniture",
    },
    { _id: "services", name: "Services" },
  ];

  useEffect(() => {
    setPage(1);
  }, [category, searchTerm, limit]);
  
  return (
    <div className="overflow-hidden rounded-md border bg-white">
      <div className="p-4 flex justify-between items-center">
        <Input
          className="w-1/3"
          type="text"
          placeholder="Search businesses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div>
          <Select
            value={category}
            onValueChange={(value) => setCategory(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by category..." />
            </SelectTrigger>
            <SelectContent>
              {categoriesData?.map((category: any) => (
                <SelectItem key={category._id} value={category._id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center">
                Loading...
              </TableCell>
            </TableRow>
          ) : error ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-red-500">
                Failed to load businesses.
              </TableCell>
            </TableRow>
          ) : (
            <>
              {data?.data.map((business) => (
                <TableRow key={business._id}>
                  <TableCell>{business.name}</TableCell>
                  <TableCell>{business.category?.name ?? "-"}</TableCell>
                  <TableCell>{business.status}</TableCell>
                </TableRow>
              ))}
            </>
          )}
        </TableBody>

      </Table>
      <div className="flex justify-between items-center p-4">
        <Button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
        >
          Previous
        </Button>
        <span>
          Page {page} of {Math.max(1, Math.ceil((data?.total ?? 0) / limit))}
        </span>
        <Button
          onClick={() => setPage((prev) => prev + 1)}
          disabled={
            page >= Math.max(1, Math.ceil((data?.total ?? 0) / limit))
          }
        >
          Next
        </Button>
      </div>
    </div>
  );
}
