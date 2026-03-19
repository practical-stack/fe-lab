import type { ReactNode } from 'react'

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

/** 0. 전체 구조 — 수평 캐러셀 레이아웃 */
function StructureDiagram() {
  return (
    <div className="space-y-4">
      {/* 전체 레이아웃 */}
      <div className="rounded-xl border-2 border-dashed border-gray-300 p-3">
        <p className="mb-2 text-[10px] font-medium text-gray-400">
          Swipeable Tabs Container
        </p>

        {/* Tab List */}
        <div className="mb-2 overflow-hidden rounded-lg border border-gray-200">
          <div className="flex border-b border-gray-200 bg-gray-50">
            <div className="flex-1 border-b-2 border-blue-600 bg-white px-3 py-2 text-center text-xs font-medium text-blue-600">
              홈
            </div>
            <div className="flex-1 px-3 py-2 text-center text-xs text-gray-400">
              파일
            </div>
            <div className="flex-1 px-3 py-2 text-center text-xs text-gray-400">
              검색
            </div>
            <div className="flex-1 px-3 py-2 text-center text-xs text-gray-400">
              설정
            </div>
          </div>

          {/* Carousel 영역 */}
          <div className="relative bg-white p-3">
            <div className="flex items-center gap-2">
              <div className="flex-none rounded border-2 border-blue-400 bg-blue-50 px-4 py-6 text-xs font-medium text-blue-700">
                Panel 1
              </div>
              <div className="flex-none rounded border border-gray-200 bg-gray-50 px-4 py-6 text-xs text-gray-400">
                Panel 2
              </div>
              <div className="flex-none rounded border border-gray-200 bg-gray-50 px-4 py-6 text-xs text-gray-400">
                Panel 3
              </div>
              <div className="flex-none rounded border border-gray-200 bg-gray-50 px-4 py-6 text-xs text-gray-400">
                Panel 4
              </div>
            </div>
            <div className="mt-2 flex items-center justify-center gap-1">
              <span className="text-[10px] text-gray-400">← 스와이프 →</span>
            </div>
          </div>
        </div>
      </div>

      {/* 핵심 구조 설명 */}
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-1.5 rounded bg-gray-100 px-2 py-1.5">
          <div className="h-2 w-2 rounded-full bg-blue-500" />
          <span className="text-[10px] text-gray-600">
            <strong>TabList</strong> — role=&quot;tablist&quot;, 탭 버튼들
          </span>
        </div>
        <div className="flex items-center gap-1.5 rounded bg-gray-100 px-2 py-1.5">
          <div className="h-2 w-2 rounded-full bg-purple-500" />
          <span className="text-[10px] text-gray-600">
            <strong>Carousel</strong> — overflow-x: auto, snap
          </span>
        </div>
        <div className="flex items-center gap-1.5 rounded bg-gray-100 px-2 py-1.5">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-[10px] text-gray-600">
            <strong>Indicator</strong> — absolute, transition으로 이동
          </span>
        </div>
        <div className="flex items-center gap-1.5 rounded bg-gray-100 px-2 py-1.5">
          <div className="h-2 w-2 rounded-full bg-orange-500" />
          <span className="text-[10px] text-gray-600">
            <strong>Panel</strong> — flex-none, width: 100%
          </span>
        </div>
      </div>
    </div>
  )
}

/** 1. CSS scroll-snap 동작 원리 */
function ScrollSnapDiagram() {
  return (
    <div className="space-y-4">
      {/* snap-x mandatory 시각화 */}
      <div className="flex gap-6">
        {/* snap 없이 */}
        <div className="flex-1">
          <p className="mb-2 text-center text-xs font-medium text-red-500">snap 없이</p>
          <div className="overflow-hidden rounded-lg border-2 border-red-200">
            <div className="relative bg-gray-50 p-3">
              <div className="flex gap-1">
                <div className="flex-none w-16 rounded bg-blue-100 px-2 py-4 text-center text-[10px] text-blue-600">
                  P1
                </div>
                <div className="flex-none w-16 rounded border border-dashed border-red-300 bg-red-50 px-2 py-4 text-center text-[10px] text-red-500">
                  P2
                  <br />
                  <span className="text-[8px]">반쯤 보임</span>
                </div>
                <div className="flex-none w-8 rounded bg-gray-200 px-1 py-4 text-center text-[10px] text-gray-400">
                  P3
                </div>
              </div>
            </div>
            <div className="bg-red-50 px-2 py-1 text-center text-[10px] text-red-600">
              중간에 멈춤 — 어색한 상태
            </div>
          </div>
        </div>

        {/* snap 있을 때 */}
        <div className="flex-1">
          <p className="mb-2 text-center text-xs font-medium text-green-600">snap-x mandatory</p>
          <div className="overflow-hidden rounded-lg border-2 border-green-300">
            <div className="relative bg-gray-50 p-3">
              <div className="flex">
                <div className="flex-none w-full rounded border-2 border-green-400 bg-green-50 px-2 py-4 text-center text-[10px] font-medium text-green-700">
                  Panel 2 <span className="text-[8px]">정확히 정렬</span>
                </div>
              </div>
            </div>
            <div className="bg-green-50 px-2 py-1 text-center text-[10px] text-green-600">
              가장 가까운 snap point로 자동 정렬
            </div>
          </div>
        </div>
      </div>

      {/* CSS 속성 설명 */}
      <div className="rounded-lg bg-gray-900 p-3 space-y-1">
        <p className="font-mono text-xs text-gray-300">
          <span className="text-gray-500">/* 부모: 캐러셀 컨테이너 */</span>
        </p>
        <p className="font-mono text-xs text-gray-300">
          <span className="text-purple-400">.carousel</span>
          {' { '}
        </p>
        <p className="font-mono text-xs text-gray-300 pl-4">
          <span className="text-blue-400">display</span>: <span className="text-yellow-300">flex</span>;
          <span className="ml-3 text-gray-600">/* 패널들 가로 배치 */</span>
        </p>
        <p className="font-mono text-xs text-gray-300 pl-4">
          <span className="text-blue-400">overflow-x</span>: <span className="text-yellow-300">auto</span>;
          <span className="ml-3 text-gray-600">/* 가로 스크롤 활성화 */</span>
        </p>
        <p className="font-mono text-xs text-gray-300 pl-4">
          <span className="text-blue-400">scroll-snap-type</span>: <span className="text-yellow-300">x mandatory</span>;
          <span className="ml-3 text-gray-600">/* 반드시 snap point에 정렬 */</span>
        </p>
        <p className="font-mono text-xs text-gray-300">{'}'}</p>
        <p className="mt-2 font-mono text-xs text-gray-300">
          <span className="text-gray-500">/* 자식: 각 패널 */</span>
        </p>
        <p className="font-mono text-xs text-gray-300">
          <span className="text-purple-400">.panel</span>
          {' { '}
        </p>
        <p className="font-mono text-xs text-gray-300 pl-4">
          <span className="text-blue-400">flex</span>: <span className="text-yellow-300">none</span>;
          <span className="ml-3 text-gray-600">/* 축소 방지 */</span>
        </p>
        <p className="font-mono text-xs text-gray-300 pl-4">
          <span className="text-blue-400">width</span>: <span className="text-yellow-300">100%</span>;
          <span className="ml-3 text-gray-600">/* 부모 너비만큼 */</span>
        </p>
        <p className="font-mono text-xs text-gray-300 pl-4">
          <span className="text-blue-400">scroll-snap-align</span>: <span className="text-yellow-300">start</span>;
          <span className="ml-3 text-gray-600">/* 왼쪽 가장자리에 정렬 */</span>
        </p>
        <p className="font-mono text-xs text-gray-300">{'}'}</p>
      </div>

      {/* mandatory vs proximity */}
      <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3">
        <p className="mb-1 text-xs font-semibold text-amber-800">mandatory vs proximity</p>
        <p className="text-[11px] leading-relaxed text-amber-700">
          <strong>mandatory</strong>: 스크롤이 끝나면 반드시 가장 가까운 snap point에 정렬된다. 탭 UI에서는 반드시 하나의 패널이
          온전히 보여야 하므로 mandatory를 사용한다.{' '}
          <strong>proximity</strong>는 snap point에 충분히 가까울 때만 정렬하므로, 중간에 멈출 수 있어 탭 UI에는 부적합하다.
        </p>
      </div>
    </div>
  )
}

/** 2. scrollIntoView — 탭 클릭 → 패널 전환 */
function ScrollIntoViewDiagram() {
  return (
    <div className="space-y-4">
      {/* scrollIntoView 동작 시각화 */}
      <div className="flex gap-6">
        {/* Before */}
        <div className="flex-1">
          <p className="mb-2 text-center text-xs font-medium text-gray-500">현재: Panel 1</p>
          <div className="overflow-hidden rounded-lg border-2 border-gray-300">
            <div className="flex border-b border-gray-200 bg-gray-50">
              <div className="flex-1 border-b-2 border-blue-600 py-1.5 text-center text-[10px] font-medium text-blue-600">홈</div>
              <div className="flex-1 py-1.5 text-center text-[10px] text-gray-400">파일</div>
              <div className="flex-1 py-1.5 text-center text-[10px] text-gray-400">검색</div>
            </div>
            <div className="relative overflow-hidden bg-white">
              <div className="flex">
                <div className="flex-none w-full bg-blue-50 px-3 py-6 text-center text-xs text-blue-600">
                  Panel 1
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Arrow + 클릭 */}
        <div className="flex flex-col items-center justify-center gap-1">
          <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
            &quot;검색&quot; 클릭
          </span>
          <span className="text-lg text-gray-300">→</span>
        </div>

        {/* After */}
        <div className="flex-1">
          <p className="mb-2 text-center text-xs font-medium text-gray-500">전환: Panel 3</p>
          <div className="overflow-hidden rounded-lg border-2 border-blue-400">
            <div className="flex border-b border-gray-200 bg-gray-50">
              <div className="flex-1 py-1.5 text-center text-[10px] text-gray-400">홈</div>
              <div className="flex-1 py-1.5 text-center text-[10px] text-gray-400">파일</div>
              <div className="flex-1 border-b-2 border-blue-600 py-1.5 text-center text-[10px] font-medium text-blue-600">검색</div>
            </div>
            <div className="relative overflow-hidden bg-white">
              <div className="flex">
                <div className="flex-none w-full bg-blue-50 px-3 py-6 text-center text-xs text-blue-600">
                  Panel 3
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 코드 비교: scrollTo vs scrollIntoView */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <p className="mb-1 text-[10px] font-semibold text-gray-500">scrollTo 방식</p>
          <div className="rounded bg-gray-900 p-2">
            <p className="font-mono text-[10px] text-gray-300">
              <span className="text-gray-500">// 패널 너비 계산 필요</span>
            </p>
            <p className="font-mono text-[10px] text-gray-300">
              carousel.<span className="text-yellow-300">scrollTo</span>({'{'}
            </p>
            <p className="font-mono text-[10px] text-gray-300 pl-2">
              left: index * <span className="text-blue-400">panelWidth</span>,
            </p>
            <p className="font-mono text-[10px] text-gray-300 pl-2">
              behavior: <span className="text-green-300">&apos;smooth&apos;</span>
            </p>
            <p className="font-mono text-[10px] text-gray-300">{'}'});</p>
          </div>
        </div>
        <div className="rounded-lg border border-green-200 bg-green-50/50 p-3">
          <p className="mb-1 text-[10px] font-semibold text-green-600">scrollIntoView 방식 ✓</p>
          <div className="rounded bg-gray-900 p-2">
            <p className="font-mono text-[10px] text-gray-300">
              <span className="text-gray-500">// 패널 요소에 직접 요청</span>
            </p>
            <p className="font-mono text-[10px] text-gray-300">
              panel.<span className="text-yellow-300">scrollIntoView</span>({'{'}
            </p>
            <p className="font-mono text-[10px] text-gray-300 pl-2">
              behavior: <span className="text-green-300">&apos;smooth&apos;</span>,
            </p>
            <p className="font-mono text-[10px] text-gray-300 pl-2">
              inline: <span className="text-green-300">&apos;start&apos;</span>
            </p>
            <p className="font-mono text-[10px] text-gray-300">{'}'});</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-3">
        <p className="mb-1 text-xs font-semibold text-blue-800">scrollIntoView가 더 나은 이유</p>
        <p className="text-[11px] leading-relaxed text-blue-700">
          <strong>scrollTo</strong>는 패널 너비를 직접 계산해야 하고 리사이즈 시 다시 계산이 필요하다.{' '}
          <strong>scrollIntoView</strong>는 브라우저가 타겟 요소의 위치를 자동으로 계산하므로, 패널 너비가 변해도
          정확하게 동작한다. <code className="rounded bg-blue-100 px-1 text-[10px]">inline: &apos;start&apos;</code>는
          패널의 왼쪽 가장자리를 캐러셀의 왼쪽 가장자리에 맞춘다.
        </p>
      </div>
    </div>
  )
}

/** 3. 스크롤 위치 → 탭 동기화 */
function ScrollSyncDiagram() {
  const examples = [
    { scrollLeft: 0, panelWidth: 400, result: 0, label: '홈' },
    { scrollLeft: 150, panelWidth: 400, result: 0, label: '홈' },
    { scrollLeft: 250, panelWidth: 400, result: 1, label: '파일' },
    { scrollLeft: 400, panelWidth: 400, result: 1, label: '파일' },
    { scrollLeft: 800, panelWidth: 400, result: 2, label: '검색' },
  ]

  return (
    <div className="space-y-4">
      {/* Math.round 시각화 */}
      <div className="rounded-lg bg-gray-50 p-3">
        <p className="mb-2 text-xs font-medium text-gray-500">
          핵심 공식: <code className="rounded bg-gray-200 px-1">Math.round(scrollLeft / panelWidth)</code>
        </p>
        <div className="space-y-1.5">
          {examples.map((ex) => (
            <div key={ex.scrollLeft} className="flex items-center gap-2 text-xs">
              <div className="w-28 text-right font-mono text-[10px] text-gray-500">
                round({ex.scrollLeft} / {ex.panelWidth})
              </div>
              <span className="text-gray-400">=</span>
              <span className="w-6 text-center font-mono font-bold text-blue-600">{ex.result}</span>
              <span className="text-gray-400">→</span>
              <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                {ex.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 왜 Math.round인가? */}
      <div className="flex gap-4">
        {/* scroll 50% 미만 */}
        <div className="flex-1">
          <p className="mb-2 text-center text-xs font-medium text-gray-500">37.5% 스와이프</p>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <div className="relative bg-gray-50 p-2">
              <div className="flex">
                <div className="flex-none w-[62.5%] rounded-l border-2 border-blue-400 bg-blue-50 py-4 text-center text-[10px] font-medium text-blue-600">
                  Panel 1
                </div>
                <div className="flex-none w-[37.5%] rounded-r border border-gray-200 bg-gray-100 py-4 text-center text-[10px] text-gray-400">
                  Panel 2
                </div>
              </div>
            </div>
            <div className="bg-blue-50 px-2 py-1 text-center">
              <span className="text-[10px] text-blue-600">round(0.375) = <strong>0</strong> → Panel 1 유지</span>
            </div>
          </div>
        </div>

        {/* scroll 50% 이상 */}
        <div className="flex-1">
          <p className="mb-2 text-center text-xs font-medium text-gray-500">62.5% 스와이프</p>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <div className="relative bg-gray-50 p-2">
              <div className="flex">
                <div className="flex-none w-[37.5%] rounded-l border border-gray-200 bg-gray-100 py-4 text-center text-[10px] text-gray-400">
                  Panel 1
                </div>
                <div className="flex-none w-[62.5%] rounded-r border-2 border-green-400 bg-green-50 py-4 text-center text-[10px] font-medium text-green-600">
                  Panel 2
                </div>
              </div>
            </div>
            <div className="bg-green-50 px-2 py-1 text-center">
              <span className="text-[10px] text-green-600">round(0.625) = <strong>1</strong> → Panel 2 전환</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3">
        <p className="mb-1 text-xs font-semibold text-amber-800">Math.round vs Math.floor</p>
        <p className="text-[11px] leading-relaxed text-amber-700">
          <strong>Math.floor</strong>는 50% 이상 넘겨야 다음 탭으로 전환되어 반응이 느리다.{' '}
          <strong>Math.round</strong>는 50% 기준으로 전환하여 CSS scroll-snap의 동작과 일치하고,
          사용자의 스와이프 의도를 더 정확하게 반영한다.
        </p>
      </div>
    </div>
  )
}

/** 4. Scroll Debounce — 스와이프 중 불필요한 갱신 방지 */
function ScrollDebounceDiagram() {
  return (
    <div className="space-y-4">
      {/* 문제: debounce 없이 */}
      <div className="rounded-lg border border-red-200 bg-red-50/30 p-3">
        <p className="mb-2 text-xs font-semibold text-red-700">문제: debounce 없이 매 scroll마다 처리</p>
        <div className="flex items-center gap-1 overflow-x-auto text-[10px]">
          {Array.from({ length: 8 }, (_, i) => (
            <span key={i} className="flex-none">
              <span className="rounded border border-red-300 bg-red-100 px-1 py-0.5 text-red-600">
                set#{i + 1}
              </span>
              {i < 7 && <span className="mx-0.5 text-gray-300">→</span>}
            </span>
          ))}
        </div>
        <p className="mt-1 text-[10px] text-red-600">
          scroll 이벤트마다 setSelectedTab 호출 → 초당 수십 회 리렌더링 + 인디케이터 떨림
        </p>
      </div>

      {/* 해결: debounce 적용 */}
      <div className="rounded-lg border border-green-200 bg-green-50/30 p-3">
        <p className="mb-2 text-xs font-semibold text-green-700">해결: clearTimeout + setTimeout (50ms)</p>
        <div className="flex items-center gap-1 overflow-x-auto text-[10px]">
          {['scroll', 'scroll', 'scroll', 'scroll', 'scroll'].map((label, i) => (
            <span key={i} className="flex-none">
              <span className="rounded bg-gray-200 px-1 py-0.5 text-gray-500">
                {label}
              </span>
              {i < 4 && <span className="mx-0.5 text-gray-300">→</span>}
            </span>
          ))}
          <span className="mx-1 text-gray-400">...</span>
          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-amber-700">50ms 대기</span>
          <span className="mx-0.5 text-gray-300">→</span>
          <span className="rounded border-2 border-green-400 bg-green-100 px-1.5 py-0.5 font-medium text-green-700">
            set 1회!
          </span>
        </div>
        <p className="mt-1 text-[10px] text-green-600">
          마지막 scroll 후 50ms 동안 추가 이벤트 없을 때만 실행 → 리렌더 1회
        </p>
      </div>

      {/* 타임라인 시각화 */}
      <div className="rounded-lg bg-gray-50 p-3">
        <p className="mb-2 text-[10px] font-medium text-gray-500">clearTimeout + setTimeout 동작 원리</p>
        <div className="space-y-1.5">
          {[
            { time: '0ms', event: 'scroll', action: '타이머 시작 (50ms)', timer: 'start', color: 'gray' as const },
            { time: '16ms', event: 'scroll', action: '이전 타이머 취소 → 새 타이머 시작', timer: 'reset', color: 'gray' as const },
            { time: '32ms', event: 'scroll', action: '이전 타이머 취소 → 새 타이머 시작', timer: 'reset', color: 'gray' as const },
            { time: '48ms', event: 'scroll', action: '이전 타이머 취소 → 새 타이머 시작', timer: 'reset', color: 'amber' as const },
            { time: '98ms', event: '(없음)', action: '50ms 경과 → 콜백 실행!', timer: 'fire', color: 'green' as const },
          ].map((row) => {
            const colors = {
              gray: 'bg-gray-100 text-gray-600',
              amber: 'bg-amber-50 text-amber-700',
              green: 'bg-green-50 text-green-700 font-medium',
            }
            return (
              <div key={row.time} className="flex items-center gap-2 text-[10px]">
                <span className="w-10 text-right font-mono text-gray-400">{row.time}</span>
                <span className={`w-14 rounded px-1.5 py-0.5 text-center ${row.event === '(없음)' ? 'bg-white text-gray-300 border border-dashed border-gray-200' : 'bg-blue-100 text-blue-600'}`}>
                  {row.event}
                </span>
                <span className={`flex-1 rounded px-2 py-0.5 ${colors[row.color]}`}>
                  {row.timer === 'fire' ? '🎯 ' : ''}{row.action}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* 코드 */}
      <div className="rounded-lg bg-gray-900 p-3 space-y-1">
        <p className="font-mono text-xs text-gray-300">
          <span className="text-blue-400">const</span> handleScroll = () =&gt; {'{'}
        </p>
        <p className="font-mono text-xs text-gray-300 pl-2">
          <span className="text-purple-400">if</span> (isScrolling.current) <span className="text-purple-400">return</span>
          <span className="ml-2 text-gray-600">// 탭 클릭 스크롤 중이면 무시</span>
        </p>
        <p className="font-mono text-xs text-gray-300 pl-2"> </p>
        <p className="font-mono text-xs text-gray-300 pl-2">
          <span className="text-gray-500">// 이전 타이머가 있으면 취소</span>
        </p>
        <p className="font-mono text-xs text-gray-300 pl-2">
          <span className="text-purple-400">if</span> (timer.current) <span className="text-yellow-300">clearTimeout</span>(timer.current)
        </p>
        <p className="font-mono text-xs text-gray-300 pl-2"> </p>
        <p className="font-mono text-xs text-gray-300 pl-2">
          <span className="text-gray-500">// 새 타이머 설정 (50ms)</span>
        </p>
        <p className="font-mono text-xs text-gray-300 pl-2">
          timer.current = <span className="text-yellow-300">setTimeout</span>(() =&gt; {'{'}
        </p>
        <p className="font-mono text-xs text-gray-300 pl-4">
          <span className="text-blue-400">const</span> index = Math.<span className="text-yellow-300">round</span>(
        </p>
        <p className="font-mono text-xs text-gray-300 pl-6">
          carousel.scrollLeft / carousel.offsetWidth
        </p>
        <p className="font-mono text-xs text-gray-300 pl-4">
          )
        </p>
        <p className="font-mono text-xs text-gray-300 pl-4">
          <span className="text-yellow-300">setSelectedTab</span>(TABS[index].id)
        </p>
        <p className="font-mono text-xs text-gray-300 pl-2">
          {'}'}, <span className="text-blue-400">50</span>)
        </p>
        <p className="font-mono text-xs text-gray-300">{'}'}</p>
      </div>

      {/* 왜 50ms? */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <p className="mb-1 text-[10px] font-semibold text-gray-600">왜 50ms인가?</p>
          <div className="space-y-1 text-[10px] text-gray-500">
            <p>• 화면 갱신 주기: ~16ms (60fps)</p>
            <p>• 50ms = 약 3프레임 분량</p>
            <p>• 스와이프 &quot;멈춤&quot; 감지에 충분히 짧음</p>
            <p>• 사용자에게는 체감 불가한 지연</p>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <p className="mb-1 text-[10px] font-semibold text-gray-600">passive: true 옵션</p>
          <div className="space-y-1 text-[10px] text-gray-500">
            <p>• preventDefault()를 안 쓴다고 선언</p>
            <p>• 브라우저가 핸들러 완료를 안 기다림</p>
            <p>• 스크롤이 JS에 의해 blocking 안 됨</p>
            <p>• 스와이프 제스처가 더 부드러워짐</p>
          </div>
        </div>
      </div>

      {/* clamp 설명 */}
      <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-3">
        <p className="mb-1 text-xs font-semibold text-blue-800">clamp 방어 — overscroll 대비</p>
        <div className="flex items-center gap-3 mt-2">
          <div className="flex-1 rounded bg-gray-900 p-2">
            <p className="font-mono text-[10px] text-gray-300">
              Math.<span className="text-yellow-300">max</span>(0, Math.<span className="text-yellow-300">min</span>(index, TABS.length - 1))
            </p>
          </div>
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-blue-700">
          스크롤 관성(bounce)으로 <code className="rounded bg-blue-100 px-1 text-[10px]">scrollLeft</code>가
          음수이거나 마지막 패널을 넘을 수 있다. 예: 4개 패널에서 <code className="rounded bg-blue-100 px-1 text-[10px]">round(1610/400) = 4</code>이면
          TABS[4]는 존재하지 않아 에러가 발생한다. clamp로 항상 유효한 인덱스 범위(0~3)를 보장한다.
        </p>
      </div>
    </div>
  )
}

/** 5. isScrolling 플래그 — 클릭 vs 스와이프 충돌 방지 */
function IsScrollingDiagram() {
  return (
    <div className="space-y-4">
      {/* 문제 상황 */}
      <div className="rounded-lg border border-red-200 bg-red-50/30 p-3">
        <p className="mb-2 text-xs font-semibold text-red-700">문제: 탭 클릭 시 중간 패널이 깜빡임</p>
        <div className="flex items-center gap-1 text-[10px]">
          <span className="rounded bg-blue-100 px-1.5 py-0.5 text-blue-700">홈</span>
          <span className="text-gray-300">→</span>
          <span className="rounded border border-red-300 bg-red-100 px-1.5 py-0.5 text-red-600">파일 (감지!)</span>
          <span className="text-gray-300">→</span>
          <span className="rounded border border-red-300 bg-red-100 px-1.5 py-0.5 text-red-600">검색 (감지!)</span>
          <span className="text-gray-300">→</span>
          <span className="rounded bg-green-100 px-1.5 py-0.5 text-green-700">설정 (목표)</span>
        </div>
        <p className="mt-1 text-[10px] text-red-600">
          smooth scroll로 &quot;설정&quot;까지 이동하는 동안 scroll 이벤트가 연속 발생 → 탭 인디케이터 깜빡임
        </p>
      </div>

      {/* 해결: 타임라인 */}
      <div className="relative pl-4">
        <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gray-200" />
        <div className="space-y-2">
          {[
            {
              icon: '👆',
              label: '"설정" 탭 클릭',
              detail: 'setSelectedTab("settings") + isScrolling = true',
              color: 'red' as const,
            },
            {
              icon: '🔇',
              label: 'scroll 감지 중단',
              detail: 'if (isScrolling.current) return — 중간 패널 무시',
              color: 'gray' as const,
            },
            {
              icon: '📜',
              label: 'scrollIntoView 진행중...',
              detail: 'Panel 1 → 2 → 3 → 4 를 지나가지만 탭은 변하지 않음',
              color: 'gray' as const,
            },
            {
              icon: '🏁',
              label: 'scrollend 이벤트 발생',
              detail: '브라우저가 스크롤 완료를 알림 (Panel 4에 정착)',
              color: 'blue' as const,
            },
            {
              icon: '🔊',
              label: 'scroll 감지 재개',
              detail: 'isScrolling = false — 이후 사용자 스와이프를 다시 감지',
              color: 'green' as const,
            },
          ].map((step) => {
            const colors = {
              red: { bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-400', text: 'text-red-700' },
              gray: { bg: 'bg-gray-50', border: 'border-gray-200', dot: 'bg-gray-300', text: 'text-gray-500' },
              blue: { bg: 'bg-blue-50', border: 'border-blue-200', dot: 'bg-blue-400', text: 'text-blue-700' },
              green: { bg: 'bg-green-50', border: 'border-green-200', dot: 'bg-green-400', text: 'text-green-700' },
            }
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

      {/* scrollend 폴백 */}
      <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-3">
        <p className="mb-1 text-xs font-semibold text-blue-800">scrollend 폴백 전략</p>
        <div className="rounded bg-gray-900 p-2 mt-2">
          <p className="font-mono text-[10px] text-gray-300">
            <span className="text-purple-400">if</span> (<span className="text-green-300">&apos;onscrollend&apos;</span> <span className="text-purple-400">in</span> carousel) {'{'}
          </p>
          <p className="font-mono text-[10px] text-gray-300 pl-2">
            <span className="text-gray-500">// 네이티브 지원 (Chrome 114+, Firefox 109+)</span>
          </p>
          <p className="font-mono text-[10px] text-gray-300 pl-2">
            carousel.<span className="text-yellow-300">addEventListener</span>(<span className="text-green-300">&apos;scrollend&apos;</span>, ...)
          </p>
          <p className="font-mono text-[10px] text-gray-300">{'}'} <span className="text-purple-400">else</span> {'{'}
          </p>
          <p className="font-mono text-[10px] text-gray-300 pl-2">
            <span className="text-gray-500">// 폴백: 400ms 후 해제</span>
          </p>
          <p className="font-mono text-[10px] text-gray-300 pl-2">
            <span className="text-yellow-300">setTimeout</span>(() =&gt; {'{ ... }'}, <span className="text-blue-400">400</span>)
          </p>
          <p className="font-mono text-[10px] text-gray-300">{'}'}</p>
        </div>
      </div>
    </div>
  )
}

/** 6. 탭 인디케이터 애니메이션 */
function IndicatorDiagram() {
  return (
    <div className="space-y-4">
      {/* 인디케이터 이동 시각화 */}
      <div className="space-y-3">
        {[
          { tab: '홈', left: 0, width: 25, active: true },
          { tab: '파일', left: 25, width: 25, active: false },
          { tab: '검색', left: 50, width: 25, active: false },
          { tab: '설정', left: 75, width: 25, active: false },
        ].map((item, idx) => (
          <div key={item.tab}>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-12 text-[10px] text-gray-500">탭 {idx + 1}:</span>
              <span className="text-[10px] font-medium text-gray-700">&quot;{item.tab}&quot; 클릭</span>
            </div>
            <div className="relative h-6 rounded bg-gray-100">
              <div className="absolute inset-0 flex">
                {['홈', '파일', '검색', '설정'].map((t) => (
                  <div
                    key={t}
                    className={[
                      'flex-1 text-center text-[10px] leading-6',
                      t === item.tab ? 'font-medium text-blue-600' : 'text-gray-400',
                    ].join(' ')}
                  >
                    {t}
                  </div>
                ))}
              </div>
              <div
                className="absolute bottom-0 h-0.5 rounded-full bg-blue-600 transition-all duration-300"
                style={{ left: `${item.left}%`, width: `${item.width}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* useLayoutEffect 설명 */}
      <div className="rounded-lg bg-gray-900 p-3 space-y-1">
        <p className="font-mono text-xs text-gray-300">
          <span className="text-purple-400">useLayoutEffect</span>(() =&gt; {'{'}
        </p>
        <p className="font-mono text-xs text-gray-300 pl-2">
          <span className="text-gray-500">// 선택된 탭 버튼의 DOM 위치 읽기</span>
        </p>
        <p className="font-mono text-xs text-gray-300 pl-2">
          <span className="text-blue-400">const</span> left = button.<span className="text-yellow-300">offsetLeft</span>
        </p>
        <p className="font-mono text-xs text-gray-300 pl-2">
          <span className="text-blue-400">const</span> width = button.<span className="text-yellow-300">offsetWidth</span>
        </p>
        <p className="font-mono text-xs text-gray-300 pl-2"> </p>
        <p className="font-mono text-xs text-gray-300 pl-2">
          <span className="text-gray-500">// 인디케이터 위치 직접 업데이트</span>
        </p>
        <p className="font-mono text-xs text-gray-300 pl-2">
          indicator.style.<span className="text-yellow-300">transform</span> = <span className="text-green-300">{`\`translateX(\${left}px)\``}</span>
        </p>
        <p className="font-mono text-xs text-gray-300 pl-2">
          indicator.style.<span className="text-yellow-300">width</span> = <span className="text-green-300">{`\`\${width}px\``}</span>
        </p>
        <p className="font-mono text-xs text-gray-300">{'}'}, [selectedTab])</p>
      </div>

      {/* useEffect vs useLayoutEffect */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-red-200 bg-red-50/30 p-3">
          <p className="mb-1 text-[10px] font-semibold text-red-600">useEffect 사용 시</p>
          <div className="flex items-center gap-1 text-[10px] text-gray-600">
            <span className="rounded bg-gray-200 px-1">render</span>
            <span className="text-gray-300">→</span>
            <span className="rounded bg-yellow-200 px-1">paint</span>
            <span className="text-gray-300">→</span>
            <span className="rounded bg-red-200 px-1">이동</span>
          </div>
          <p className="mt-1 text-[10px] text-red-600">화면에 이전 위치가 잠깐 보임 (깜빡임)</p>
        </div>
        <div className="rounded-lg border border-green-200 bg-green-50/30 p-3">
          <p className="mb-1 text-[10px] font-semibold text-green-600">useLayoutEffect 사용 시 ✓</p>
          <div className="flex items-center gap-1 text-[10px] text-gray-600">
            <span className="rounded bg-gray-200 px-1">render</span>
            <span className="text-gray-300">→</span>
            <span className="rounded bg-green-200 px-1">이동</span>
            <span className="text-gray-300">→</span>
            <span className="rounded bg-yellow-200 px-1">paint</span>
          </div>
          <p className="mt-1 text-[10px] text-green-600">paint 전에 위치 변경 → 깜빡임 없음</p>
        </div>
      </div>

      <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-3">
        <p className="mb-1 text-xs font-semibold text-blue-800">왜 CSS transition으로 애니메이션하는가?</p>
        <p className="text-[11px] leading-relaxed text-blue-700">
          인디케이터의 <code className="rounded bg-blue-100 px-1 text-[10px]">transition-all duration-300</code>이
          transform과 width 변경에 자동으로 적용된다. useLayoutEffect에서 style을 직접 변경해도 브라우저가
          paint하기 전이므로 transition의 시작점은 이전 위치, 끝점은 새 위치가 되어 부드러운 이동 효과가 만들어진다.
        </p>
      </div>
    </div>
  )
}

/** 7. 접근성 — ARIA 역할과 키보드 */
function AccessibilityDiagram() {
  return (
    <div className="space-y-4">
      {/* ARIA 구조 */}
      <div className="rounded-lg bg-gray-900 p-3 space-y-1">
        <p className="font-mono text-xs text-gray-300">
          <span className="text-gray-500">{'<!-- Tab List -->'}</span>
        </p>
        <p className="font-mono text-xs text-gray-300">
          {'<'}<span className="text-blue-400">div</span> <span className="text-purple-400">role</span>=<span className="text-green-300">&quot;tablist&quot;</span>{'>'}
        </p>
        <p className="font-mono text-xs text-gray-300 pl-4">
          {'<'}<span className="text-blue-400">button</span>
          {' '}<span className="text-purple-400">role</span>=<span className="text-green-300">&quot;tab&quot;</span>
        </p>
        <p className="font-mono text-xs text-gray-300 pl-8">
          <span className="text-purple-400">id</span>=<span className="text-green-300">&quot;tab-home&quot;</span>
        </p>
        <p className="font-mono text-xs text-gray-300 pl-8">
          <span className="text-purple-400">aria-selected</span>=<span className="text-green-300">&quot;true&quot;</span>
        </p>
        <p className="font-mono text-xs text-gray-300 pl-8">
          <span className="text-purple-400">aria-controls</span>=<span className="text-green-300">&quot;panel-home&quot;</span>
          {' />'}
        </p>
        <p className="font-mono text-xs text-gray-300">{'</'}<span className="text-blue-400">div</span>{'>'}</p>
        <p className="font-mono text-xs text-gray-300 mt-2">
          <span className="text-gray-500">{'<!-- Tab Panel -->'}</span>
        </p>
        <p className="font-mono text-xs text-gray-300">
          {'<'}<span className="text-blue-400">div</span>
          {' '}<span className="text-purple-400">role</span>=<span className="text-green-300">&quot;tabpanel&quot;</span>
        </p>
        <p className="font-mono text-xs text-gray-300 pl-4">
          <span className="text-purple-400">id</span>=<span className="text-green-300">&quot;panel-home&quot;</span>
        </p>
        <p className="font-mono text-xs text-gray-300 pl-4">
          <span className="text-purple-400">aria-labelledby</span>=<span className="text-green-300">&quot;tab-home&quot;</span>
          {' />'}
        </p>
      </div>

      {/* ARIA 속성 매핑 */}
      <div className="space-y-2">
        {[
          {
            attr: 'role="tablist"',
            desc: '탭 버튼 그룹의 컨테이너. 스크린리더에게 탭 UI임을 알림.',
            el: '탭 버튼 래퍼',
          },
          {
            attr: 'role="tab"',
            desc: '각 탭 버튼. 클릭 시 관련 패널을 표시.',
            el: '버튼',
          },
          {
            attr: 'aria-selected',
            desc: '현재 선택된 탭인지 여부. 스크린리더가 "선택됨"을 읽어줌.',
            el: '버튼',
          },
          {
            attr: 'aria-controls',
            desc: '이 탭이 제어하는 패널의 id. 탭↔패널 관계를 명시.',
            el: '버튼',
          },
          {
            attr: 'role="tabpanel"',
            desc: '탭에 연결된 콘텐츠 패널.',
            el: '패널',
          },
          {
            attr: 'aria-labelledby',
            desc: '이 패널을 설명하는 탭의 id. 패널↔탭 역참조.',
            el: '패널',
          },
        ].map((item) => (
          <div key={item.attr} className="flex items-start gap-2">
            <code className="flex-none rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-700">
              {item.attr}
            </code>
            <p className="text-[10px] leading-relaxed text-gray-600">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* tab ↔ panel 연결 다이어그램 */}
      <div className="rounded-lg bg-gray-50 p-3">
        <p className="mb-2 text-[10px] font-medium text-gray-500">탭과 패널의 연결 관계</p>
        <div className="flex items-center justify-center gap-6">
          <div className="space-y-1 text-center">
            <div className="rounded border-2 border-blue-400 bg-blue-50 px-3 py-2 text-[10px] font-medium text-blue-700">
              id=&quot;tab-home&quot;
              <br />
              aria-controls=&quot;panel-home&quot;
            </div>
            <p className="text-[10px] text-gray-400">Tab</p>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[10px] text-gray-400">aria-controls →</span>
            <span className="text-[10px] text-gray-400">← aria-labelledby</span>
          </div>
          <div className="space-y-1 text-center">
            <div className="rounded border-2 border-purple-400 bg-purple-50 px-3 py-2 text-[10px] font-medium text-purple-700">
              id=&quot;panel-home&quot;
              <br />
              aria-labelledby=&quot;tab-home&quot;
            </div>
            <p className="text-[10px] text-gray-400">Panel</p>
          </div>
        </div>
      </div>
    </div>
  )
}

/** 8. 키보드 내비게이션 — Roving Tabindex + Arrow Keys */
function KeyboardNavDiagram() {
  return (
    <div className="space-y-4">
      {/* Roving tabindex 시각화 */}
      <div className="space-y-3">
        <div className="rounded-lg bg-gray-50 p-3">
          <p className="mb-2 text-[10px] font-medium text-gray-500">Roving Tabindex 패턴</p>
          {[
            { active: 0, label: '"홈" 선택됨' },
            { active: 2, label: '→ → 로 "검색"으로 이동' },
          ].map((state) => (
            <div key={state.label} className="mb-2">
              <p className="mb-1 text-[10px] text-gray-500">{state.label}</p>
              <div className="flex gap-1">
                {['홈', '파일', '검색', '설정'].map((tab, i) => (
                  <div
                    key={tab}
                    className={[
                      'flex-1 rounded px-2 py-1.5 text-center text-[10px]',
                      i === state.active
                        ? 'border-2 border-blue-400 bg-blue-50 font-medium text-blue-700'
                        : 'border border-gray-200 bg-white text-gray-400',
                    ].join(' ')}
                  >
                    {tab}
                    <span className="ml-1 font-mono text-[8px]">
                      {i === state.active ? 'tabIndex=0' : 'tabIndex=-1'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 키 매핑 */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { key: '→ ArrowRight', action: '다음 탭으로 이동 (루프)', color: 'blue' },
          { key: '← ArrowLeft', action: '이전 탭으로 이동 (루프)', color: 'blue' },
          { key: 'Home', action: '첫 번째 탭으로 이동', color: 'purple' },
          { key: 'End', action: '마지막 탭으로 이동', color: 'purple' },
        ].map((item) => (
          <div key={item.key} className="flex items-center gap-2 rounded bg-gray-50 px-2 py-1.5">
            <kbd className="rounded bg-gray-800 px-1.5 py-0.5 text-[10px] font-mono text-white">
              {item.key}
            </kbd>
            <span className="text-[10px] text-gray-600">{item.action}</span>
          </div>
        ))}
      </div>

      {/* 루프 포커스 */}
      <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-3">
        <p className="mb-1 text-xs font-semibold text-blue-800">루프 포커스 (Loop Focus)</p>
        <div className="flex items-center justify-center gap-1 mt-2 text-[10px]">
          <span className="rounded bg-gray-200 px-1.5 py-0.5 text-gray-500">설정</span>
          <span className="text-gray-300">→</span>
          <span className="rounded bg-blue-100 px-1.5 py-0.5 font-medium text-blue-700">홈</span>
          <span className="mx-2 text-gray-300">|</span>
          <span className="rounded bg-blue-100 px-1.5 py-0.5 font-medium text-blue-700">홈</span>
          <span className="text-gray-300">←</span>
          <span className="rounded bg-gray-200 px-1.5 py-0.5 text-gray-500">설정</span>
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-blue-700">
          마지막 탭에서 <kbd className="rounded bg-blue-100 px-1 text-[10px]">→</kbd>를 누르면 첫 번째 탭으로,
          첫 번째 탭에서 <kbd className="rounded bg-blue-100 px-1 text-[10px]">←</kbd>를 누르면 마지막 탭으로 순환한다.
          모듈러 연산 <code className="rounded bg-blue-100 px-1 text-[10px]">(index + 1) % length</code>로 구현.
        </p>
      </div>

      {/* Roving tabindex 설명 */}
      <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3">
        <p className="mb-1 text-xs font-semibold text-amber-800">왜 Roving Tabindex인가?</p>
        <p className="text-[11px] leading-relaxed text-amber-700">
          모든 탭에 <code className="rounded bg-amber-100 px-1 text-[10px]">tabIndex=0</code>을 주면
          Tab 키로 각 탭을 하나씩 지나가야 한다. Roving Tabindex는 <strong>활성 탭만 tabIndex=0</strong>,
          나머지는 -1로 설정하여 Tab 키 한 번으로 탭 그룹 전체를 건너뛸 수 있게 한다.
          탭 내부 이동은 화살표 키로 처리한다. 이것이 WAI-ARIA Tabs 패턴의 권장 방식이다.
        </p>
      </div>
    </div>
  )
}

/** 9. ResizeObserver — 인디케이터 위치 자동 보정 */
function ResizeObserverDiagram() {
  return (
    <div className="space-y-4">
      {/* 문제 상황 */}
      <div className="flex gap-4">
        <div className="flex-1">
          <p className="mb-2 text-center text-xs font-medium text-red-500">ResizeObserver 없이</p>
          <div className="overflow-hidden rounded-lg border-2 border-red-200">
            <div className="flex border-b border-gray-200 bg-gray-50">
              <div className="flex-1 py-1.5 text-center text-[10px] text-gray-400">홈</div>
              <div className="flex-1 py-1.5 text-center text-[10px] text-gray-400">파일</div>
              <div className="flex-1 py-1.5 text-center text-[10px] font-medium text-blue-600">검색</div>
              <div className="flex-1 py-1.5 text-center text-[10px] text-gray-400">설정</div>
            </div>
            <div className="relative h-1 bg-gray-100">
              <div className="absolute left-[30%] h-full w-[20%] bg-blue-600" />
              <div className="absolute left-[50%] top-0 h-3 w-px border-l-2 border-dashed border-red-400" />
              <p className="absolute left-[52%] -top-0.5 text-[8px] text-red-500">어긋남!</p>
            </div>
            <div className="bg-white px-3 py-4 text-center text-xs text-gray-400">
              윈도우 리사이즈 후
            </div>
          </div>
        </div>

        <div className="flex-1">
          <p className="mb-2 text-center text-xs font-medium text-green-600">ResizeObserver 적용</p>
          <div className="overflow-hidden rounded-lg border-2 border-green-300">
            <div className="flex border-b border-gray-200 bg-gray-50">
              <div className="flex-1 py-1.5 text-center text-[10px] text-gray-400">홈</div>
              <div className="flex-1 py-1.5 text-center text-[10px] text-gray-400">파일</div>
              <div className="flex-1 py-1.5 text-center text-[10px] font-medium text-blue-600">검색</div>
              <div className="flex-1 py-1.5 text-center text-[10px] text-gray-400">설정</div>
            </div>
            <div className="relative h-1 bg-gray-100">
              <div className="absolute left-[50%] h-full w-[25%] bg-blue-600" />
            </div>
            <div className="bg-white px-3 py-4 text-center text-xs text-gray-400">
              자동 재계산 → 정확한 위치
            </div>
          </div>
        </div>
      </div>

      {/* 감시 대상 */}
      <div className="rounded-lg bg-gray-50 p-3">
        <p className="mb-2 text-[10px] font-medium text-gray-500">ResizeObserver 감시 대상</p>
        <div className="space-y-1.5">
          {[
            { target: 'TabList 컨테이너', reason: '윈도우 리사이즈, 레이아웃 변경 시 전체 너비 변동', icon: '📦' },
            { target: '개별 Tab 버튼', reason: '폰트 로딩, 텍스트 변경 등으로 개별 탭 너비 변동', icon: '🔘' },
          ].map((item) => (
            <div key={item.target} className="flex items-start gap-2 rounded bg-white border border-gray-200 px-2 py-1.5">
              <span className="text-sm">{item.icon}</span>
              <div>
                <p className="text-[10px] font-medium text-gray-700">{item.target}</p>
                <p className="text-[10px] text-gray-500">{item.reason}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 코드 */}
      <div className="rounded-lg bg-gray-900 p-3 space-y-1">
        <p className="font-mono text-xs text-gray-300">
          <span className="text-purple-400">useEffect</span>(() =&gt; {'{'}
        </p>
        <p className="font-mono text-xs text-gray-300 pl-2">
          <span className="text-blue-400">const</span> ro = <span className="text-purple-400">new</span> <span className="text-yellow-300">ResizeObserver</span>(() =&gt; {'{'}
        </p>
        <p className="font-mono text-xs text-gray-300 pl-4">
          updateIndicator()  <span className="text-gray-600">// 위치 재계산</span>
        </p>
        <p className="font-mono text-xs text-gray-300 pl-2">
          {'}'})
        </p>
        <p className="font-mono text-xs text-gray-300 pl-2">
          ro.<span className="text-yellow-300">observe</span>(listElement)  <span className="text-gray-600">// 컨테이너 감시</span>
        </p>
        <p className="font-mono text-xs text-gray-300 pl-2">
          tabButtons.<span className="text-yellow-300">forEach</span>(btn =&gt; ro.<span className="text-yellow-300">observe</span>(btn))
        </p>
        <p className="font-mono text-xs text-gray-300 pl-2">
          <span className="text-purple-400">return</span> () =&gt; ro.<span className="text-yellow-300">disconnect</span>()
        </p>
        <p className="font-mono text-xs text-gray-300">
          {'}'}, [updateIndicator])
        </p>
      </div>

      <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-3">
        <p className="mb-1 text-xs font-semibold text-blue-800">Base UI의 접근 방식</p>
        <p className="text-[11px] leading-relaxed text-blue-700">
          Base UI는 ResizeObserver 콜백에서 <code className="rounded bg-blue-100 px-1 text-[10px]">useForcedRerendering()</code>을
          호출하여 인디케이터 컴포넌트를 강제 리렌더링한다. 리렌더링 시 <code className="rounded bg-blue-100 px-1 text-[10px]">offsetLeft</code> /
          <code className="rounded bg-blue-100 px-1 text-[10px]">offsetWidth</code>를 다시 읽어 CSS 변수를 업데이트한다.
          상태 변경 없이도 DOM 측정값이 최신으로 유지된다.
        </p>
      </div>
    </div>
  )
}

/** 10. activationDirection — 전환 방향 감지 */
function ActivationDirectionDiagram() {
  return (
    <div className="space-y-4">
      {/* 방향 감지 시각화 */}
      <div className="rounded-lg bg-gray-50 p-3">
        <p className="mb-2 text-[10px] font-medium text-gray-500">탭 전환 시 방향 결정</p>
        <div className="space-y-2">
          {[
            { from: '홈', to: '검색', fromIdx: 0, toIdx: 2, dir: 'right', arrow: '→→' },
            { from: '설정', to: '파일', fromIdx: 3, toIdx: 1, dir: 'left', arrow: '←←' },
            { from: '파일', to: '파일', fromIdx: 1, toIdx: 1, dir: 'none', arrow: '=' },
          ].map((ex) => (
            <div key={`${ex.from}-${ex.to}`} className="flex items-center gap-2 text-[10px]">
              <span className="w-8 rounded bg-gray-200 px-1 py-0.5 text-center text-gray-600">{ex.from}</span>
              <span className="text-gray-400">{ex.arrow}</span>
              <span className="w-8 rounded bg-blue-100 px-1 py-0.5 text-center font-medium text-blue-700">{ex.to}</span>
              <span className="text-gray-400">idx: {ex.fromIdx} → {ex.toIdx}</span>
              <span className="text-gray-400">→</span>
              <span className={[
                'rounded px-1.5 py-0.5 font-medium',
                ex.dir === 'right' ? 'bg-green-100 text-green-700' :
                ex.dir === 'left' ? 'bg-orange-100 text-orange-700' :
                'bg-gray-200 text-gray-500',
              ].join(' ')}>
                {ex.dir}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* data attribute 활용 */}
      <div className="rounded-lg bg-gray-900 p-3 space-y-1">
        <p className="font-mono text-xs text-gray-300">
          <span className="text-gray-500">// 방향 계산</span>
        </p>
        <p className="font-mono text-xs text-gray-300">
          <span className="text-blue-400">const</span> direction =
        </p>
        <p className="font-mono text-xs text-gray-300 pl-2">
          newIndex {'>'} prevIndex ? <span className="text-green-300">&apos;right&apos;</span> :
        </p>
        <p className="font-mono text-xs text-gray-300 pl-2">
          newIndex {'<'} prevIndex ? <span className="text-green-300">&apos;left&apos;</span> :
        </p>
        <p className="font-mono text-xs text-gray-300 pl-2">
          <span className="text-green-300">&apos;none&apos;</span>
        </p>
        <p className="font-mono text-xs text-gray-300 mt-2">
          <span className="text-gray-500">// HTML data attribute로 노출</span>
        </p>
        <p className="font-mono text-xs text-gray-300">
          {'<'}<span className="text-blue-400">div</span> <span className="text-purple-400">data-activation-direction</span>=<span className="text-green-300">{'{direction}'}</span>{'>'}
        </p>
      </div>

      {/* CSS 활용 예시 */}
      <div className="rounded-lg border border-green-200 bg-green-50/30 p-3">
        <p className="mb-2 text-xs font-semibold text-green-700">CSS에서 방향별 애니메이션 적용</p>
        <div className="rounded bg-gray-900 p-2 space-y-1">
          <p className="font-mono text-[10px] text-gray-300">
            <span className="text-gray-500">/* 오른쪽으로 전환: 새 패널이 오른쪽에서 등장 */</span>
          </p>
          <p className="font-mono text-[10px] text-gray-300">
            <span className="text-purple-400">[data-activation-direction=&quot;right&quot;]</span> .panel-enter {'{'}
          </p>
          <p className="font-mono text-[10px] text-gray-300 pl-2">
            <span className="text-blue-400">animation</span>: slideFromRight 0.3s;
          </p>
          <p className="font-mono text-[10px] text-gray-300">{'}'}</p>
          <p className="font-mono text-[10px] text-gray-300 mt-1">
            <span className="text-gray-500">/* 왼쪽으로 전환: 새 패널이 왼쪽에서 등장 */</span>
          </p>
          <p className="font-mono text-[10px] text-gray-300">
            <span className="text-purple-400">[data-activation-direction=&quot;left&quot;]</span> .panel-enter {'{'}
          </p>
          <p className="font-mono text-[10px] text-gray-300 pl-2">
            <span className="text-blue-400">animation</span>: slideFromLeft 0.3s;
          </p>
          <p className="font-mono text-[10px] text-gray-300">{'}'}</p>
        </div>
      </div>

      {/* inert 속성 */}
      <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3">
        <p className="mb-1 text-xs font-semibold text-amber-800">비활성 패널의 inert 속성</p>
        <div className="flex gap-2 mt-2">
          {['홈', '파일', '검색', '설정'].map((tab, i) => (
            <div
              key={tab}
              className={[
                'flex-1 rounded px-2 py-2 text-center text-[10px]',
                i === 0
                  ? 'border-2 border-blue-400 bg-blue-50 font-medium text-blue-700'
                  : 'border border-gray-200 bg-gray-100 text-gray-400 opacity-50',
              ].join(' ')}
            >
              {tab}
              <br />
              <span className="font-mono text-[8px]">
                {i === 0 ? 'active' : 'inert'}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-amber-700">
          <code className="rounded bg-amber-100 px-1 text-[10px]">inert</code> 속성은 요소와 그 하위 요소를
          비활성화한다. 포커스가 보이지 않는 패널 안으로 들어가는 것을 방지하고,
          스크린리더가 숨겨진 콘텐츠를 읽는 것도 차단한다. CSS <code className="rounded bg-amber-100 px-1 text-[10px]">display: none</code>과
          달리 DOM에서 요소를 제거하지 않으므로 scroll-snap 레이아웃이 유지된다.
        </p>
      </div>
    </div>
  )
}

export function ConceptDiagrams() {
  return (
    <div className="space-y-4">
      <ConceptCard
        number={0}
        title="전체 구조 — 수평 캐러셀 기반 탭"
        description="TabList(탭 버튼) + Carousel(수평 스크롤 패널)로 구성된다. 각 패널은 부모 너비의 100%를 차지하여 한 번에 하나만 보인다. 탭 클릭 또는 좌우 스와이프로 패널을 전환하며, 인디케이터가 선택된 탭 아래에서 부드럽게 이동한다."
      >
        <StructureDiagram />
      </ConceptCard>

      <ConceptCard
        number={1}
        title="CSS scroll-snap — 네이티브 스와이프 제스처"
        description="scroll-snap-type: x mandatory는 브라우저가 스크롤을 가장 가까운 snap point에 자동으로 정렬하게 한다. JS로 터치/마우스 이벤트를 직접 처리할 필요 없이, CSS만으로 부드러운 스와이프 UX를 구현할 수 있다."
      >
        <ScrollSnapDiagram />
      </ConceptCard>

      <ConceptCard
        number={2}
        title="scrollIntoView — 탭 클릭으로 패널 전환"
        description="탭을 클릭하면 해당 패널 요소에 scrollIntoView({ behavior: 'smooth', inline: 'start' })를 호출한다. 패널 너비를 직접 계산하지 않아도 브라우저가 정확한 위치로 스크롤해주며, scroll-snap과도 자연스럽게 연동된다."
      >
        <ScrollIntoViewDiagram />
      </ConceptCard>

      <ConceptCard
        number={3}
        title="스크롤 위치 → 탭 동기화 (Math.round)"
        description="사용자가 스와이프하면 scroll 이벤트에서 현재 스크롤 위치를 패널 너비로 나누어 인덱스를 계산한다. Math.round를 사용해 50% 이상 넘어가면 다음 탭으로 전환하여, scroll-snap의 동작과 시각적으로 일치시킨다."
      >
        <ScrollSyncDiagram />
      </ConceptCard>

      <ConceptCard
        number={4}
        title="Scroll Debounce — 스와이프 중 불필요한 갱신 방지"
        description="scroll 이벤트는 스와이프 중 초당 수십~수백 회 발생한다. 매번 setSelectedTab을 호출하면 대량의 리렌더링과 인디케이터 떨림이 발생한다. clearTimeout + setTimeout(50ms)으로 마지막 scroll 이후 50ms 동안 추가 이벤트가 없을 때만 탭을 갱신하고, clamp로 overscroll 시 인덱스 범위를 보장한다."
      >
        <ScrollDebounceDiagram />
      </ConceptCard>

      <ConceptCard
        number={5}
        title="isScrolling 플래그 — 클릭 스크롤 vs 사용자 스와이프"
        description="탭 클릭으로 smooth scroll이 진행되는 동안 scroll 이벤트가 연속 발생하여 중간 패널이 순간적으로 선택될 수 있다. isScrolling 플래그로 프로그래밍 스크롤 중에는 감지를 중단하고, scrollend 이벤트(또는 timeout 폴백)로 정확한 시점에 재개한다."
      >
        <IsScrollingDiagram />
      </ConceptCard>

      <ConceptCard
        number={6}
        title="탭 인디케이터 — useLayoutEffect + CSS transition"
        description="선택된 탭이 바뀌면 useLayoutEffect에서 해당 탭 버튼의 offsetLeft/offsetWidth를 읽어 인디케이터의 transform과 width를 직접 업데이트한다. CSS transition이 자동으로 이전→새 위치 사이를 보간하여 부드러운 이동 효과가 만들어진다."
      >
        <IndicatorDiagram />
      </ConceptCard>

      <ConceptCard
        number={7}
        title="접근성 — ARIA 역할과 탭-패널 연결"
        description="role='tablist', role='tab', role='tabpanel'로 탭 UI의 의미를 명시하고, aria-selected로 현재 선택 상태를, aria-controls / aria-labelledby로 탭↔패널의 양방향 연결을 스크린리더에 전달한다."
      >
        <AccessibilityDiagram />
      </ConceptCard>

      <ConceptCard
        number={8}
        title="키보드 내비게이션 — Roving Tabindex + Arrow Keys (Base UI)"
        description="WAI-ARIA Tabs 패턴에 따라 활성 탭만 tabIndex=0, 나머지는 -1로 설정한다. Tab 키로 탭 그룹을 한 번에 건너뛰고, 화살표 키로 탭 간 이동한다. Home/End로 처음/마지막 탭에 접근하며, 마지막↔처음 루프 포커스를 지원한다."
      >
        <KeyboardNavDiagram />
      </ConceptCard>

      <ConceptCard
        number={9}
        title="ResizeObserver — 인디케이터 위치 자동 보정 (Base UI)"
        description="useLayoutEffect는 selectedTab 변경 시에만 실행되므로, 윈도우 리사이즈나 폰트 로딩 등으로 탭 너비가 바뀌면 인디케이터가 어긋난다. ResizeObserver로 탭 리스트와 개별 탭 버튼의 크기 변화를 감시하여 인디케이터 위치를 자동으로 재계산한다."
      >
        <ResizeObserverDiagram />
      </ConceptCard>

      <ConceptCard
        number={10}
        title="activationDirection — 전환 방향 감지 (Base UI)"
        description="탭이 바뀔 때 이전 인덱스와 새 인덱스를 비교하여 이동 방향(left/right/none)을 결정한다. data-activation-direction 속성으로 노출하여 CSS만으로 방향별 패널 전환 애니메이션을 구현할 수 있다. 비활성 패널에는 inert 속성으로 포커스와 스크린리더 접근을 차단한다."
      >
        <ActivationDirectionDiagram />
      </ConceptCard>
    </div>
  )
}
