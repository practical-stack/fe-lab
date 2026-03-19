import { useCallback, useEffect, useRef, useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useVirtualizer } from '@tanstack/react-virtual'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@fe-lab/ui/components/button'
import { productInfiniteQueryOptions } from './@shared/api/product-api'
import { ProductCard } from './@shared/ui/product-card'
import { DomCounter } from './@shared/ui/dom-counter'
import { useScrollRestoration } from './@shared/ui/use-scroll-restoration'
import { generateProduct, type Product } from './@shared/api/mock-data'

const ITEM_HEIGHT = 88

type View = { type: 'list' } | { type: 'detail'; product: Product }

export function ScrollRestoreDemo() {
  const [view, setView] = useState<View>({ type: 'list' })

  if (view.type === 'detail') {
    return <ProductDetail product={view.product} onBack={() => setView({ type: 'list' })} />
  }

  return <ProductList onSelect={(product) => setView({ type: 'detail', product })} />
}

function ProductList({ onSelect }: { onSelect: (product: Product) => void }) {
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

  useScrollRestoration(scrollRef, 'scroll-restore-demo')

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
          <span className="ml-2 text-blue-500">← 상품을 클릭해보세요</span>
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
        <div className="relative w-full" style={{ height: virtualizer.getTotalSize() }}>
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
                      {isFetchingNextPage && (
                        <Loader2 className="size-5 animate-spin text-gray-400" />
                      )}
                    </div>
                  ) : (
                    <ProductCard product={product} onClick={() => onSelect(product)} />
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

function ProductDetail({ product, onBack }: { product: Product; onBack: () => void }) {
  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
        <ArrowLeft className="size-4" />
        목록으로 돌아가기
      </Button>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex gap-6">
          <div
            className={`${product.imageColor} flex size-32 items-center justify-center rounded-xl text-lg font-bold text-gray-600`}
          >
            #{product.id}
          </div>
          <div className="space-y-2">
            <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
              {product.category}
            </span>
            <h3 className="text-xl font-bold text-gray-900">{product.name}</h3>
            <p className="text-2xl font-bold text-blue-600">{product.price.toLocaleString()}원</p>
            <p className="text-sm text-gray-500">
              ⭐ {product.rating.toFixed(1)} · 리뷰 {product.reviewCount.toLocaleString()}개
            </p>
          </div>
        </div>
        <div className="mt-6 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
          💡 <strong>스크롤 복원 테스트:</strong> "목록으로 돌아가기"를 누르면 이전에 보던 위치로
          자동 복원됩니다. 리스트에서 충분히 스크롤을 내린 뒤 상품을 클릭하고, 돌아가서 확인해보세요.
        </div>
      </div>
    </div>
  )
}
