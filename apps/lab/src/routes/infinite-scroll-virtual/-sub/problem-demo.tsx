import { useEffect, useRef } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { productInfiniteQueryOptions } from './@shared/api/product-api'
import { ProductCard } from './@shared/ui/product-card'
import { DomCounter } from './@shared/ui/dom-counter'

export function ProblemDemo() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery(
    productInfiniteQueryOptions(),
  )
  const containerRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const allItems = data?.pages.flatMap((page) => page.items) ?? []
  const total = data?.pages[0]?.total ?? 0

  // IntersectionObserver로 하단 감지 → 자동 다음 페이지
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0 },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">
          {allItems.length.toLocaleString()} / {total.toLocaleString()}개 로드됨
        </p>
        <DomCounter containerRef={containerRef} />
      </div>

      <div ref={containerRef} className="h-[400px] space-y-2 overflow-auto rounded-lg border border-gray-200 bg-gray-50 p-3">
        {allItems.map((product) => (
          <div key={product.id} data-product-item>
            <ProductCard product={product} />
          </div>
        ))}

        {/* 하단 sentinel — 보이면 fetchNextPage */}
        <div ref={sentinelRef} className="flex h-10 items-center justify-center">
          {isFetchingNextPage && <Loader2 className="size-5 animate-spin text-gray-400" />}
          {!hasNextPage && allItems.length > 0 && (
            <span className="text-xs text-gray-400">모든 상품을 불러왔습니다</span>
          )}
        </div>
      </div>
    </div>
  )
}
