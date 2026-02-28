import { useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { monthOffsetQueryOptions, MONTH_OFFSET_PAGE_SIZE } from '../@shared/api/month-offset-api'
import { generateMonthOptions } from './month-option'

const MONTH_OPTIONS = generateMonthOptions()

export function useMonthOffsetPagination() {
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)

  const selectedMonth = MONTH_OPTIONS[selectedMonthIndex]
  const isFirstMonth = selectedMonthIndex === 0
  const isLastMonth = selectedMonthIndex === MONTH_OPTIONS.length - 1

  function navigateMonth(direction: 'prev' | 'next') {
    setSelectedMonthIndex((prev) => {
      if (direction === 'next' && prev > 0) return prev - 1
      if (direction === 'prev' && prev < MONTH_OPTIONS.length - 1) return prev + 1
      return prev
    })
    setCurrentPage(1)
  }

  function selectMonth(index: number) {
    setSelectedMonthIndex(index)
    setCurrentPage(1)
  }

  const { data, isPlaceholderData } = useQuery({
    ...monthOffsetQueryOptions(selectedMonth.startDate, selectedMonth.endDate, currentPage),
    placeholderData: keepPreviousData,
  })

  const totalPages = data ? Math.max(1, Math.ceil(data.totalCount / MONTH_OFFSET_PAGE_SIZE)) : 1

  return {
    items: data?.items ?? [],
    totalCount: data?.totalCount ?? 0,
    totalPages,
    currentPage,
    setCurrentPage,
    isStale: isPlaceholderData,

    months: MONTH_OPTIONS,
    selectedMonth,
    selectedMonthIndex,
    isFirstMonth,
    isLastMonth,
    navigateMonth,
    selectMonth,
  }
}
