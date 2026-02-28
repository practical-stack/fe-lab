import { queryOptions } from '@tanstack/react-query'
import { delay } from '~/@lib/helper/async/delay'
import { generateTransactions, type TransactionItem } from './mock-data'

const PAGE_SIZE = 5

type MonthOffsetPageResponse = {
  items: TransactionItem[]
  totalCount: number
  page: number
  size: number
}

async function fetchMonthOffsetPage(
  startDate: string,
  endDate: string,
  page: number,
): Promise<MonthOffsetPageResponse> {
  await delay(500)

  // startDate format: "yyyy-MM-dd" → extract "yyyy-MM"
  const yearMonth = startDate.slice(0, 7)
  const allItems = generateTransactions(yearMonth, 23)
  const start = (page - 1) * PAGE_SIZE
  const items = allItems.slice(start, start + PAGE_SIZE)

  return {
    items,
    totalCount: allItems.length,
    page,
    size: PAGE_SIZE,
  }
}

export function monthOffsetQueryOptions(startDate: string, endDate: string, page: number) {
  return queryOptions({
    queryKey: ['pagination-demo', 'month-offset', startDate, endDate, page],
    queryFn: () => fetchMonthOffsetPage(startDate, endDate, page),
  })
}

export { PAGE_SIZE as MONTH_OFFSET_PAGE_SIZE }
