import { useCallback, useEffect, useRef } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Loader2 } from 'lucide-react'
import { productInfiniteQueryOptions } from './@shared/api/product-api'
import { ProductCard } from './@shared/ui/product-card'
import { DomCounter } from './@shared/ui/dom-counter'
import { useScrollRestoration } from './@shared/ui/use-scroll-restoration'

const ITEM_HEIGHT = 88 // 카드 높이 + gap

export function SolutionDemo() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery(
    productInfiniteQueryOptions(),
  )

  const allItems = data?.pages.flatMap((page) => page.items) ?? []
  const total = data?.pages[0]?.total ?? 0

  const scrollRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: hasNextPage ? allItems.length + 1 : allItems.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ITEM_HEIGHT,
    overscan: 5,
  })

  // 스크롤 위치 저장/복원
  useScrollRestoration(scrollRef, 'solution-virtual-scroll')

  // 마지막 아이템이 보이면 다음 페이지 fetch
  const virtualItems = virtualizer.getVirtualItems()
  const lastItem = virtualItems[virtualItems.length - 1]

  const fetchNextRef = useRef(fetchNextPage)
  fetchNextRef.current = fetchNextPage

  useEffect(() => {
    if (!lastItem) return
    if (lastItem.index >= allItems.length - 1 && hasNextPage && !isFetchingNextPage) {
      fetchNextRef.current()
    }
  }, [lastItem?.index, allItems.length, hasNextPage, isFetchingNextPage])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">
          {allItems.length.toLocaleString()} / {total.toLocaleString()}개 로드됨
        </p>
        <DomCounter containerRef={containerRef} />
      </div>

      <div
        ref={(el) => {
          ;(scrollRef as React.MutableRefObject<HTMLDivElement | null>).current = el
          ;(containerRef as React.MutableRefObject<HTMLDivElement | null>).current = el
        }}
        className="h-[400px] overflow-auto rounded-lg border border-gray-200 bg-gray-50 p-3"
      >
        <div
          className="relative w-full"
          style={{ height: virtualizer.getTotalSize() }}
        >
          {virtualItems.map((virtualRow) => {
            const isLoaderRow = virtualRow.index >= allItems.length
            const product = allItems[virtualRow.index]

            return (
              <div
                key={virtualRow.key}
                data-product-item={!isLoaderRow ? '' : undefined}
                className="absolute left-0 top-0 w-full"
                style={{
                  height: virtualRow.size,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <div className="pr-1 pb-2">
                  {isLoaderRow ? (
                    <div className="flex h-16 items-center justify-center">
                      {isFetchingNextPage ? (
                        <Loader2 className="size-5 animate-spin text-gray-400" />
                      ) : (
                        <span className="text-xs text-gray-400">모든 상품을 불러왔습니다</span>
                      )}
                    </div>
                  ) : (
                    <ProductCard product={product} />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
