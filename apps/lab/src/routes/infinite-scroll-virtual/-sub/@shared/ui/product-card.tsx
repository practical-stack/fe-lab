import { Star } from 'lucide-react'
import type { Product } from '../api/mock-data'

export function ProductCard({ product, onClick }: { product: Product; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 text-left transition-colors hover:border-blue-300 hover:bg-blue-50/30"
    >
      <div
        className={`${product.imageColor} flex size-16 shrink-0 items-center justify-center rounded-lg text-xs font-medium text-gray-600`}
      >
        #{product.id}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">
            {product.category}
          </span>
          <span className="truncate text-sm font-medium text-gray-900">{product.name}</span>
        </div>
        <div className="mt-1 flex items-center gap-3">
          <span className="text-sm font-bold text-gray-900">
            {product.price.toLocaleString()}원
          </span>
          <span className="flex items-center gap-0.5 text-xs text-gray-500">
            <Star className="size-3 fill-amber-400 text-amber-400" />
            {product.rating.toFixed(1)}
            <span className="text-gray-400">({product.reviewCount.toLocaleString()})</span>
          </span>
        </div>
      </div>
    </button>
  )
}
