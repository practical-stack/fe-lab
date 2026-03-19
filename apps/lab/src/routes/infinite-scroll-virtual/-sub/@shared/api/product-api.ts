import { infiniteQueryOptions } from '@tanstack/react-query'
import { delay } from '~/@lib/helper/async/delay'
import { getProducts, type Product } from './mock-data'

const PAGE_SIZE = 20

export type ProductPage = {
  items: Product[]
  nextCursor: number | null
  hasNext: boolean
  total: number
}

async function fetchProducts(cursor: number): Promise<ProductPage> {
  await delay(300)
  return getProducts(cursor, PAGE_SIZE)
}

export function productInfiniteQueryOptions() {
  return infiniteQueryOptions({
    queryKey: ['products', 'infinite'],
    queryFn: ({ pageParam }) => fetchProducts(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })
}
