import { createFileRoute } from '@tanstack/react-router'
import { SwipeableTabsDemo } from './-sub/swipeable-tabs-demo'
import { ConceptDiagrams } from './-sub/concept-diagrams'
import { Panel } from '~/@lib/ui/common/panel'

export const Route = createFileRoute('/swipeable-tabs/')({
  component: SwipeableTabsPage,
})

function SwipeableTabsPage() {
  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Swipeable Tabs</h1>
      <p className="mb-8 text-gray-600">
        탭 패널을 좌우 스와이프로 전환하고, 탭 클릭 시 해당 패널로 부드럽게 이동하는 패턴. CSS scroll-snap으로
        스와이프 제스처를 처리하고, 스크롤 위치에 따라 탭 인디케이터가 자동으로 이동합니다.
      </p>

      <div className="space-y-12">
        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Scroll-Snap Carousel + Tab Indicator
          </h2>
          <div className="space-y-4">
            <Panel
              variant="solution"
              label="Solution"
              tag="CSS scroll-snap + scrollIntoView + scrollend"
              data={{
                description:
                  'CSS scroll-snap-type: x mandatory로 패널 캐러셀을 구현하고, 탭 클릭 시 scrollIntoView로 해당 패널로 이동합니다. 사용자 스와이프 시 scroll 이벤트로 현재 패널 인덱스를 계산하여 selectedTab을 자동 갱신합니다. 탭 클릭에 의한 프로그래밍 스크롤과 사용자 스와이프는 isScrolling 플래그 + scrollend 이벤트로 구분합니다.',
                demo: <SwipeableTabsDemo />,
                code: SOLUTION_CODE,
              }}
            />
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">핵심 개념 정리</h2>
          <ConceptDiagrams />
        </section>
      </div>
    </div>
  )
}

const SOLUTION_CODE = `const TABS = [
  { id: 'home', label: '홈', icon: '🏠' },
  { id: 'files', label: '파일', icon: '📁' },
  ...
]

function SwipeableTabsDemo() {
  const [selectedTab, setSelectedTab] = useState('home')
  const carouselRef = useRef<HTMLDivElement>(null)
  const isScrolling = useRef(false)

  // 1) 탭 클릭 → 해당 패널로 smooth scroll
  const handleTabClick = (tabId: string) => {
    setSelectedTab(tabId)
    isScrolling.current = true

    const index = TABS.findIndex(t => t.id === tabId)
    const panel = carouselRef.current!.children[index]
    panel.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'start',
    })

    // scrollend로 프로그래밍 스크롤 종료 감지
    carousel.addEventListener(
      'scrollend',
      () => { isScrolling.current = false },
      { once: true }
    )
  }

  // 2) 스와이프(스크롤) → selectedTab 자동 갱신
  useEffect(() => {
    const carousel = carouselRef.current!
    const handleScroll = () => {
      if (isScrolling.current) return
      const index = Math.round(
        carousel.scrollLeft / carousel.offsetWidth
      )
      setSelectedTab(TABS[index].id)
    }
    carousel.addEventListener('scroll', handleScroll)
    return () => carousel.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div>
      {/* Tab List */}
      <div role="tablist" className="flex border-b">
        {TABS.map(tab => (
          <button
            role="tab"
            aria-selected={selectedTab === tab.id}
            onClick={() => handleTabClick(tab.id)}
          >
            {tab.label}
          </button>
        ))}
        {/* Animated indicator: transition으로 부드럽게 이동 */}
        <div className="absolute bottom-0 h-0.5 bg-blue-600
          transition-all duration-300" />
      </div>

      {/* Panel Carousel: scroll-snap으로 스와이프 */}
      <div
        ref={carouselRef}
        className="flex snap-x snap-mandatory overflow-x-auto"
        style={{ scrollbarWidth: 'none' }}
      >
        {TABS.map(tab => (
          <div
            role="tabpanel"
            className="w-full flex-none snap-start"
          >
            <TabContent tab={tab} />
          </div>
        ))}
      </div>
    </div>
  )
}`
