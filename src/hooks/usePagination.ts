import { useState, useMemo, useCallback } from "react";

/**
 * Generic pagination hook.
 * Provides sliced items, page counters, and navigation helpers.
 *
 * To reset the page when filters/search change, call `resetPage()` from the
 * same event handler that updates the filter state — this avoids the
 * react-hooks/set-state-in-effect anti-pattern.
 */
export function usePagination<T>(
  items: T[],
  pageSize: number = 20
) {
  const [currentPage, setCurrentPage] = useState(0);

  const pageCount = useMemo(
    () => Math.max(1, Math.ceil(items.length / pageSize)),
    [items.length, pageSize]
  );

  // Clamp page to valid range on every render — no effect needed.
  const safePage = Math.min(currentPage, Math.max(0, pageCount - 1));

  const paginatedItems = useMemo(
    () => items.slice(safePage * pageSize, (safePage + 1) * pageSize),
    [items, safePage, pageSize]
  );

  const nextPage = useCallback(
    () => setCurrentPage((p) => Math.min(pageCount - 1, p + 1)),
    [pageCount]
  );

  const prevPage = useCallback(
    () => setCurrentPage((p) => Math.max(0, Math.min(p, pageCount - 1) - 1)),
    [pageCount]
  );

  const resetPage = useCallback(() => setCurrentPage(0), []);

  return {
    paginatedItems,
    currentPage: safePage,
    pageCount,
    total: items.length,
    startIndex: safePage * pageSize,
    endIndex: Math.min((safePage + 1) * pageSize, items.length),
    isFirstPage: safePage === 0,
    isLastPage: safePage >= pageCount - 1,
    nextPage,
    prevPage,
    resetPage,
    setPage: setCurrentPage,
  };
}
