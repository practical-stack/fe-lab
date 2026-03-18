import { useCallback, useEffect, useRef, useState } from 'react'

const TABS = [
  { id: 'shoes', label: '신발', emoji: '👟' },
  { id: 'tops', label: '상의', emoji: '👕' },
  { id: 'bottoms', label: '하의', emoji: '👖' },
  { id: 'accessories', label: '액세서리', emoji: '👜' },
] as const

type TabId = (typeof TABS)[number]['id']

const ITEMS_PER_SECTION = 6

export function StickyHeaderDemo() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})
  const [isStuck, setIsStuck] = useState(false)
  const [activeTab, setActiveTab] = useState<TabId>('shoes')
  const isClickScrolling = useRef(false)

  // Sentinel로 sticky 상태 감지
  useEffect(() => {
    const sentinel = sentinelRef.current
    const container = scrollContainerRef.current
    if (!sentinel || !container) return

    const observer = new IntersectionObserver(
      ([entry]) => setIsStuck(!entry.isIntersecting),
      { root: container, threshold: 0 }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  // 스크롤 위치에 따라 activeTab 자동 갱신
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const handleScroll = () => {
      if (isClickScrolling.current) return

      const tabBarHeight = 44
      const offset = container.scrollTop + tabBarHeight + 20

      for (let i = TABS.length - 1; i >= 0; i--) {
        const section = sectionRefs.current[TABS[i].id]
        if (section && section.offsetTop <= offset) {
          setActiveTab(TABS[i].id)
          break
        }
      }
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  const handleTabClick = useCallback((tabId: TabId) => {
    const section = sectionRefs.current[tabId]
    const container = scrollContainerRef.current
    if (!section || !container) return

    setActiveTab(tabId)
    isClickScrolling.current = true

    const tabBarHeight = 44
    const sectionGap = 16
    const targetTop = section.offsetTop - tabBarHeight - sectionGap

    container.scrollTo({ top: targetTop, behavior: 'smooth' })

    // smooth scroll이 실제로 끝난 뒤 스크롤 기반 감지 재활성화
    container.addEventListener(
      'scrollend',
      () => {
        isClickScrolling.current = false
      },
      { once: true }
    )
  }, [])

  return (
    <div
      ref={scrollContainerRef}
      className="relative h-[600px] overflow-y-auto rounded-lg border border-gray-200 bg-white"
    >
      <div className="p-6">
        <h3 className="mb-2 text-lg font-semibold text-gray-900">페이지 상단 콘텐츠</h3>
        <p className="mb-4 text-sm text-gray-600">
          아래로 스크롤하면 탭 바가 상단에 고정됩니다. 탭을 클릭하면 해당 섹션으로 이동합니다.
        </p>

        {/* Hero 영역 */}
        <div className="mb-6 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-8">
          <h2 className="mb-2 text-xl font-bold text-gray-800">상품 목록</h2>
          <p className="text-sm text-gray-600">카테고리별로 상품을 확인하세요.</p>
        </div>

        {/* Sentinel */}
        <div ref={sentinelRef} className="h-0" />

        {/* Sticky Tab Bar */}
        <div
          className={[
            'sticky top-0 z-10 -mx-6 flex border-b px-6 transition-all duration-200',
            isStuck
              ? 'border-gray-200 bg-white/95 shadow-sm backdrop-blur-sm'
              : 'border-gray-200 bg-gray-50',
          ].join(' ')}
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={[
                'relative px-4 py-3 text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-900',
              ].join(' ')}
            >
              {tab.emoji} {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
          ))}
          {isStuck && (
            <span className="ml-auto self-center text-xs text-gray-400">고정됨</span>
          )}
        </div>

        {/* 섹션별 상품 리스트 */}
        <div className="mt-4 space-y-8">
          {TABS.map((tab) => (
            <section
              key={tab.id}
              ref={(el) => {
                sectionRefs.current[tab.id] = el
              }}
            >
              <h3 className="mb-3 text-base font-semibold text-gray-900">
                {tab.emoji} {tab.label}
              </h3>
              <div className="space-y-3">
                {Array.from({ length: ITEMS_PER_SECTION }, (_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 rounded-lg border border-gray-100 p-4 transition-colors hover:bg-gray-50"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-lg">
                      {tab.emoji}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {tab.label} #{i + 1}
                      </p>
                      <p className="text-xs text-gray-500">
                        {tab.label} · 리뷰 {(i + 1) * 12}개
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {((i + 1) * 15000 + TABS.indexOf(tab) * 5000).toLocaleString()}원
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
