import { useEffect, useMemo, useState } from "react";

export type SortDirection = "asc" | "desc";

export type ListSortOption = {
  value: string;
  label: string;
};

export type ListStatusOption = {
  value: string;
  label: string;
};

type UseListControlsOptions<T> = {
  items: T[];
  pageSize?: number;
  defaultSort?: string;
  defaultDirection?: SortDirection;
  filterFn: (item: T, filters: { search: string; status: string }) => boolean;
  sortFn: (a: T, b: T, sortBy: string, direction: SortDirection) => number;
  sortOptions: ListSortOption[];
  statusOptions: ListStatusOption[];
};

export function useListControls<T>({
  items,
  pageSize: initialPageSize = 10,
  defaultSort,
  defaultDirection = "desc",
  filterFn,
  sortFn,
  sortOptions,
  statusOptions,
}: UseListControlsOptions<T>) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sortBy, setSortBy] = useState(defaultSort ?? sortOptions[0]?.value ?? "date");
  const [sortDirection, setSortDirection] = useState<SortDirection>(defaultDirection);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  useEffect(() => {
    setPage(1);
  }, [search, status, sortBy, sortDirection, pageSize]);

  const filtered = useMemo(() => {
    const query = { search: search.trim(), status };
    return items
      .filter((item) => filterFn(item, query))
      .sort((a, b) => sortFn(a, b, sortBy, sortDirection));
  }, [items, search, status, sortBy, sortDirection, filterFn, sortFn]);

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const hasActiveFilters = search.trim() !== "" || status !== "all";

  const clearFilters = () => {
    setSearch("");
    setStatus("all");
  };

  return {
    search,
    setSearch,
    status,
    setStatus,
    sortBy,
    setSortBy,
    sortDirection,
    setSortDirection,
    page: currentPage,
    setPage,
    pageSize,
    setPageSize,
    totalItems,
    totalPages,
    paginatedItems,
    hasActiveFilters,
    clearFilters,
    sortOptions,
    statusOptions,
    showingFrom: totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1,
    showingTo: Math.min(currentPage * pageSize, totalItems),
  };
}
