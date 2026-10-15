"use client";

import { useState, useMemo } from "react";
import { usePagination } from "@/hooks/usePagination";

export interface UseAdminFilterOptions<Item, Filter extends string = string, SecondaryFilter extends string = string> {
  data: Item[];
  initialFilter?: Filter;
  initialSecondaryFilter?: SecondaryFilter;
  pageSize?: number;
  predicate: (
    item: Item,
    searchQuery: string,
    filter: Filter,
    secondaryFilter?: SecondaryFilter
  ) => boolean;
}

export function useAdminFilter<Item, Filter extends string = string, SecondaryFilter extends string = string>({
  data,
  initialFilter = "all" as Filter,
  initialSecondaryFilter,
  pageSize = 15,
  predicate,
}: UseAdminFilterOptions<Item, Filter, SecondaryFilter>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterValue, setFilterValue] = useState<Filter>(initialFilter);
  const [secondaryFilterValue, setSecondaryFilterValue] = useState<SecondaryFilter | undefined>(
    initialSecondaryFilter
  );

  const filteredData = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return data.filter((item) =>
      predicate(item, q, filterValue, secondaryFilterValue)
    );
  }, [data, searchQuery, filterValue, secondaryFilterValue, predicate]);

  const pagination = usePagination(filteredData, pageSize);

  const resetFilters = () => {
    setSearchQuery("");
    setFilterValue(initialFilter);
    setSecondaryFilterValue(initialSecondaryFilter);
  };

  return {
    searchQuery,
    setSearchQuery,
    filterValue,
    setFilterValue,
    secondaryFilterValue,
    setSecondaryFilterValue,
    filteredData,
    pagination,
    resetFilters,
  };
}
