import type { ReactNode } from 'react'
import { CodeBlock } from '~/@lib/ui/common/code-block'

function ConceptCard({
  number,
  title,
  description,
  children,
}: {
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

/** 1. DOM 폭발 문제 시각화 */
function DomExplosionDiagram() {
  const stages = [
    { loaded: 20, dom: 20, color: 'green', label: '초기 로드' },
    { loaded: 100, dom: 100, color: 'yellow', label: '5번 스크롤' },
    { loaded: 500, dom: 500, color: 'orange', label: '25번 스크롤' },
    { loaded: 2000, dom: 2000, color: 'red', label: '100번 스크롤' },
  ]

  const colors = {
    green: { bar: 'bg-green-400', text: 'text-green-700', bg: 'bg-green-50' },
    yellow: { bar: 'bg-yellow-400', text: 'text-yellow-700', bg: 'bg-yellow-50' },
    orange: { bar: 'bg-orange-400', text: 'text-orange-700', bg: 'bg-orange-50' },
    red: { bar: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50' },
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-gray-50 p-4">
        <p className="mb-3 text-xs font-medium text-gray-500">
          Naive Infinite Scroll — 시간에 따른 DOM 노드 증가
        </p>
        <div className="space-y-2">
          {stages.map((s) => {
            const c = colors[s.color as keyof typeof colors]
            return (
              <div key={s.label} className="flex items-center gap-3">
                <span className="w-20 text-right text-[10px] text-gray-500">{s.label}</span>
                <div className="relative h-6 flex-1 rounded bg-gray-100">
                  <div
                    className={`${c.bar} flex h-full items-center rounded px-2 transition-all`}
                    style={{ width: `${Math.min((s.dom / 2000) * 100, 100)}%` }}
                  >
                    <span className="text-[10px] font-bold text-white">{s.dom}개</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <p className="mt-3 text-[10px] text-gray-400">
          flatMap으로 모든 페이지를 합치면 DOM 노드가 선형으로 증가 → 리페인트/리플로우 비용 폭증
        </p>
      </div>

      {/* 비교: 가상화 적용 */}
      <div className="rounded-lg border border-green-200 bg-green-50/30 p-4">
        <p className="mb-3 text-xs font-medium text-green-700">
          Virtualization 적용 — DOM 노드 수 일정
        </p>
        <div className="space-y-2">
          {stages.map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <span className="w-20 text-right text-[10px] text-gray-500">{s.label}</span>
              <div className="relative h-6 flex-1 rounded bg-gray-100">
                <div
                  className="flex h-full items-center rounded bg-green-400 px-2"
                  style={{ width: `${(15 / 2000) * 100}%`, minWidth: 60 }}
                >
                  <span className="text-[10px] font-bold text-white">~15개</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[10px] text-green-600">
          화면에 보이는 아이템 + overscan 만 렌더 → 데이터가 아무리 많아도 DOM 노드 수는 일정
        </p>
      </div>
    </div>
  )
}

/** 2. Virtualization 원리 — Window 기법 상세 */
function VirtualizationPrincipleDiagram() {
  return (
    <div className="space-y-6">
      {/* 2-A: 핵심 아이디어 — 창문 비유 */}
      <div>
        <p className="mb-3 text-xs font-semibold text-gray-700">A. 핵심 아이디어 — "창문(Window)"</p>
        <div className="rounded-lg border border-blue-100 bg-blue-50/30 p-4">
          <p className="mb-3 text-[11px] leading-relaxed text-gray-700">
            10,000개 아이템이 세로로 나열된 긴 두루마리를 상상해보세요.
            우리 화면(viewport)은 이 두루마리의 일부만 보여주는 <strong>작은 창문</strong>입니다.
            창문 밖의 아이템은 <strong>존재하지만 보이지 않으므로</strong>, 굳이 DOM에 만들 필요가 없습니다.
          </p>
          <div className="flex items-center gap-4">
            {/* 두루마리 */}
            <div className="relative w-32">
              <div className="rounded border border-gray-300 bg-gray-100">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className={`border-b border-gray-200 px-2 py-1 text-center text-[9px] ${
                      i >= 4 && i <= 7
                        ? 'bg-blue-100 font-medium text-blue-700'
                        : 'text-gray-400'
                    }`}
                  >
                    {i >= 4 && i <= 7 ? `아이템 ${i + 1} 👁️` : `아이템 ${i + 1}`}
                  </div>
                ))}
              </div>
              {/* viewport 표시 */}
              <div className="absolute top-[calc(33.3%-1px)] right-[-8px] h-[33.3%] w-1 rounded bg-blue-500" />
              <p className="mt-1 text-center text-[9px] text-gray-400">전체 리스트 (10,000개)</p>
            </div>
            <div className="text-lg text-gray-300">→</div>
            {/* 실제 DOM */}
            <div className="flex-1">
              <div className="rounded-lg border-2 border-blue-400 bg-white p-2">
                <p className="mb-1 text-center text-[10px] font-medium text-blue-600">실제 DOM (4개만)</p>
                {[5, 6, 7, 8].map((n) => (
                  <div key={n} className="mb-1 rounded bg-blue-50 px-2 py-1.5 text-center text-[10px] font-medium text-blue-700">
                    아이템 {n}
                  </div>
                ))}
              </div>
              <p className="mt-1 text-center text-[9px] text-green-600 font-medium">
                DOM 노드 99.96% 절약
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2-B: DOM 구조 — 3층 구조 */}
      <div>
        <p className="mb-3 text-xs font-semibold text-gray-700">B. DOM 3층 구조</p>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="mb-3 text-[11px] leading-relaxed text-gray-600">
            가상화의 DOM은 정확히 3개의 레이어로 구성됩니다. 각 레이어의 역할을 이해하면 전체 원리가 명확해집니다.
          </p>

          {/* 3층 구조도 */}
          <div className="space-y-0">
            {/* Layer 1: Scroll Container */}
            <div className="rounded-t-lg border-2 border-purple-400 bg-purple-50 px-3 py-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="rounded bg-purple-200 px-1.5 py-0.5 text-[10px] font-bold text-purple-800">
                    Layer 1
                  </span>
                  <span className="ml-2 text-[11px] font-medium text-purple-800">Scroll Container</span>
                </div>
                <span className="font-mono text-[10px] text-purple-600">overflow: auto; height: 400px</span>
              </div>
              <p className="mt-1 text-[10px] text-purple-700">
                고정된 높이의 뷰포트. 이 안에서만 스크롤이 발생합니다.
                <code className="ml-1 rounded bg-purple-100 px-1">scrollTop</code>으로 현재 위치를 추적합니다.
              </p>
            </div>

            {/* Layer 2: Inner div */}
            <div className="mx-4 border-x-2 border-blue-400 bg-blue-50 px-3 py-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="rounded bg-blue-200 px-1.5 py-0.5 text-[10px] font-bold text-blue-800">
                    Layer 2
                  </span>
                  <span className="ml-2 text-[11px] font-medium text-blue-800">Inner Div (Spacer)</span>
                </div>
                <span className="font-mono text-[10px] text-blue-600">height: getTotalSize()</span>
              </div>
              <p className="mt-1 text-[10px] text-blue-700">
                <strong>전체 콘텐츠의 높이를 "속이는" 역할.</strong>{' '}
                10,000 × 88px = 880,000px 높이를 가집니다.
                실제 내용은 거의 비어있지만, 이 높이 덕분에 스크롤바가 올바른 크기로 표시됩니다.
              </p>
            </div>

            {/* Layer 3: Virtual Items */}
            <div className="mx-8 rounded-b-lg border-2 border-t-0 border-green-400 bg-green-50 px-3 py-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="rounded bg-green-200 px-1.5 py-0.5 text-[10px] font-bold text-green-800">
                    Layer 3
                  </span>
                  <span className="ml-2 text-[11px] font-medium text-green-800">Virtual Items</span>
                </div>
                <span className="font-mono text-[10px] text-green-600">position: absolute</span>
              </div>
              <p className="mt-1 text-[10px] text-green-700">
                <strong>보이는 아이템만</strong> position: absolute로 정확한 위치에 배치합니다.
                <code className="mx-1 rounded bg-green-100 px-1">translateY(start)</code>로
                마치 그 자리에 원래 있었던 것처럼 위치시킵니다.
              </p>
            </div>
          </div>

          {/* HTML 구조 */}
          <div className="mt-3">
            <p className="mb-1 text-[10px] font-medium text-gray-500">실제 HTML 구조</p>
            <div className="rounded-lg border border-gray-200 bg-white">
              <CodeBlock code={HTML_STRUCTURE_CODE} />
            </div>
          </div>
        </div>
      </div>

      {/* 2-C: translateY 메커니즘 */}
      <div>
        <p className="mb-3 text-xs font-semibold text-gray-700">C. translateY — 아이템을 정확한 위치에 배치하는 원리</p>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="mb-3 text-[11px] leading-relaxed text-gray-600">
            모든 아이템은 <code className="rounded bg-gray-200 px-1">position: absolute</code>이므로 기본 위치는 top: 0입니다.
            <code className="rounded bg-gray-200 px-1">translateY(virtualRow.start)</code>로 각 아이템을 "있어야 할 위치"로 밀어냅니다.
          </p>

          {/* 위치 계산 시각화 */}
          <div className="flex gap-6">
            <div className="flex-1 space-y-1">
              <p className="text-[10px] font-medium text-gray-500">scrollTop = 26400 일 때</p>
              {[
                { index: 298, start: 26224, zone: 'overscan', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
                { index: 299, start: 26312, zone: 'overscan', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
                { index: 300, start: 26400, zone: 'viewport', bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700' },
                { index: 301, start: 26488, zone: 'viewport', bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700' },
                { index: 302, start: 26576, zone: 'viewport', bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700' },
                { index: 303, start: 26664, zone: 'viewport', bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700' },
                { index: 304, start: 26752, zone: 'viewport', bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700' },
                { index: 305, start: 26840, zone: 'overscan', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
                { index: 306, start: 26928, zone: 'overscan', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
              ].map((item) => (
                <div
                  key={item.index}
                  className={`flex items-center justify-between rounded border ${item.border} ${item.bg} px-2 py-1`}
                >
                  <span className={`text-[10px] font-medium ${item.text}`}>
                    #{item.index + 1} {item.zone === 'overscan' ? '(overscan)' : ''}
                  </span>
                  <span className="font-mono text-[9px] text-gray-500">
                    translateY({item.start.toLocaleString()}px)
                  </span>
                </div>
              ))}
            </div>

            {/* 계산 공식 */}
            <div className="w-52 space-y-3">
              <div className="rounded-lg bg-gray-900 p-3">
                <p className="mb-1 text-[10px] font-medium text-gray-400">위치 계산</p>
                <p className="font-mono text-[10px] text-gray-300">
                  <span className="text-green-400">start</span> ={' '}
                  <span className="text-blue-400">index</span> ×{' '}
                  <span className="text-purple-400">itemHeight</span>
                </p>
                <p className="mt-1 font-mono text-[10px] text-gray-300">
                  <span className="text-green-400">26400</span> ={' '}
                  <span className="text-blue-400">300</span> ×{' '}
                  <span className="text-purple-400">88</span>
                </p>
              </div>

              <div className="rounded-lg bg-gray-900 p-3">
                <p className="mb-1 text-[10px] font-medium text-gray-400">보이는 범위 계산</p>
                <p className="font-mono text-[10px] text-gray-300">
                  <span className="text-yellow-400">startIdx</span> ={' '}
                  <span className="text-cyan-400">scrollTop</span> /{' '}
                  <span className="text-purple-400">itemHeight</span>
                </p>
                <p className="font-mono text-[10px] text-gray-300">
                  <span className="text-yellow-400">endIdx</span> ={' '}
                  <span className="text-yellow-400">startIdx</span> +{' '}
                  <span className="text-blue-400">visibleCount</span>
                </p>
                <p className="mt-2 font-mono text-[10px] text-gray-500">
                  = 26400 / 88 = <span className="text-green-400">300</span>
                </p>
                <p className="font-mono text-[10px] text-gray-500">
                  = 300 + 5 = <span className="text-green-400">305</span>
                </p>
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50 p-2">
                <p className="text-[10px] font-bold text-amber-800">왜 translateY?</p>
                <p className="mt-0.5 text-[10px] leading-relaxed text-amber-700">
                  top 대신 transform을 쓰는 이유: transform은 <strong>GPU 가속</strong>이 되어
                  레이아웃(Reflow)을 트리거하지 않습니다. 즉, 스크롤 시 위치만 바뀌는 작업이
                  페인트 단계에서 처리되어 60fps를 유지합니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2-D: 스크롤 시 재계산 사이클 */}
      <div>
        <p className="mb-3 text-xs font-semibold text-gray-700">D. 스크롤 시 재계산 사이클</p>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="mb-3 text-[11px] leading-relaxed text-gray-600">
            사용자가 스크롤하면 virtualizer는 아래 사이클을 반복합니다.
            핵심은 <strong>DOM을 새로 만드는 게 아니라, 기존 DOM의 translateY만 바꾸는 것</strong>입니다.
          </p>

          <div className="flex items-start gap-3">
            {/* 사이클 다이어그램 */}
            <div className="flex-1">
              {[
                { step: '1', label: 'scroll 이벤트 발생', detail: 'scrollTop 값이 변경됨', icon: '📜', color: 'blue' },
                { step: '2', label: 'visible range 재계산', detail: 'startIndex = Math.floor(scrollTop / itemHeight)', icon: '🧮', color: 'purple' },
                { step: '3', label: 'getVirtualItems() 업데이트', detail: '새로운 visible range에 해당하는 virtualRow[] 반환', icon: '📋', color: 'cyan' },
                { step: '4', label: 'React 리렌더', detail: '변경된 virtualItems에 대해서만 DOM 업데이트', icon: '⚛️', color: 'green' },
                { step: '5', label: 'translateY 값만 변경', detail: '기존 DOM 노드의 transform만 업데이트 → Reflow 없음', icon: '🎯', color: 'amber' },
              ].map((s, i) => (
                <div key={s.step} className="flex items-start gap-2 mb-1.5">
                  <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-${s.color}-500 text-[9px] font-bold text-white`}>
                    {s.step}
                  </div>
                  <div className={`flex-1 rounded border border-${s.color}-200 bg-${s.color}-50 px-2.5 py-1.5`}>
                    <span className={`text-[10px] font-medium text-${s.color}-800`}>{s.icon} {s.label}</span>
                    <p className="text-[10px] text-gray-600">{s.detail}</p>
                  </div>
                </div>
              ))}
              <div className="ml-2.5 flex items-center gap-1 text-[10px] text-gray-400">
                <span>↩️ 1번으로 돌아감 (60fps 타겟)</span>
              </div>
            </div>

            {/* 성능 비교 */}
            <div className="w-44 space-y-2">
              <div className="rounded-lg border border-red-200 bg-red-50 p-2">
                <p className="text-[10px] font-bold text-red-700">❌ Naive 스크롤</p>
                <div className="mt-1 space-y-0.5 text-[10px] text-red-600">
                  <p>매 스크롤마다:</p>
                  <p>• 10,000개 DOM Reflow</p>
                  <p>• Layout 재계산 16ms+</p>
                  <p>• 프레임 드롭 발생</p>
                </div>
              </div>
              <div className="rounded-lg border border-green-200 bg-green-50 p-2">
                <p className="text-[10px] font-bold text-green-700">✅ 가상화 스크롤</p>
                <div className="mt-1 space-y-0.5 text-[10px] text-green-600">
                  <p>매 스크롤마다:</p>
                  <p>• ~15개 DOM만 업데이트</p>
                  <p>• transform만 변경 (GPU)</p>
                  <p>• 일관된 60fps</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2-E: Overscan — 빈 영역 방지 */}
      <div>
        <p className="mb-3 text-xs font-semibold text-gray-700">E. Overscan — 빈 영역 방지 전략</p>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="mb-3 text-[11px] leading-relaxed text-gray-600">
            스크롤이 빠르면 React 리렌더가 스크롤 속도를 따라잡지 못해 <strong>빈 영역(white flash)</strong>이 보일 수 있습니다.
            overscan은 뷰포트 위아래로 여유 아이템을 미리 렌더해두어 이를 방지합니다.
          </p>

          <div className="flex gap-4">
            {/* overscan 0 */}
            <div className="flex-1">
              <p className="mb-2 text-center text-xs font-medium text-red-500">overscan: 0</p>
              <div className="overflow-hidden rounded-lg border-2 border-red-300">
                <div className="bg-red-50 px-2 py-3 text-center text-[10px] text-red-400">
                  ⬆️ 빈 영역 (white flash!)
                </div>
                <div className="border-y-2 border-blue-400 bg-blue-50 p-1.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <div key={n} className="mb-0.5 rounded bg-white px-2 py-1 text-center text-[10px]">
                      아이템 {n}
                    </div>
                  ))}
                  <p className="text-center text-[9px] text-blue-500">viewport (5개)</p>
                </div>
                <div className="bg-red-50 px-2 py-3 text-center text-[10px] text-red-400">
                  ⬇️ 빈 영역 (white flash!)
                </div>
              </div>
              <p className="mt-1 text-center text-[10px] text-red-500">
                빠른 스크롤 시 깜빡임
              </p>
            </div>

            {/* overscan 5 */}
            <div className="flex-1">
              <p className="mb-2 text-center text-xs font-medium text-green-600">overscan: 5</p>
              <div className="overflow-hidden rounded-lg border-2 border-green-300">
                <div className="border-b border-dashed border-amber-300 bg-amber-50/50 p-1">
                  {[1, 2].map((n) => (
                    <div key={n} className="mb-0.5 rounded bg-amber-100/50 px-2 py-0.5 text-center text-[9px] text-amber-600">
                      overscan #{n}
                    </div>
                  ))}
                  <p className="text-center text-[9px] text-amber-500">+5개 미리 렌더</p>
                </div>
                <div className="border-y-2 border-blue-400 bg-blue-50 p-1.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <div key={n} className="mb-0.5 rounded bg-white px-2 py-1 text-center text-[10px]">
                      아이템 {n}
                    </div>
                  ))}
                  <p className="text-center text-[9px] text-blue-500">viewport (5개)</p>
                </div>
                <div className="border-t border-dashed border-amber-300 bg-amber-50/50 p-1">
                  {[1, 2].map((n) => (
                    <div key={n} className="mb-0.5 rounded bg-amber-100/50 px-2 py-0.5 text-center text-[9px] text-amber-600">
                      overscan #{n}
                    </div>
                  ))}
                  <p className="text-center text-[9px] text-amber-500">+5개 미리 렌더</p>
                </div>
              </div>
              <p className="mt-1 text-center text-[10px] text-green-600">
                부드러운 스크롤 경험
              </p>
            </div>
          </div>

          <div className="mt-3 rounded-lg border border-gray-200 bg-white p-3">
            <p className="text-[10px] font-bold text-gray-700">overscan 트레이드오프</p>
            <div className="mt-1 overflow-hidden rounded border border-gray-200">
              <table className="w-full text-[10px]">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-2 py-1 text-left font-medium">값</th>
                    <th className="px-2 py-1 text-left font-medium">DOM 노드</th>
                    <th className="px-2 py-1 text-left font-medium">스크롤 품질</th>
                    <th className="px-2 py-1 text-left font-medium">적합한 경우</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-gray-100">
                    <td className="px-2 py-1 font-mono">0</td>
                    <td className="px-2 py-1">5개</td>
                    <td className="px-2 py-1 text-red-600">깜빡임 가능</td>
                    <td className="px-2 py-1">무거운 아이템 (이미지 등)</td>
                  </tr>
                  <tr className="border-t border-gray-100 bg-green-50/30">
                    <td className="px-2 py-1 font-mono font-bold text-green-700">5</td>
                    <td className="px-2 py-1">15개</td>
                    <td className="px-2 py-1 text-green-600">부드러움</td>
                    <td className="px-2 py-1 text-green-700">일반적인 추천값</td>
                  </tr>
                  <tr className="border-t border-gray-100">
                    <td className="px-2 py-1 font-mono">20</td>
                    <td className="px-2 py-1">45개</td>
                    <td className="px-2 py-1 text-green-600">매우 부드러움</td>
                    <td className="px-2 py-1">가벼운 아이템, 빠른 스크롤 필수</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* 2-F: 렌더링 공식 요약 */}
      <div>
        <p className="mb-3 text-xs font-semibold text-gray-700">F. 렌더링 공식 요약</p>
        <div className="rounded-lg bg-gray-900 p-4 space-y-3">
          <div>
            <p className="text-[10px] font-medium text-gray-400">전체 높이 (스크롤바 크기 결정)</p>
            <p className="font-mono text-xs text-gray-300">
              <span className="text-purple-400">getTotalSize()</span> ={' '}
              <span className="text-blue-400">count</span> ×{' '}
              <span className="text-green-400">estimateSize</span> ={' '}
              <span className="text-yellow-400">10,000 × 88 = 880,000px</span>
            </p>
          </div>
          <div>
            <p className="text-[10px] font-medium text-gray-400">보이는 범위</p>
            <p className="font-mono text-xs text-gray-300">
              <span className="text-cyan-400">startIndex</span> ={' '}
              <span className="text-blue-400">Math.floor(scrollTop / itemHeight)</span>
            </p>
            <p className="font-mono text-xs text-gray-300">
              <span className="text-cyan-400">endIndex</span> ={' '}
              <span className="text-cyan-400">startIndex</span> +{' '}
              <span className="text-blue-400">Math.ceil(containerHeight / itemHeight)</span>
            </p>
          </div>
          <div>
            <p className="text-[10px] font-medium text-gray-400">실제 렌더 아이템 수</p>
            <p className="font-mono text-xs text-gray-300">
              <span className="text-yellow-400">렌더 수</span> ={' '}
              <span className="text-blue-400">(endIndex - startIndex)</span> +{' '}
              <span className="text-amber-400">overscan × 2</span>
            </p>
            <p className="mt-1 font-mono text-xs text-gray-500">
              예시: (305 - 300) + 5×2 = <span className="text-green-400">~15개</span>
              <span className="ml-2">(데이터가 10,000개여도 항상 동일)</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/** 3. useInfiniteQuery + useVirtualizer 결합 흐름 */
function InfiniteVirtualFlowDiagram() {
  const steps = [
    {
      icon: '📡',
      label: 'useInfiniteQuery',
      detail: 'pageParam으로 cursor 기반 페이지 요청. 응답을 pages 배열에 누적',
      color: 'blue' as const,
    },
    {
      icon: '📦',
      label: 'pages.flatMap(p => p.items)',
      detail: '모든 페이지의 items를 하나의 배열로 평탄화 → allItems',
      color: 'purple' as const,
    },
    {
      icon: '🪟',
      label: 'useVirtualizer({ count: allItems.length })',
      detail: 'allItems.length 만큼의 가상 행 생성. 실제 DOM은 보이는 것만',
      color: 'green' as const,
    },
    {
      icon: '👁️',
      label: 'virtualizer.getVirtualItems()',
      detail: '현재 뷰포트에 보이는 행만 반환. allItems[virtualRow.index]로 데이터 매핑',
      color: 'cyan' as const,
    },
    {
      icon: '⬇️',
      label: 'lastItem.index >= allItems.length - 1',
      detail: '마지막 가상 행이 보이면 → fetchNextPage() 호출 → 1번으로 돌아감',
      color: 'amber' as const,
    },
  ]

  const colors = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', dot: 'bg-blue-500', text: 'text-blue-700' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', dot: 'bg-purple-500', text: 'text-purple-700' },
    green: { bg: 'bg-green-50', border: 'border-green-200', dot: 'bg-green-500', text: 'text-green-700' },
    cyan: { bg: 'bg-cyan-50', border: 'border-cyan-200', dot: 'bg-cyan-500', text: 'text-cyan-700' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-500', text: 'text-amber-700' },
  }

  return (
    <div className="space-y-4">
      <div className="relative pl-4">
        <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gray-200" />
        <div className="space-y-2">
          {steps.map((step, i) => {
            const c = colors[step.color]
            return (
              <div key={step.label} className="relative flex items-start gap-3">
                <div
                  className={`relative z-10 mt-1.5 h-2.5 w-2.5 rounded-full ${c.dot} ring-2 ring-white`}
                />
                <div className={`flex-1 rounded-lg border ${c.border} ${c.bg} px-3 py-2`}>
                  <p className={`text-xs font-medium ${c.text}`}>
                    {step.icon} {i + 1}. {step.label}
                  </p>
                  <p className="text-[10px] text-gray-600">{step.detail}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 순환 화살표 */}
      <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-amber-300 bg-amber-50/50 px-3 py-2">
        <span className="text-sm">🔄</span>
        <span className="text-[10px] text-amber-700">
          5번에서 fetchNextPage → 1번으로 돌아가 새 페이지 추가 → 2~4 반복 (무한 루프)
        </span>
      </div>
    </div>
  )
}

/** 4. 스크롤 복원이 어려운 이유 */
function ScrollRestorationChallengeDiagram() {
  return (
    <div className="space-y-4">
      {/* 일반 리스트 vs 가상화 리스트 비교 */}
      <div className="flex gap-4">
        {/* 일반 리스트 */}
        <div className="flex-1">
          <p className="mb-2 text-center text-xs font-medium text-gray-500">일반 리스트</p>
          <div className="overflow-hidden rounded-lg border-2 border-gray-300">
            <div className="space-y-0.5 bg-gray-50 p-2">
              <div className="rounded bg-white px-2 py-1.5 text-center text-[10px]">아이템 1</div>
              <div className="rounded bg-white px-2 py-1.5 text-center text-[10px]">아이템 2</div>
              <div className="rounded bg-blue-100 px-2 py-1.5 text-center text-[10px] font-medium text-blue-700">
                아이템 3 ← scrollTop
              </div>
              <div className="rounded bg-white px-2 py-1.5 text-center text-[10px]">아이템 4</div>
              <div className="rounded bg-white px-2 py-1.5 text-center text-[10px]">아이템 5</div>
            </div>
            <div className="bg-green-50 px-2 py-1 text-center">
              <span className="text-[10px] text-green-700">DOM에 모두 존재 → scrollTop만 설정하면 OK</span>
            </div>
          </div>
        </div>

        {/* 가상화 리스트 */}
        <div className="flex-1">
          <p className="mb-2 text-center text-xs font-medium text-gray-500">가상화 리스트</p>
          <div className="overflow-hidden rounded-lg border-2 border-red-300">
            <div className="bg-gray-50 p-2">
              <div className="mb-0.5 rounded bg-gray-100 px-2 py-3 text-center text-[10px] text-gray-400">
                빈 공간 (getTotalSize 만큼)
              </div>
              <div className="rounded bg-red-100 px-2 py-1.5 text-center text-[10px] text-red-600">
                ❌ 아이템이 아직 없음
              </div>
            </div>
            <div className="bg-red-50 px-2 py-1 text-center">
              <span className="text-[10px] text-red-700">
                마운트 직후엔 높이 0 → scrollTop 설정 불가
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 타이밍 문제 설명 */}
      <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3">
        <p className="mb-2 text-xs font-semibold text-amber-800">왜 타이밍이 문제인가?</p>
        <div className="space-y-1.5 text-[11px] leading-relaxed text-amber-900">
          <p>
            <strong>1)</strong> 컴포넌트가 마운트되면 <code className="rounded bg-amber-100 px-1">useVirtualizer</code>가
            초기화되지만, <code className="rounded bg-amber-100 px-1">getTotalSize()</code>가 inner div에 반영되기까지 최소 1 렌더 사이클이 필요합니다.
          </p>
          <p>
            <strong>2)</strong> inner div의 높이가 0인 상태에서 <code className="rounded bg-amber-100 px-1">scrollTop = 5000</code>을
            설정하면, scrollHeight가 부족하므로 브라우저가 무시합니다.
          </p>
          <p>
            <strong>3)</strong> <code className="rounded bg-amber-100 px-1">requestAnimationFrame</code> 1회로는
            virtualizer의 레이아웃 계산이 끝나지 않을 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  )
}

/** 5. 해결 전략: sessionStorage + ResizeObserver */
function ScrollRestorationSolutionDiagram() {
  return (
    <div className="space-y-6">
      {/* 5-A: 저장 전략 — scroll 이벤트 */}
      <div>
        <p className="mb-3 text-xs font-semibold text-gray-700">A. 저장 전략 — scroll 이벤트로 실시간 저장</p>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="mb-3 text-[11px] leading-relaxed text-gray-600">
            스크롤할 때마다 <code className="rounded bg-gray-200 px-1">sessionStorage</code>에 현재 위치를 저장합니다.
            왜 언마운트 시점이 아닌 scroll 이벤트를 사용할까요?
          </p>

          <div className="flex gap-4">
            {/* 언마운트 저장의 문제 */}
            <div className="flex-1">
              <p className="mb-2 text-center text-xs font-medium text-red-500">❌ 언마운트 시 저장</p>
              <div className="overflow-hidden rounded-lg border-2 border-red-200">
                <div className="space-y-1 p-3">
                  <div className="rounded bg-red-50 px-2 py-1.5 text-[10px] text-red-600">
                    1. useEffect cleanup 실행
                  </div>
                  <div className="rounded bg-red-50 px-2 py-1.5 text-[10px] text-red-600">
                    2. 하지만 callback ref가 먼저 null로!
                  </div>
                  <div className="rounded bg-red-50 px-2 py-1.5 text-[10px] text-red-600">
                    3. scrollRef.current === null
                  </div>
                  <div className="rounded bg-red-50 px-2 py-1.5 text-[10px] text-red-600">
                    4. scrollTop을 읽을 수 없음
                  </div>
                </div>
              </div>
              <div className="mt-2 rounded-lg border border-gray-200 bg-white">
                <CodeBlock code={UNMOUNT_SAVE_CODE} />
              </div>
            </div>

            {/* scroll 이벤트 저장 */}
            <div className="flex-1">
              <p className="mb-2 text-center text-xs font-medium text-green-600">✅ scroll 이벤트로 저장</p>
              <div className="overflow-hidden rounded-lg border-2 border-green-300">
                <div className="space-y-1 p-3">
                  <div className="rounded bg-green-50 px-2 py-1.5 text-[10px] text-green-700">
                    1. 사용자가 스크롤할 때마다
                  </div>
                  <div className="rounded bg-green-50 px-2 py-1.5 text-[10px] text-green-700">
                    2. el.scrollTop을 즉시 읽어서
                  </div>
                  <div className="rounded bg-green-50 px-2 py-1.5 text-[10px] text-green-700">
                    3. sessionStorage에 저장
                  </div>
                  <div className="rounded bg-green-50 px-2 py-1.5 text-[10px] text-green-700">
                    4. 언마운트 타이밍과 무관하게 항상 최신
                  </div>
                </div>
              </div>
              <div className="mt-2 rounded-lg border border-gray-200 bg-white">
                <CodeBlock code={SCROLL_EVENT_SAVE_CODE} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5-B: ResizeObserver란? */}
      <div>
        <p className="mb-3 text-xs font-semibold text-gray-700">B. ResizeObserver란?</p>
        <div className="rounded-lg border border-cyan-200 bg-cyan-50/30 p-4">
          <p className="mb-3 text-[11px] leading-relaxed text-gray-700">
            <code className="rounded bg-cyan-100 px-1 font-bold">ResizeObserver</code>는 DOM 요소의
            <strong> 크기 변화를 감시</strong>하는 브라우저 내장 API입니다.
            요소의 width나 height가 바뀔 때마다 콜백을 호출합니다.
            <strong> polling(setInterval) 없이</strong>, 브라우저가 직접 알려주므로 효율적입니다.
          </p>

          {/* ResizeObserver 기본 동작 */}
          <div>
            <p className="mb-1 text-[10px] font-medium text-gray-500">ResizeObserver 기본 사용법</p>
            <div className="rounded-lg border border-gray-200 bg-white">
              <CodeBlock code={RESIZE_OBSERVER_BASIC_CODE} />
            </div>
          </div>

          {/* 다른 Observer와 비교 */}
          <div className="mt-3 overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full text-[10px]">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-3 py-1.5 text-left font-medium text-gray-600">API</th>
                  <th className="px-3 py-1.5 text-left font-medium text-gray-600">감시 대상</th>
                  <th className="px-3 py-1.5 text-left font-medium text-gray-600">콜백 시점</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-gray-100">
                  <td className="px-3 py-1.5 font-medium">IntersectionObserver</td>
                  <td className="px-3 py-1.5">요소가 뷰포트에 보이는지</td>
                  <td className="px-3 py-1.5">요소 노출/숨김 시</td>
                </tr>
                <tr className="border-t border-gray-100">
                  <td className="px-3 py-1.5 font-medium">MutationObserver</td>
                  <td className="px-3 py-1.5">DOM 트리 변경 (속성, 자식 등)</td>
                  <td className="px-3 py-1.5">DOM 변경 시</td>
                </tr>
                <tr className="border-t border-gray-100 bg-cyan-50/50">
                  <td className="px-3 py-1.5 font-bold text-cyan-700">ResizeObserver</td>
                  <td className="px-3 py-1.5 text-cyan-700">요소의 width / height</td>
                  <td className="px-3 py-1.5 text-cyan-700">크기가 바뀔 때</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 5-C: 여기서 ResizeObserver를 쓰는 이유 */}
      <div>
        <p className="mb-3 text-xs font-semibold text-gray-700">C. 왜 여기서 ResizeObserver가 필요한가?</p>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="mb-3 text-[11px] leading-relaxed text-gray-600">
            핵심 문제: 컴포넌트가 마운트된 직후, virtualizer의 <strong>inner div 높이가 아직 0</strong>일 수 있습니다.
            이 상태에서 <code className="rounded bg-gray-200 px-1">scrollTop = 5000</code>을 설정하면 브라우저가 무시합니다.
            inner div가 충분한 높이를 갖게 되는 <strong>"그 순간"</strong>을 포착해야 합니다.
          </p>

          {/* 타임라인 시각화 */}
          <div className="rounded-lg border border-gray-200 bg-white p-3">
            <p className="mb-2 text-[10px] font-bold text-gray-700">시간순 타임라인</p>
            <div className="relative">
              {/* 타임라인 바 */}
              <div className="absolute left-16 right-0 top-3 h-0.5 bg-gray-200" />

              <div className="space-y-4">
                {/* T0 */}
                <div className="flex items-start gap-2">
                  <span className="w-14 shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-center text-[10px] font-mono font-bold text-gray-600">T+0ms</span>
                  <div className="relative flex-1 rounded border border-blue-200 bg-blue-50 px-3 py-1.5">
                    <div className="absolute -left-1.5 top-2 h-2.5 w-2.5 rounded-full border-2 border-white bg-blue-500" />
                    <p className="text-[10px] font-medium text-blue-800">컴포넌트 마운트 + useEffect 실행</p>
                    <p className="text-[10px] text-blue-600">saved = sessionStorage.getItem("scroll:key") → "5000"</p>
                  </div>
                </div>

                {/* T1 */}
                <div className="flex items-start gap-2">
                  <span className="w-14 shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-center text-[10px] font-mono font-bold text-gray-600">T+0ms</span>
                  <div className="relative flex-1 rounded border border-red-200 bg-red-50 px-3 py-1.5">
                    <div className="absolute -left-1.5 top-2 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500" />
                    <p className="text-[10px] font-medium text-red-800">scrollHeight 확인 → 부족!</p>
                    <p className="text-[10px] text-red-600">
                      el.scrollHeight(0) {'<'} saved(5000) + clientHeight(400)
                      <span className="ml-2 rounded bg-red-100 px-1 font-bold">scrollTop 설정 불가</span>
                    </p>
                  </div>
                </div>

                {/* T2: ResizeObserver 등록 */}
                <div className="flex items-start gap-2">
                  <span className="w-14 shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-center text-[10px] font-mono font-bold text-gray-600">T+0ms</span>
                  <div className="relative flex-1 rounded border border-cyan-200 bg-cyan-50 px-3 py-1.5">
                    <div className="absolute -left-1.5 top-2 h-2.5 w-2.5 rounded-full border-2 border-white bg-cyan-500" />
                    <p className="text-[10px] font-medium text-cyan-800">ResizeObserver 등록</p>
                    <p className="text-[10px] text-cyan-600">inner div(Layer 2)의 크기 변화를 감시 시작</p>
                  </div>
                </div>

                {/* T3: virtualizer 계산 */}
                <div className="flex items-start gap-2">
                  <span className="w-14 shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-center text-[10px] font-mono font-bold text-gray-600">T+16ms</span>
                  <div className="relative flex-1 rounded border border-purple-200 bg-purple-50 px-3 py-1.5">
                    <div className="absolute -left-1.5 top-2 h-2.5 w-2.5 rounded-full border-2 border-white bg-purple-500" />
                    <p className="text-[10px] font-medium text-purple-800">다음 렌더: virtualizer가 getTotalSize() 계산</p>
                    <p className="text-[10px] text-purple-600">
                      inner div의 height가 0 → 880,000px로 변경됨
                    </p>
                  </div>
                </div>

                {/* T4: ResizeObserver 콜백 */}
                <div className="flex items-start gap-2">
                  <span className="w-14 shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-center text-[10px] font-mono font-bold text-gray-600">T+16ms</span>
                  <div className="relative flex-1 rounded border border-cyan-300 bg-cyan-100 px-3 py-1.5">
                    <div className="absolute -left-1.5 top-2 h-2.5 w-2.5 rounded-full border-2 border-white bg-cyan-600" />
                    <p className="text-[10px] font-medium text-cyan-900">ResizeObserver 콜백 발동!</p>
                    <p className="text-[10px] text-cyan-700">
                      "inner div 높이가 바뀌었어!" → scrollHeight(880,000) {'>='} 5000 + 400 ✓
                    </p>
                  </div>
                </div>

                {/* T5: 복원 */}
                <div className="flex items-start gap-2">
                  <span className="w-14 shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-center text-[10px] font-mono font-bold text-gray-600">T+16ms</span>
                  <div className="relative flex-1 rounded border border-green-300 bg-green-100 px-3 py-1.5">
                    <div className="absolute -left-1.5 top-2 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-600" />
                    <p className="text-[10px] font-medium text-green-900">스크롤 복원 성공!</p>
                    <p className="text-[10px] text-green-700">
                      el.scrollTop = 5000 → observer.disconnect()
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 대안 비교 */}
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50/50 p-3">
            <p className="mb-2 text-[10px] font-bold text-amber-800">왜 다른 방법이 아닌 ResizeObserver인가?</p>
            <div className="space-y-1.5">
              <div className="flex gap-2 text-[10px]">
                <span className="shrink-0 text-red-500">❌</span>
                <div>
                  <span className="font-medium text-gray-700">requestAnimationFrame 1회</span>
                  <span className="ml-1 text-gray-500">— 다음 프레임이 아닌 그 다음 프레임에 높이가 잡힐 수 있음. 타이밍 불확실.</span>
                </div>
              </div>
              <div className="flex gap-2 text-[10px]">
                <span className="shrink-0 text-red-500">❌</span>
                <div>
                  <span className="font-medium text-gray-700">setTimeout(fn, 100)</span>
                  <span className="ml-1 text-gray-500">— 100ms면 될 수도, 안 될 수도. 매직 넘버에 의존. 느린 기기에서 실패.</span>
                </div>
              </div>
              <div className="flex gap-2 text-[10px]">
                <span className="shrink-0 text-red-500">❌</span>
                <div>
                  <span className="font-medium text-gray-700">setInterval로 polling</span>
                  <span className="ml-1 text-gray-500">— 동작은 하지만 불필요한 반복 체크. 비효율적이고 정리(clear)도 번거로움.</span>
                </div>
              </div>
              <div className="flex gap-2 text-[10px]">
                <span className="shrink-0 text-green-500">✅</span>
                <div>
                  <span className="font-bold text-green-700">ResizeObserver</span>
                  <span className="ml-1 text-gray-500">— 높이가 바뀌는 <strong>정확한 순간</strong>에만 콜백. 1회 확인 후 즉시 disconnect. 가장 정확하고 효율적.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5-D: 실제 코드 흐름 */}
      <div>
        <p className="mb-3 text-xs font-semibold text-gray-700">D. 실제 코드 — 한 줄씩 이해하기</p>
        <div className="rounded-lg border border-gray-200 bg-white">
          <CodeBlock code={RESTORE_FULL_CODE} />
        </div>
      </div>

      {/* 5-E: scrollHeight 조건 시각화 */}
      <div>
        <p className="mb-3 text-xs font-semibold text-gray-700">E. scrollHeight {'>='} saved + clientHeight 조건 이해하기</p>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="mb-3 text-[11px] leading-relaxed text-gray-600">
            이 조건은 "스크롤 컨테이너가 <strong>saved 위치까지 스크롤할 수 있을 만큼 충분히 긴가?</strong>"를 확인합니다.
          </p>

          <div className="flex gap-6">
            {/* 부족한 경우 */}
            <div className="flex-1">
              <p className="mb-2 text-center text-xs font-medium text-red-500">높이 부족 — 복원 불가</p>
              <div className="relative overflow-hidden rounded-lg border-2 border-red-300">
                {/* scrollElement */}
                <div className="border-b border-red-200 bg-red-50 px-2 py-0.5 text-[9px] text-red-400">
                  scrollElement (clientHeight: 400px)
                </div>
                <div className="relative bg-white p-2">
                  {/* inner div - 작은 */}
                  <div className="rounded border border-dashed border-red-300 bg-red-50/50 px-2 py-4 text-center">
                    <p className="text-[10px] text-red-500">inner div</p>
                    <p className="font-mono text-[10px] font-bold text-red-600">scrollHeight: 200px</p>
                  </div>
                  {/* saved 위치 표시 */}
                  <div className="mt-2 flex items-center gap-1 rounded bg-red-100 px-2 py-1">
                    <span className="text-[10px] text-red-600">saved: 5000px</span>
                    <span className="text-[10px] text-red-400">← 여기까지 스크롤 불가!</span>
                  </div>
                </div>
                <div className="bg-red-50 px-2 py-1 text-center">
                  <span className="font-mono text-[10px] text-red-600">200 {'<'} 5000 + 400 ❌</span>
                </div>
              </div>
            </div>

            {/* 충분한 경우 */}
            <div className="flex-1">
              <p className="mb-2 text-center text-xs font-medium text-green-600">높이 충분 — 복원 가능</p>
              <div className="relative overflow-hidden rounded-lg border-2 border-green-300">
                <div className="border-b border-green-200 bg-green-50 px-2 py-0.5 text-[9px] text-green-500">
                  scrollElement (clientHeight: 400px)
                </div>
                <div className="relative bg-white p-2">
                  {/* inner div - 큰 */}
                  <div className="rounded border border-dashed border-green-300 bg-green-50/50 px-2 py-2 text-center">
                    <p className="text-[10px] text-green-600">inner div</p>
                    <p className="font-mono text-[10px] font-bold text-green-700">scrollHeight: 880,000px</p>
                    <div className="mt-1 h-8 rounded bg-green-100/50">
                      <div className="flex h-full items-center justify-center">
                        <span className="text-[9px] text-green-500">...엄청 긴 콘텐츠...</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-1 rounded bg-green-100 px-2 py-1">
                    <span className="text-[10px] text-green-700">saved: 5000px</span>
                    <span className="text-[10px] text-green-500">← 여유롭게 도달 가능!</span>
                  </div>
                </div>
                <div className="bg-green-50 px-2 py-1 text-center">
                  <span className="font-mono text-[10px] text-green-700">880,000 {'>='} 5000 + 400 ✅</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 rounded-lg bg-gray-900 p-3">
            <p className="mb-1 text-[10px] font-medium text-gray-400">조건 수식</p>
            <p className="font-mono text-xs text-gray-300">
              <span className="text-purple-400">el.scrollHeight</span>
              {' >= '}
              <span className="text-yellow-400">saved</span>
              {' + '}
              <span className="text-blue-400">el.clientHeight</span>
            </p>
            <p className="mt-1 text-[10px] text-gray-500">
              scrollHeight = 전체 콘텐츠 높이 / saved = 복원할 scrollTop / clientHeight = 보이는 영역 높이
            </p>
            <p className="mt-1 text-[10px] text-gray-500">
              즉, "전체 높이가 (복원 위치 + 뷰포트) 이상이면 그 위치까지 스크롤할 수 있다"
            </p>
          </div>
        </div>
      </div>

      {/* 5-F: sessionStorage 비교 */}
      <div>
        <p className="mb-3 text-xs font-semibold text-gray-700">F. 왜 sessionStorage인가?</p>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-3 py-1.5 text-left font-medium text-gray-600">저장소</th>
                  <th className="px-3 py-1.5 text-left font-medium text-gray-600">새로고침 후</th>
                  <th className="px-3 py-1.5 text-left font-medium text-gray-600">탭 닫기 후</th>
                  <th className="px-3 py-1.5 text-left font-medium text-gray-600">적합한 경우</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-gray-100">
                  <td className="px-3 py-1.5 font-medium">Map (메모리)</td>
                  <td className="px-3 py-1.5 text-red-600">소실</td>
                  <td className="px-3 py-1.5 text-red-600">소실</td>
                  <td className="px-3 py-1.5">SPA 내 뷰 전환만</td>
                </tr>
                <tr className="border-t border-gray-100 bg-green-50/50">
                  <td className="px-3 py-1.5 font-bold text-green-700">sessionStorage</td>
                  <td className="px-3 py-1.5 text-green-600">유지</td>
                  <td className="px-3 py-1.5 text-red-600">소실</td>
                  <td className="px-3 py-1.5 text-green-700">새로고침 포함 복원</td>
                </tr>
                <tr className="border-t border-gray-100">
                  <td className="px-3 py-1.5 font-medium">localStorage</td>
                  <td className="px-3 py-1.5 text-green-600">유지</td>
                  <td className="px-3 py-1.5 text-green-600">유지</td>
                  <td className="px-3 py-1.5">영구 저장 (보통 불필요)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

/** 6. TanStack Query 캐시와 가상화의 시너지 */
function CacheSynergyDiagram() {
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        {/* 캐시 없는 경우 */}
        <div className="flex-1">
          <p className="mb-2 text-center text-xs font-medium text-red-500">캐시 없이 (매번 fetch)</p>
          <div className="overflow-hidden rounded-lg border-2 border-red-200">
            <div className="space-y-1 p-3">
              <div className="rounded bg-red-50 px-2 py-1.5 text-center text-[10px] text-red-600">
                1. 마운트 → data = undefined
              </div>
              <div className="text-center text-gray-300">↓</div>
              <div className="rounded bg-red-50 px-2 py-1.5 text-center text-[10px] text-red-600">
                2. fetch 시작 → 로딩 스피너
              </div>
              <div className="text-center text-gray-300">↓</div>
              <div className="rounded bg-red-50 px-2 py-1.5 text-center text-[10px] text-red-600">
                3. 300ms 후 첫 페이지만 도착
              </div>
              <div className="text-center text-gray-300">↓</div>
              <div className="rounded bg-red-50 px-2 py-1.5 text-center text-[10px] text-red-600">
                4. 이전 스크롤 위치의 데이터 없음
              </div>
            </div>
            <div className="bg-red-50 px-2 py-1.5 text-center">
              <span className="text-[10px] font-medium text-red-700">❌ 스크롤 복원 불가능</span>
            </div>
          </div>
        </div>

        {/* 캐시 있는 경우 */}
        <div className="flex-1">
          <p className="mb-2 text-center text-xs font-medium text-green-600">TanStack Query 캐시</p>
          <div className="overflow-hidden rounded-lg border-2 border-green-300">
            <div className="space-y-1 p-3">
              <div className="rounded bg-green-50 px-2 py-1.5 text-center text-[10px] text-green-700">
                1. 마운트 → 캐시 HIT!
              </div>
              <div className="text-center text-gray-300">↓</div>
              <div className="rounded bg-green-50 px-2 py-1.5 text-center text-[10px] text-green-700">
                2. data = 이전 모든 pages 즉시 반환
              </div>
              <div className="text-center text-gray-300">↓</div>
              <div className="rounded bg-green-50 px-2 py-1.5 text-center text-[10px] text-green-700">
                3. virtualizer → getTotalSize() 즉시 계산
              </div>
              <div className="text-center text-gray-300">↓</div>
              <div className="rounded bg-green-50 px-2 py-1.5 text-center text-[10px] text-green-700">
                4. ResizeObserver → scrollTop 복원
              </div>
            </div>
            <div className="bg-green-50 px-2 py-1.5 text-center">
              <span className="text-[10px] font-medium text-green-700">✅ 네트워크 0ms, 즉시 복원</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-gray-900 p-3">
        <p className="mb-1 text-[10px] font-medium text-gray-400">핵심 조건</p>
        <p className="font-mono text-xs text-gray-300">
          <span className="text-yellow-400">staleTime</span>
          {' > '}
          <span className="text-blue-400">사용자가 상세에서 머무는 시간</span>
        </p>
        <p className="mt-1 text-[10px] text-gray-500">
          staleTime: 60_000 (1분) → 1분 내에 돌아오면 캐시 HIT → fetch 없이 즉시 렌더
        </p>
      </div>
    </div>
  )
}

// --- Code string constants for CodeBlock ---

const HTML_STRUCTURE_CODE = `// 실제 HTML 구조
<div style="overflow:auto; height:400px">        // Layer 1: Scroll Container
  <div style="height:880000px; position:relative"> // Layer 2: Spacer (가짜 높이)
    <div style="position:absolute;                 // Layer 3: Virtual Items
                transform:translateY(26400px);
                height:88px">
      상품 #301
    </div>
    <div style="position:absolute;
                transform:translateY(26488px);
                height:88px">
      상품 #302
    </div>
    // ... (보이는 ~15개만 존재)
  </div>
</div>`

const UNMOUNT_SAVE_CODE = `// ❌ React 실행 순서:
// 1. ref callback(null)  ← ref가 먼저 해제
// 2. useEffect cleanup   ← 이때 ref는 이미 null

useEffect(() => {
  return () => {
    // scrollRef.current는 이미 null!
    scrollPositions.set(key, ???)
  }
}, [])`

const SCROLL_EVENT_SAVE_CODE = `// ✅ scroll 이벤트로 저장
useEffect(() => {
  const el = scrollRef.current
  const onScroll = () => {
    // 스크롤할 때마다 즉시 저장
    sessionStorage.setItem(
      'scroll:key', String(el.scrollTop)
    )
  }
  el.addEventListener('scroll', onScroll)
  return () => el.removeEventListener('scroll', onScroll)
}, [])`

const RESIZE_OBSERVER_BASIC_CODE = `// 1. observer 생성 — 크기가 바뀔 때마다 실행될 콜백
const observer = new ResizeObserver((entries) => {
  for (const entry of entries) {
    console.log('새로운 크기:', entry.contentRect.height)
  }
})

// 2. 감시 대상 등록
observer.observe(someElement)

// 3. 감시 중단
observer.disconnect()`

const RESTORE_FULL_CODE = `useEffect(() => {
  // 1. sessionStorage에서 저장된 위치 읽기
  const saved = loadScroll(key)        // "5000"
  if (saved == null) return            // 저장된 게 없으면 복원할 것도 없음

  const el = scrollRef.current
  if (!el) return

  // 2. 즉시 복원 시도 — scrollHeight가 이미 충분한가?
  if (el.scrollHeight >= saved + el.clientHeight) {
    el.scrollTop = saved               // 🎉 즉시 복원 성공!
    return
  }

  // 3. 아직 높이가 부족 → ResizeObserver로 "기다리기"
  const observer = new ResizeObserver(() => {
    // inner div 높이가 변할 때마다 이 콜백이 실행됨
    if (el.scrollHeight >= saved + el.clientHeight) {
      el.scrollTop = saved             // 🎉 높이가 확보되면 복원!
      observer.disconnect()            // 더 이상 감시할 필요 없음
    }
  })

  // 4. inner div (scrollElement의 첫 번째 자식)를 감시
  const child = el.firstElementChild   // = virtualizer의 spacer div
  if (child) observer.observe(child)

  // 5. 안전장치 — 2초 내 복원 안 되면 포기
  const timeout = setTimeout(() => observer.disconnect(), 2000)

  return () => {                       // cleanup
    observer.disconnect()
    clearTimeout(timeout)
  }
}, [key, scrollRef])`

export function ConceptDiagrams() {
  return (
    <div className="space-y-4">
      <ConceptCard
        number={1}
        title="DOM 폭발 문제 — 왜 가상화가 필요한가"
        description="Infinite Scroll은 스크롤할수록 pages.flatMap()으로 아이템을 누적합니다. 모든 아이템이 실제 DOM 노드로 존재하면 브라우저의 레이아웃 계산(Reflow)과 페인트(Repaint) 비용이 선형으로 증가합니다. 2,000개 이상이면 눈에 띄는 프레임 드롭이 발생합니다."
      >
        <DomExplosionDiagram />
      </ConceptCard>

      <ConceptCard
        number={2}
        title="Virtualization 원리 — Window 기법 상세"
        description="'Window(창문)'를 통해 보이는 부분만 렌더링하는 기법입니다. DOM 3층 구조(Scroll Container → Spacer → Virtual Items), translateY를 이용한 GPU 가속 배치, 스크롤 시 재계산 사이클, overscan 전략까지 Window 기법의 모든 것을 다룹니다."
      >
        <VirtualizationPrincipleDiagram />
      </ConceptCard>

      <ConceptCard
        number={3}
        title="useInfiniteQuery + useVirtualizer 결합 흐름"
        description="TanStack Query의 useInfiniteQuery로 서버 데이터를 페이지 단위로 누적하고, TanStack Virtual의 useVirtualizer로 화면에 보이는 것만 렌더합니다. 마지막 가상 행이 뷰포트에 들어오면 자동으로 다음 페이지를 요청하는 무한 루프를 형성합니다."
      >
        <InfiniteVirtualFlowDiagram />
      </ConceptCard>

      <ConceptCard
        number={4}
        title="스크롤 복원이 어려운 이유 — 타이밍 문제"
        description="일반 리스트는 모든 DOM이 존재하므로 scrollTop만 설정하면 됩니다. 하지만 가상화 리스트는 마운트 직후 inner div의 높이가 아직 0일 수 있습니다. scrollHeight보다 큰 scrollTop은 브라우저가 무시하므로, 높이가 확보된 후에 설정해야 합니다."
      >
        <ScrollRestorationChallengeDiagram />
      </ConceptCard>

      <ConceptCard
        number={5}
        title="해결: sessionStorage + ResizeObserver"
        description="scroll 이벤트로 scrollTop을 실시간 sessionStorage에 저장합니다(언마운트 타이밍 의존 X). 복원 시에는 scrollHeight가 충분한지 확인하고, 부족하면 ResizeObserver로 inner div의 크기 변화를 감시하여 높이가 확보되는 즉시 scrollTop을 설정합니다. ResizeObserver가 무엇인지, 왜 rAF/setTimeout 대신 이것을 쓰는지, scrollHeight 조건의 의미까지 상세히 다룹니다."
      >
        <ScrollRestorationSolutionDiagram />
      </ConceptCard>

      <ConceptCard
        number={6}
        title="TanStack Query 캐시 — 스크롤 복원의 전제 조건"
        description="스크롤 복원이 동작하려면 '돌아왔을 때 데이터가 즉시 있어야' 합니다. useInfiniteQuery의 캐시(staleTime)가 이를 보장합니다. 캐시 HIT 시 네트워크 요청 없이 이전에 로드한 모든 pages를 즉시 반환하므로, virtualizer가 바로 전체 높이를 계산할 수 있습니다."
      >
        <CacheSynergyDiagram />
      </ConceptCard>
    </div>
  )
}
