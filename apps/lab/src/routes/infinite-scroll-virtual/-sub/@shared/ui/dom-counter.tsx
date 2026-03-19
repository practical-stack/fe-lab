import { useEffect, useState } from 'react'

export function DomCounter({ containerRef }: { containerRef: React.RefObject<HTMLElement | null> }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const update = () => setCount(el.querySelectorAll('[data-product-item]').length)
    update()

    const observer = new MutationObserver(update)
    observer.observe(el, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [containerRef])

  return (
    <div className="flex items-center gap-2 rounded-md bg-gray-100 px-3 py-1.5 text-xs">
      <span className="text-gray-500">실제 DOM 노드:</span>
      <span className={`font-bold ${count > 100 ? 'text-red-600' : 'text-green-600'}`}>
        {count}개
      </span>
    </div>
  )
}
