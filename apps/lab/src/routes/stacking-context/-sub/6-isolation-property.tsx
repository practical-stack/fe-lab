import { useState } from 'react'
import { Panel } from '~/@lib/ui/common/panel'

export function IsolationProperty() {
  return (
    <div>
      <h3 className="mb-3 text-base font-semibold text-gray-800">6. isolation: isolate — 부작용 없는 SC 생성</h3>
      <p className="mb-4 text-sm text-gray-600">
        SC를 의도적으로 만들고 싶을 때 z-index, transform, opacity 대신 <code className="rounded bg-gray-100 px-1 text-xs">isolation: isolate</code>를 사용하면
        시각적 부작용 없이 깔끔하게 SC를 생성할 수 있습니다.
      </p>

      <div className="space-y-6">
        <Panel
          variant="problem"
          label="Problem"
          tag="::before/::after의 z-index: -1이 배경 뒤로 빠짐"
          data={{
            description:
              '카드에 장식용 pseudo-element를 추가하고 z-index: -1로 텍스트 뒤에 배치하려 했지만, 카드에 SC가 없으면 z-index: -1이 카드가 아닌 페이지 배경 뒤로 빠져버립니다.',
            demo: <IsolationProblemDemo />,
            code: PROBLEM_CODE,
          }}
        />

        <Panel
          variant="solution"
          label="Solution"
          tag="isolation: isolate로 pseudo-element 가두기"
          data={{
            description:
              '카드에 isolation: isolate를 적용하면 새 SC가 만들어져서, pseudo-element의 z-index: -1이 카드 안에서만 평가됩니다. 텍스트 뒤, 카드 배경 앞에 정확히 위치합니다.',
            demo: <IsolationSolutionDemo />,
            code: SOLUTION_CODE,
          }}
        />
      </div>
    </div>
  )
}

function DecoCard({ useIsolation, label }: { useIsolation: boolean; label: string }) {
  return (
    <div
      className="relative rounded-lg border border-gray-300 bg-white px-5 py-4 shadow-sm"
      style={useIsolation ? { isolation: 'isolate' as React.CSSProperties['isolation'] } : undefined}
    >
      {/* Decorative pseudo-element equivalent */}
      <div
        className="absolute inset-0 rounded-lg"
        style={{
          zIndex: -1,
          background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #f472b6 100%)',
          opacity: 0.3,
        }}
      />
      <p className="relative text-sm font-semibold text-gray-800">{label}</p>
      <p className="relative mt-1 text-xs text-gray-500">
        장식 요소: <span className="font-mono">z-index: -1</span>
      </p>
      <p className="relative mt-0.5 text-[10px] text-gray-400">
        {useIsolation ? 'isolation: isolate ✅' : 'isolation 없음'}
      </p>
    </div>
  )
}

function IsolationProblemDemo() {
  return (
    <div className="space-y-3">
      <p className="text-[10px] text-gray-500">
        그라데이션 장식이 카드 뒤(배경 아래)로 빠져서 보이지 않습니다. z-index: -1이 페이지 루트 SC에서 평가되기 때문입니다.
      </p>

      <div className="flex gap-4">
        <div className="flex-1">
          <DecoCard useIsolation={false} label="카드 A" />
        </div>
        <div className="flex-1">
          <DecoCard useIsolation={false} label="카드 B" />
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-2">
        <span className="text-red-500">❌</span>
        <p className="text-[10px] text-red-700">
          그라데이션 장식이 안 보임 — <span className="font-mono">z-index: -1</span>이 카드가 아닌 페이지 배경 뒤로 빠짐
        </p>
      </div>
    </div>
  )
}

function IsolationSolutionDemo() {
  const [useIsolation, setUseIsolation] = useState(true)

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-xs">
        <input
          type="checkbox"
          checked={useIsolation}
          onChange={(e) => setUseIsolation(e.target.checked)}
          className="rounded"
        />
        <span className="font-mono text-gray-600">isolation: isolate</span>
        <span className="text-gray-400">← 토글해서 비교해보세요</span>
      </label>

      <div className="flex gap-4">
        <div className="flex-1">
          <DecoCard useIsolation={useIsolation} label="카드 A" />
        </div>
        <div className="flex-1">
          <DecoCard useIsolation={useIsolation} label="카드 B" />
        </div>
      </div>

      <div
        className={`flex items-start gap-2 rounded-md border p-2 ${
          useIsolation ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
        }`}
      >
        <span>{useIsolation ? '✅' : '❌'}</span>
        <p className={`text-[10px] ${useIsolation ? 'text-green-700' : 'text-red-700'}`}>
          {useIsolation
            ? '그라데이션 장식이 텍스트 뒤, 카드 배경 앞에 정확히 위치!'
            : '그라데이션 장식이 카드 뒤로 빠져서 보이지 않음'}
        </p>
      </div>

      {/* isolation vs other SC creators */}
      <div className="rounded-lg border border-gray-200 bg-white p-3">
        <p className="mb-2 text-xs font-medium text-gray-700">isolation: isolate vs 다른 SC 생성 방법:</p>
        <div className="space-y-1.5 text-[10px]">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 text-green-500">✅</span>
            <span className="text-gray-600">
              <span className="font-mono font-medium">isolation: isolate</span> — 시각적 부작용 없음, SC 생성 목적으로 설계됨
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="mt-0.5 text-red-500">⚠️</span>
            <span className="text-gray-600">
              <span className="font-mono font-medium">position: relative; z-index: 0</span> — 레이아웃 영향 가능, 다른 z-index와 충돌 가능
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="mt-0.5 text-red-500">⚠️</span>
            <span className="text-gray-600">
              <span className="font-mono font-medium">transform: translateZ(0)</span> — fixed 자식의 Containing Block을 변경, 성능 영향
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="mt-0.5 text-red-500">⚠️</span>
            <span className="text-gray-600">
              <span className="font-mono font-medium">opacity: 0.99</span> — 미세한 투명도 차이, 서브픽셀 렌더링 영향
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

const PROBLEM_CODE = `/* ❌ pseudo-element가 카드 뒤로 빠지는 문제 */

.card {
  position: relative;
  background: white;
  /* SC가 없음! */
}

.card::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: linear-gradient(135deg, #818cf8, #f472b6);
  opacity: 0.3;
  /* 의도: 텍스트 뒤, 카드 배경 앞
   * 현실: 카드에 SC가 없어서 z-index: -1이
   *       페이지 루트 SC에서 평가됨
   *       → 카드 전체 뒤(페이지 배경 아래)로 빠짐!
   *       → 그라데이션이 보이지 않음 */
}`

const SOLUTION_CODE = `/* ✅ isolation: isolate로 pseudo-element 가두기 */

.card {
  position: relative;
  background: white;
  isolation: isolate;
  /* → 새 SC 생성!
   * → z-index: -1이 이 SC 안에서만 평가됨 */
}

.card::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: linear-gradient(135deg, #818cf8, #f472b6);
  opacity: 0.3;
  /* → 텍스트 뒤, 카드 배경 앞에 정확히 위치! */
}

/* ===== isolation의 장점 ===== */

/*
 * 1. 부작용 없음: 시각적 변화 없이 SC만 생성
 * 2. 의도 명확: "이 요소는 SC다"라는 선언적 표현
 * 3. Containing Block 불변: fixed 자식에 영향 없음
 * 4. 성능 중립: composite layer 강제 생성하지 않음
 */

/* ===== Tailwind CSS ===== */
<div className="isolate">
  {/* isolate 유틸리티 클래스 */}
</div>`
