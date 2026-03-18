import { createFileRoute } from '@tanstack/react-router'
import { StickyHeaderDemo } from './-sub/sticky-header-demo'
import { ConceptDiagrams } from './-sub/concept-diagrams'
import { Panel } from '~/@lib/ui/common/panel'

export const Route = createFileRoute('/sticky-header/')({
  component: StickyHeaderPage,
})

function StickyHeaderPage() {
  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Sticky Header</h1>
      <p className="mb-8 text-gray-600">
        중간에 위치한 탭 바가 스크롤되어 화면 상단에 닿으면 고정되고, 탭 클릭 시 해당 섹션으로 이동하는 패턴.
      </p>

      <div className="space-y-12">
        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Sticky Tab + ScrollTo Section</h2>
          <div className="space-y-4">
            <Panel
              variant="solution"
              label="Solution"
              tag="IntersectionObserver + scrollTo + scrollend"
              data={{
                description:
                  'Sentinel(높이 0)로 sticky 상태를 감지하고, 탭 클릭 시 scrollTo로 해당 섹션으로 이동합니다. 스크롤 중에는 각 섹션의 offsetTop을 역순 탐색하여 activeTab을 자동 갱신합니다. 탭 클릭에 의한 스크롤과 사용자 스크롤은 isClickScrolling 플래그 + scrollend 이벤트로 정확하게 구분합니다.',
                demo: <StickyHeaderDemo />,
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


const SOLUTION_CODE = `
const TABS = [
  { id: 'shoes', label: '신발' },
  { id: 'tops', label: '상의' },
  ...
]

function StickyTabDemo() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})
  const [isStuck, setIsStuck] = useState(false)
  const [activeTab, setActiveTab] = useState('shoes')
  const isClickScrolling = useRef(false)

  // 1) Sentinel로 sticky 상태 감지
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsStuck(!entry.isIntersecting),
      { root: scrollContainerRef.current, threshold: 0 }
    )
    observer.observe(sentinelRef.current!)
    return () => observer.disconnect()
  }, [])

  // 2) 스크롤 위치 → activeTab 자동 갱신
  useEffect(() => {
    const container = scrollContainerRef.current!
    const handleScroll = () => {
      if (isClickScrolling.current) return
      const offset = container.scrollTop + TAB_BAR_HEIGHT + 20
      // 아래에서 위로 순회하여 현재 보이는 섹션 찾기
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

  // 3) 탭 클릭 → 해당 섹션으로 smooth scroll
  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId)
    isClickScrolling.current = true  // 스크롤 감지 일시 중단
    const target = sectionRefs.current[tabId]!
    container.scrollTo({
      top: target.offsetTop - TAB_BAR_HEIGHT,
      behavior: 'smooth',
    })
    // scrollend: 스크롤이 실제로 끝난 뒤 감지 재개
    container.addEventListener(
      'scrollend',
      () => { isClickScrolling.current = false },
      { once: true }
    )
  }

  return (
    <div ref={scrollContainerRef}>
      <HeroSection />
      <div ref={sentinelRef} className="h-0" />

      {/* Sticky Tab Bar */}
      <div className={cn("sticky top-0", isStuck && "shadow-sm")}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={activeTab === tab.id ? "active" : ""}
          >
            {tab.label}
            {activeTab === tab.id && <ActiveIndicator />}
          </button>
        ))}
      </div>

      {/* 섹션별 콘텐츠 */}
      {TABS.map(tab => (
        <section
          key={tab.id}
          ref={el => { sectionRefs.current[tab.id] = el }}
        >
          <SectionContent tab={tab} />
        </section>
      ))}
    </div>
  )
}`
