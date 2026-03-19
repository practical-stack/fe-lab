import { createFileRoute } from '@tanstack/react-router'
import { Panel } from '~/@lib/ui/common/panel'
import { ProblemDemo } from './-sub/problem-demo'
import { SolutionDemo } from './-sub/solution-demo'
import { ScrollRestoreDemo } from './-sub/scroll-restore-demo'
import { ConceptDiagrams } from './-sub/concept-diagrams'

export const Route = createFileRoute('/infinite-scroll-virtual/')({
  component: InfiniteScrollVirtualPage,
})

function InfiniteScrollVirtualPage() {
  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-gray-900">
        Infinite Scroll + Virtualization
      </h1>
      <p className="mb-8 text-gray-600">
        10,000개 상품을 무한 스크롤로 로드하면서, Window 기법(가상화)으로 DOM 노드를 최소화하고
        스크롤 위치를 복원하는 패턴.
      </p>

      <div className="space-y-12">
        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            1. 무한 스크롤: DOM 폭발 문제
          </h2>
          <div className="space-y-4">
            <Panel
              variant="problem"
              label="Problem"
              tag="Naive Infinite Scroll"
              data={{
                description:
                  '스크롤할수록 모든 아이템이 DOM에 누적됩니다. 200개만 로드해도 DOM 노드가 200개 → 브라우저 렌더링 성능이 저하되고 메모리 사용량이 증가합니다. 10,000개를 모두 로드하면 페이지가 버벅이게 됩니다.',
                demo: <ProblemDemo />,
                code: PROBLEM_CODE,
              }}
            />
            <Panel
              variant="solution"
              label="Solution"
              tag="useVirtualizer + useInfiniteQuery"
              data={{
                description:
                  'useVirtualizer로 화면에 보이는 아이템만 렌더링합니다. 10,000개를 로드해도 실제 DOM 노드는 ~15개 수준. overscan으로 스크롤 시 빈 영역 없이 부드럽게 동작합니다.',
                demo: <SolutionDemo />,
                code: SOLUTION_CODE,
              }}
            />
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            2. 스크롤 위치 복원
          </h2>
          <Panel
            variant="solution"
            label="Solution"
            tag="Virtualization + Scroll Restoration"
            data={{
              description:
                '상품을 클릭하면 상세 화면으로 전환됩니다. "돌아가기"를 누르면 useScrollRestoration 훅이 언마운트 시 저장한 scrollTop을 복원하여, 이전에 보던 위치로 즉시 돌아갑니다. TanStack Query의 캐시 덕분에 데이터 재요청 없이 즉시 렌더됩니다.',
              demo: <ScrollRestoreDemo />,
              code: SCROLL_RESTORE_CODE,
            }}
          />
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">핵심 개념 정리</h2>
          <ConceptDiagrams />
        </section>
      </div>
    </div>
  )
}

const PROBLEM_CODE = `// ❌ 모든 아이템이 DOM에 존재 → 성능 저하
const allItems = data.pages.flatMap((p) => p.items)

<div className="h-[400px] overflow-auto">
  {allItems.map((product) => (
    <ProductCard key={product.id} product={product} />
  ))}

  {/* IntersectionObserver로 하단 감지 */}
  <div ref={sentinelRef} />
</div>`

const SOLUTION_CODE = `// ✅ 보이는 아이템만 렌더 → 일정한 DOM 수
const virtualizer = useVirtualizer({
  count: allItems.length,
  getScrollElement: () => scrollRef.current,
  estimateSize: () => 88,  // 아이템 높이
  overscan: 5,             // 화면 밖 여유분
})

<div ref={scrollRef} className="h-[400px] overflow-auto">
  <div style={{ height: virtualizer.getTotalSize() }}>
    {virtualizer.getVirtualItems().map((vRow) => (
      <div
        key={vRow.key}
        style={{
          position: 'absolute',
          height: vRow.size,
          transform: \`translateY(\${vRow.start}px)\`,
        }}
      >
        <ProductCard product={allItems[vRow.index]} />
      </div>
    ))}
  </div>
</div>`

const SCROLL_RESTORE_CODE = `// scrollTop을 key 기반으로 저장/복원
const scrollPositions = new Map<string, number>()

function useScrollRestoration(
  scrollRef: RefObject<HTMLElement | null>,
  key: string,
) {
  // 언마운트 시 저장
  useEffect(() => {
    const el = scrollRef.current
    return () => {
      if (el) scrollPositions.set(key, el.scrollTop)
    }
  }, [scrollRef])

  // 마운트 시 복원
  useEffect(() => {
    const saved = scrollPositions.get(key)
    if (saved == null) return
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: saved })
    })
  }, [key, scrollRef])
}

// 사용
const scrollRef = useRef<HTMLDivElement>(null)
useScrollRestoration(scrollRef, 'product-list')`
