import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { offsetQueryOptions, OFFSET_PAGE_SIZE } from "./@shared/api/offset-api";

export function useOffsetPagination() {
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isPlaceholderData } = useQuery({
    ...offsetQueryOptions(currentPage),
    placeholderData: keepPreviousData,
  });

  const totalPages = data
    ? Math.max(1, Math.ceil(data.totalCount / OFFSET_PAGE_SIZE))
    : 1;

  return {
    items: data?.items ?? [],
    totalPages,
    currentPage,
    setCurrentPage,
    isStale: isPlaceholderData,
  };
}
