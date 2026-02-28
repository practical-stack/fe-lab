import { infiniteQueryOptions } from '@tanstack/react-query'
import { delay } from '~/@lib/helper/async/delay'
import { generateTransactions, type TransactionItem } from './mock-data'

const LIMIT = 5

type CursorPageResponse = {
  items: TransactionItem[]
  nextCursor: string | null
  hasNext: boolean
}

const ALL_ITEMS = generateTransactions('2025-02', 18)

async function fetchCursorPage(cursor: string | null): Promise<CursorPageResponse> {
  await delay(500)

  const startIndex = cursor ? parseInt(cursor, 10) : 0
  const items = ALL_ITEMS.slice(startIndex, startIndex + LIMIT)
  const nextIndex = startIndex + LIMIT
  const hasNext = nextIndex < ALL_ITEMS.length

  return {
    items,
    nextCursor: hasNext ? String(nextIndex) : null,
    hasNext,
  }
}

export function cursorInfiniteQueryOptions() {
  return infiniteQueryOptions({
    queryKey: ['pagination-demo', 'cursor'],
    queryFn: ({ pageParam }) => fetchCursorPage(pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })
}
