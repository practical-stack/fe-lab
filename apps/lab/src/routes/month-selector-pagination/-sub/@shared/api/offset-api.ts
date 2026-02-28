import { queryOptions } from '@tanstack/react-query'
import { delay } from '~/@lib/helper/async/delay'
import { generateTransactions, type TransactionItem } from './mock-data'

const PAGE_SIZE = 5

type OffsetPageResponse = {
  items: TransactionItem[]
  totalCount: number
  page: number
  size: number
}

async function fetchOffsetPage(page: number): Promise<OffsetPageResponse> {
  await delay(500)

  const allItems = generateTransactions('2025-03', 23)
  const start = (page - 1) * PAGE_SIZE
  const items = allItems.slice(start, start + PAGE_SIZE)

  return {
    items,
    totalCount: allItems.length,
    page,
    size: PAGE_SIZE,
  }
}

export function offsetQueryOptions(page: number) {
  return queryOptions({
    queryKey: ['pagination-demo', 'offset', page],
    queryFn: () => fetchOffsetPage(page),
  })
}

export { PAGE_SIZE as OFFSET_PAGE_SIZE }
