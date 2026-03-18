import type { ReactNode } from 'react'

function ConceptCard({ number, title, description, children }: {
  number: number
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="border-b border-gray-100 bg-gray-50 px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
            {number}
          </span>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        </div>
      </div>
      <div className="p-5">
        <p className="mb-4 text-sm leading-relaxed text-gray-600">{description}</p>
        {children}
      </div>
    </div>
  )
}

/** 1. Sentinel 패턴 */
function SentinelDiagram() {
  return (
    <div className="flex gap-6">
      {/* Before scroll */}
      <div className="flex-1">
        <p className="mb-2 text-center text-xs font-medium text-gray-500">스크롤 전</p>
        <div className="overflow-hidden rounded-lg border-2 border-gray-300">
          <div className="relative">
            <div className="border-b border-dashed border-gray-200 bg-blue-50 px-3 py-4 text-center text-xs text-blue-700">
              Hero
            </div>
            <div className="flex items-center gap-1 border-b border-dashed border-gray-200 bg-green-50 px-3 py-1">
              <div className="h-0.5 flex-1 bg-green-400" />
              <span className="text-[10px] font-medium text-green-700">sentinel</span>
              <div className="h-0.5 flex-1 bg-green-400" />
            </div>
            <div className="border-b border-gray-200 bg-gray-100 px-3 py-2 text-center text-xs font-medium text-gray-700">
              Tab Bar
            </div>
            <div className="bg-white px-3 py-4 text-center text-xs text-gray-400">
              Content...
            </div>
          </div>
          <div className="bg-green-50 px-2 py-1 text-center">
            <span className="rounded bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700">
              isStuck = false
            </span>
          </div>
        </div>
      </div>

      {/* Arrow */}
      <div className="flex items-center">
        <span className="text-lg text-gray-300">→</span>
      </div>

      {/* After scroll */}
      <div className="flex-1">
        <p className="mb-2 text-center text-xs font-medium text-gray-500">스크롤 후</p>
        <div className="overflow-hidden rounded-lg border-2 border-blue-400">
          <div className="relative">
            <div className="border-b border-gray-200 bg-blue-600 px-3 py-2 text-center text-xs font-medium text-white shadow-sm">
              Tab Bar <span className="ml-1 rounded bg-blue-500 px-1 text-[10px]">sticky</span>
            </div>
            <div className="bg-white px-3 py-3 text-center text-xs text-gray-400">
              Content...
            </div>
            <div className="bg-white px-3 py-3 text-center text-xs text-gray-400">
              Content...
            </div>
            <div className="bg-white px-3 py-3 text-center text-xs text-gray-400">
              Content...
            </div>
          </div>
          <div className="bg-blue-50 px-2 py-1 text-center">
            <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700">
              isStuck = true
            </span>
          </div>
        </div>
        <p className="mt-1 text-center text-[10px] text-gray-400">
          sentinel이 위로 사라짐 → isIntersecting: false
        </p>
      </div>
    </div>
  )
}

/** 2. 역순 탐색 */
function ReverseTraversalDiagram() {
  const sections = [
    { label: 'Shoes', top: 300, match: true },
    { label: 'Tops', top: 800, match: true },
    { label: 'Bottoms', top: 1300, match: false },
    { label: 'Accessories', top: 1800, match: false },
  ]

  return (
    <div className="space-y-3">
      {/* offsetTop <= offset 의미 설명 */}
      <div className="mb-3 rounded-lg border border-blue-100 bg-blue-50/50 p-3">
        <p className="mb-1 text-xs font-semibold text-blue-800">offsetTop &lt;= offset 은 무슨 뜻인가?</p>
        <p className="text-[11px] leading-relaxed text-blue-700">
          <strong>offsetTop</strong>은 각 섹션이 콘텐츠 최상단에서 얼마나 떨어져 있는지(고정값),{' '}
          <strong>offset</strong>은 현재 화면에서 tab bar 바로 아래 지점의 위치(scrollTop + tabBarHeight + 여유값)이다.{' '}
          <strong>offsetTop &lt;= offset</strong>이면 해당 섹션이 tab bar 아래로 이미 지나갔거나 딱 도달한 것이므로,
          그 중 가장 마지막(가장 아래) 섹션이 현재 사용자가 보고 있는 섹션이 된다.
        </p>
      </div>

      <div className="rounded-lg bg-gray-50 p-3">
        <p className="mb-2 text-xs font-medium text-gray-500">
          scrollTop = 750 → offset = 750 + 44 + 20 = <span className="font-bold text-blue-600">814</span>
        </p>
        <div className="space-y-1.5">
          {[...sections].reverse().map((s, i) => (
            <div key={s.label} className="flex items-center gap-2 text-xs">
              {i === 2 ? (
                <span className="w-4 text-center text-blue-600">→</span>
              ) : (
                <span className="w-4" />
              )}
              <div className={[
                'flex flex-1 items-center justify-between rounded px-3 py-1.5',
                i < 2
                  ? 'border border-gray-200 bg-white text-gray-400 line-through'
                  : i === 2
                    ? 'border-2 border-blue-400 bg-blue-50 font-medium text-blue-700'
                    : 'border border-gray-200 bg-white text-gray-600',
              ].join(' ')}>
                <span>{s.label}</span>
                <span className="font-mono text-[10px]">offsetTop: {s.top}</span>
              </div>
              <span className="w-20 text-[10px] text-gray-400">
                {s.top <= 814 ? `${s.top} ≤ 814 ✓` : `${s.top} > 814 ✗`}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[10px] text-gray-500">
          ↑ 역순(아래→위)으로 순회 — 첫 번째로 조건을 만족하는 <strong>Tops</strong>가 activeTab
        </p>
      </div>
    </div>
  )
}

/** 3. scrollend */
function ScrollEndDiagram() {
  const steps = [
    { icon: '👆', label: '"하의" 탭 클릭', detail: 'isClickScrolling = true', color: 'red' as const },
    { icon: '🔇', label: 'scroll 감지 중단', detail: '신발, 상의 섹션을 지나가도 무시', color: 'gray' as const },
    { icon: '📜', label: 'smooth scroll 진행중...', detail: 'scrollTo({ behavior: "smooth" })', color: 'gray' as const },
    { icon: '🏁', label: 'scrollend 이벤트 발생', detail: '브라우저가 스크롤 완료를 알림', color: 'blue' as const },
    { icon: '🔊', label: 'scroll 감지 재개', detail: 'isClickScrolling = false', color: 'green' as const },
  ]

  const colors = {
    red: { bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-400', text: 'text-red-700' },
    gray: { bg: 'bg-gray-50', border: 'border-gray-200', dot: 'bg-gray-300', text: 'text-gray-500' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', dot: 'bg-blue-400', text: 'text-blue-700' },
    green: { bg: 'bg-green-50', border: 'border-green-200', dot: 'bg-green-400', text: 'text-green-700' },
  }

  return (
    <div className="relative pl-4">
      <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gray-200" />
      <div className="space-y-2">
        {steps.map((step) => {
          const c = colors[step.color]
          return (
            <div key={step.label} className="relative flex items-start gap-3">
              <div className={`relative z-10 mt-1.5 h-2.5 w-2.5 rounded-full ${c.dot} ring-2 ring-white`} />
              <div className={`flex-1 rounded-lg border ${c.border} ${c.bg} px-3 py-2`}>
                <p className={`text-xs font-medium ${c.text}`}>
                  {step.icon} {step.label}
                </p>
                <p className="text-[10px] text-gray-500">{step.detail}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/** 4. offset 보정 */
function OffsetDiagram() {
  return (
    <div className="space-y-3">
      {/* scrollTo 시각화 */}
      <div className="flex gap-4">
        {/* 보정 없이 */}
        <div className="flex-1">
          <p className="mb-2 text-center text-xs font-medium text-red-500">보정 없이</p>
          <div className="overflow-hidden rounded-lg border-2 border-red-200">
            <div className="relative">
              <div className="border-b border-gray-200 bg-gray-800 px-3 py-2 text-center text-xs font-medium text-white">
                Tab Bar (44px)
              </div>
              <div className="relative">
                <div className="absolute inset-x-0 top-0 z-10 border-b-2 border-dashed border-red-400 bg-red-50/80 px-3 py-1.5 text-xs font-medium text-red-600">
                  섹션 제목 ← 가려짐!
                </div>
                <div className="bg-white px-3 pt-8 pb-3 text-center text-xs text-gray-400">
                  Content...
                </div>
              </div>
            </div>
          </div>
          <p className="mt-1 text-center font-mono text-[10px] text-red-400">
            scrollTo(offsetTop)
          </p>
        </div>

        {/* 보정 후 */}
        <div className="flex-1">
          <p className="mb-2 text-center text-xs font-medium text-green-600">보정 후</p>
          <div className="overflow-hidden rounded-lg border-2 border-green-300">
            <div className="relative">
              <div className="border-b border-gray-200 bg-gray-800 px-3 py-2 text-center text-xs font-medium text-white">
                Tab Bar (44px)
              </div>
              <div className="bg-green-50/30 px-3 py-2 text-center">
                <span className="text-[10px] text-green-600">↕ sectionGap (16px)</span>
              </div>
              <div className="border-t border-green-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-900">
                섹션 제목
              </div>
              <div className="bg-white px-3 py-3 text-center text-xs text-gray-400">
                Content...
              </div>
            </div>
          </div>
          <p className="mt-1 text-center font-mono text-[10px] text-green-600">
            scrollTo(offsetTop - 44 - 16)
          </p>
        </div>
      </div>

      {/* 수식 */}
      <div className="rounded-lg bg-gray-900 p-3">
        <p className="font-mono text-xs text-gray-300">
          <span className="text-yellow-400">targetTop</span>
          {' = '}
          <span className="text-blue-400">section.offsetTop</span>
          {' - '}
          <span className="text-purple-400">tabBarHeight</span>
          {' - '}
          <span className="text-green-400">sectionGap</span>
        </p>
        <div className="mt-1 flex gap-4 text-[10px]">
          <span className="text-blue-400">절대 위치</span>
          <span className="text-purple-400">44px</span>
          <span className="text-green-400">16px</span>
        </div>
      </div>
    </div>
  )
}

/** 전체 구조 — scrollContainer 내부 레이아웃 */
function StructureDiagram() {
  const layers = [
    { label: 'Hero', height: 'py-6', bg: 'bg-blue-50', text: 'text-blue-600', offsetLabel: 'offsetTop: ~0' },
    { label: 'sentinel (h-0)', height: 'py-0.5', bg: 'bg-green-100', text: 'text-green-700', offsetLabel: null },
    { label: 'sticky tab bar (44px)', height: 'py-3', bg: 'bg-gray-800', text: 'text-white', offsetLabel: 'sticky top: 0', isSticky: true },
    { label: 'Section: Shoes', height: 'py-5', bg: 'bg-white', text: 'text-gray-700', offsetLabel: 'offsetTop: 300' },
    { label: 'Section: Tops', height: 'py-5', bg: 'bg-white', text: 'text-gray-700', offsetLabel: 'offsetTop: 800' },
    { label: 'Section: Bottoms', height: 'py-5', bg: 'bg-white', text: 'text-gray-700', offsetLabel: 'offsetTop: 1300' },
    { label: 'Section: Accessories', height: 'py-5', bg: 'bg-white', text: 'text-gray-700', offsetLabel: 'offsetTop: 1800' },
  ]

  return (
    <div>
        {/* scrollContainer 외곽 */}
        <div className="rounded-xl border-2 border-dashed border-gray-300 p-2">
          <p className="mb-1 text-[10px] font-medium text-gray-400">scrollContainer (overflow-y: auto)</p>

          {/* scrollable content */}
          <div className="overflow-hidden rounded-lg border border-gray-200">
            {layers.map((layer) => (
              <div
                key={layer.label}
                className={[
                  `${layer.height} ${layer.bg} px-3`,
                  'flex items-center justify-between',
                  layer.isSticky ? '' : 'border-b border-gray-100',
                ].join(' ')}
              >
                <span className={`text-xs font-medium ${layer.text}`}>{layer.label}</span>
                {layer.isSticky && (
                  <span className="rounded bg-yellow-400 px-1.5 py-0.5 text-[10px] font-bold text-yellow-900">
                    position: sticky
                  </span>
                )}
                {layer.offsetLabel && !layer.isSticky && (
                  <span className="text-[10px] text-gray-400">← {layer.offsetLabel}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* scrollTop / scrollHeight 설명 */}
        <div className="mt-3 flex gap-3">
          <div className="flex items-center gap-1.5 rounded bg-gray-100 px-2 py-1">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-[10px] text-gray-600">
              <strong>scrollTop</strong> — 위로 얼마나 스크롤했는지 (변동)
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded bg-gray-100 px-2 py-1">
            <div className="h-2 w-2 rounded-full bg-purple-500" />
            <span className="text-[10px] text-gray-600">
              <strong>offsetTop</strong> — 콘텐츠 상단에서의 거리 (고정)
            </span>
          </div>
        </div>
    </div>
  )
}

export function ConceptDiagrams() {
  return (
    <div className="space-y-4">
      <ConceptCard
        number={0}
        title="전체 구조 — scrollContainer 내부 레이아웃"
        description="scrollContainer 안에 Hero, sentinel, sticky tab bar, 그리고 섹션들이 순서대로 배치된다. scrollTop은 스크롤할 때마다 변하지만, 각 섹션의 offsetTop은 콘텐츠 상단에서의 거리이므로 고정된 값이다."
      >
        <StructureDiagram />
      </ConceptCard>

      <ConceptCard
        number={1}
        title="Sentinel 패턴 — sticky 상태 감지"
        description="CSS position: sticky만으로는 '지금 고정 상태인지' JS로 알 수 없다. 높이 0의 sentinel 요소를 sticky 대상 바로 위에 두고 IntersectionObserver로 감시하면, sentinel이 뷰포트를 벗어나는 순간 = sticky가 활성화되는 순간이므로 isStuck 상태를 정확히 얻을 수 있다."
      >
        <SentinelDiagram />
      </ConceptCard>

      <ConceptCard
        number={2}
        title="역순 탐색 — 스크롤 → activeTab 동기화"
        description="섹션들이 위→아래로 배치되므로 offsetTop ≤ offset 조건을 만족하는 섹션이 여러 개일 수 있다. 아래→위(역순)로 순회하면 '가장 아래에서 조건을 만족하는 섹션' = 현재 보고 있는 섹션을 바로 찾고 break한다."
      >
        <ReverseTraversalDiagram />
      </ConceptCard>

      <ConceptCard
        number={3}
        title="scrollend — 클릭 스크롤 vs 사용자 스크롤 충돌 방지"
        description="탭 클릭 → smooth scroll 중에 중간 섹션을 지나가면 scroll 이벤트로 activeTab이 깜빡거린다. isClickScrolling 플래그로 탭 클릭 스크롤 동안 감지를 중단하고, scrollend 이벤트로 스크롤이 실제로 끝난 시점에 정확하게 재개한다."
      >
        <ScrollEndDiagram />
      </ConceptCard>

      <ConceptCard
        number={4}
        title="offset 보정 — 탭 클릭 → 섹션 이동"
        description="scrollTo(section.offsetTop)만 하면 섹션 제목이 sticky tab bar 뒤에 가려진다. tabBarHeight를 빼서 가려지지 않게 하고, sectionGap을 추가로 빼서 여유 공간을 확보한다."
      >
        <OffsetDiagram />
      </ConceptCard>
    </div>
  )
}
