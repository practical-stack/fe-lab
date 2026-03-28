import { useState } from 'react'
import { Panel } from '~/@lib/ui/common/panel'

export function HiddenStackingContextCreators() {
  return (
    <div>
      <h3 className="mb-3 text-base font-semibold text-gray-800">4. 숨겨진 Stacking Context 생성자들</h3>
      <p className="mb-4 text-sm text-gray-600">
        의도치 않게 SC를 만드는 CSS 속성들. 특히 애니메이션, GPU 가속, 시각 효과 관련 속성이 범인인 경우가 많습니다.
      </p>

      <Panel
        variant="problem"
        label="Trap"
        tag="opacity, transform, filter — 보이지 않는 SC 생성"
        data={{
          description:
            '아래 시나리오에서 Tooltip(z-index: 999)이 Other Element(z-index: 2)보다 뒤에 숨는 원인을 찾아보세요. 각 시나리오의 "원인 보기"를 클릭하면 어떤 속성이 SC를 만들었는지 확인할 수 있습니다.',
          demo: <HiddenCreatorsDemo />,
          code: HIDDEN_CREATORS_CODE,
        }}
      />
    </div>
  )
}

type Scenario = {
  title: string
  culprit: string
  css: string
  style: React.CSSProperties
  explanation: string
  realWorld: string
}

const SCENARIOS: Scenario[] = [
  {
    title: '시나리오 A: 카드에 hover 효과 추가 후',
    culprit: 'transform: scale(1.02)',
    css: 'transform: scale(1.02)',
    style: { transform: 'scale(1.02)' },
    explanation: 'CSS transform은 어떤 값이든 새 SC를 생성합니다. hover 시 transform: scale()을 적용하면 그 순간 새 SC가 생기면서 자식의 z-index 범위가 제한됩니다.',
    realWorld: '카드 hover 애니메이션, 버튼 press 효과, 이미지 확대',
  },
  {
    title: '시나리오 B: 로딩 중 skeleton에 opacity 적용',
    culprit: 'opacity: 0.7',
    css: 'opacity: 0.7',
    style: { opacity: 0.7 },
    explanation: 'opacity가 1 미만이면 새 SC를 생성합니다. 로딩 상태에서 부모에 opacity를 적용하면 자식 Tooltip이 다른 요소 뒤로 밀립니다.',
    realWorld: 'Skeleton 로딩, disabled 상태, fade-in/out 애니메이션',
  },
  {
    title: '시나리오 C: backdrop-filter로 유리 효과',
    culprit: 'backdrop-filter: blur(10px)',
    css: 'backdrop-filter: blur(10px)',
    style: { backdropFilter: 'blur(10px)' },
    explanation: 'backdrop-filter는 none이 아닌 값이면 새 SC를 생성합니다. glassmorphism 디자인에서 자주 문제가 됩니다.',
    realWorld: 'Glassmorphism UI, 투명 헤더, 블러 배경 카드',
  },
  {
    title: '시나리오 D: will-change로 성능 최적화',
    culprit: 'will-change: transform',
    css: 'will-change: transform',
    style: { willChange: 'transform' },
    explanation: 'will-change는 브라우저에게 변경 예정을 알리는 속성이지만, 실제로 composite layer를 미리 만들면서 SC도 함께 생성합니다.',
    realWorld: '무한 스크롤 리스트, 복잡한 애니메이션, 성능 최적화 시도',
  },
]

function HiddenCreatorsDemo() {
  const [activeScenario, setActiveScenario] = useState(0)
  const [showCause, setShowCause] = useState(false)
  const [applyCulprit, setApplyCulprit] = useState(true)

  const scenario = SCENARIOS[activeScenario]

  return (
    <div className="space-y-4">
      {/* Scenario tabs */}
      <div className="flex gap-1">
        {SCENARIOS.map((s, i) => (
          <button
            key={s.title}
            onClick={() => {
              setActiveScenario(i)
              setShowCause(false)
              setApplyCulprit(true)
            }}
            className={`rounded-md px-2.5 py-1 text-xs transition-colors ${
              activeScenario === i
                ? 'bg-red-100 font-medium text-red-700'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {String.fromCharCode(65 + i)}
          </button>
        ))}
      </div>

      <p className="text-xs font-medium text-gray-700">{scenario.title}</p>

      {/* Visual demo */}
      <div className="relative flex h-48 items-start justify-center rounded-lg border border-gray-200 bg-gray-50 pt-10">
        {/* Card with hidden SC creator */}
        <div
          className="relative w-56 rounded-lg border border-gray-300 bg-white p-3 shadow-sm transition-all"
          style={applyCulprit ? scenario.style : undefined}
        >
          <p className="text-xs font-medium text-gray-700">Card Component</p>
          <p className="font-mono text-[10px] text-gray-400">
            {applyCulprit ? scenario.css : '(속성 제거됨)'}
          </p>

          {/* Tooltip trying to escape */}
          <div
            className="absolute -top-6 left-1/2 w-36 rounded-md border border-blue-300 bg-blue-50 p-2 shadow-md"
            style={{ position: 'absolute', zIndex: 999, marginLeft: '-2rem' }}
          >
            <p className="text-[10px] font-bold text-blue-700">Tooltip</p>
            <p className="font-mono text-[10px] text-blue-500">z-index: 999</p>
          </div>
        </div>

        {/* Overlapping element - positioned to overlap with the tooltip */}
        <div
          className="absolute right-1/4 top-4 w-36 rounded-lg border-2 border-green-400 bg-green-50 p-2"
          style={{ position: 'absolute', zIndex: 2 }}
        >
          <p className="text-[10px] font-bold text-green-700">Other Element</p>
          <p className="font-mono text-[10px] text-green-500">z-index: 2</p>
          <p className="text-[10px] text-green-600">
            {applyCulprit ? '✅ Tooltip 위에!' : '❌ Tooltip 아래'}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={applyCulprit}
            onChange={(e) => setApplyCulprit(e.target.checked)}
            className="rounded"
          />
          <span className="text-gray-600">
            <span className="font-mono">{scenario.culprit}</span> 적용
          </span>
        </label>

        <button
          onClick={() => setShowCause(!showCause)}
          className="rounded bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-200"
        >
          {showCause ? '원인 숨기기' : '원인 보기'}
        </button>
      </div>

      {showCause && (
        <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="text-xs font-medium text-amber-800">
            범인: <span className="font-mono">{scenario.culprit}</span>
          </p>
          <p className="text-xs text-amber-700">{scenario.explanation}</p>
          <p className="text-[11px] text-gray-500">
            실무 상황: {scenario.realWorld}
          </p>
        </div>
      )}
    </div>
  )
}

const HIDDEN_CREATORS_CODE = `/* 🕵️ 의도치 않게 SC를 만드는 CSS 속성들 */

/* Case A: hover 애니메이션 */
.card:hover {
  transform: scale(1.02);  /* ← SC 생성! */
  /* hover 전에는 Tooltip이 정상인데,
     hover하면 갑자기 Tooltip이 뒤로 밀림 */
}

/* Case B: 로딩/disabled 상태 */
.card--loading {
  opacity: 0.7;            /* ← SC 생성! */
  /* 로딩 중에만 Tooltip이 안 보이는 버그 */
}

/* Case C: Glassmorphism */
.glass-card {
  backdrop-filter: blur(10px);  /* ← SC 생성! */
  background: rgba(255, 255, 255, 0.1);
}

/* Case D: 성능 최적화 시도 */
.optimized-list-item {
  will-change: transform;  /* ← SC 생성! */
}

/* 디버깅 방법은 섹션 8 "실전 패턴"의 체크리스트 참고 */`
