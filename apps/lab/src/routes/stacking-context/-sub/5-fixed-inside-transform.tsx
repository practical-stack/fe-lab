import { useState } from 'react'
import { Panel } from '~/@lib/ui/common/panel'

export function FixedInsideTransform() {
  return (
    <div>
      <h3 className="mb-3 text-base font-semibold text-gray-800">5. position: fixed가 깨지는 경우</h3>
      <p className="mb-4 text-sm text-gray-600">
        transform, filter, perspective를 가진 조상이 있으면 position: fixed가 viewport 기준이 아닌 해당 조상 기준으로 동작합니다.
        이것은 Stacking Context의 또 다른 부작용입니다.
      </p>

      <div className="space-y-6">
        <Panel
          variant="problem"
          label="Problem"
          tag="transform 안의 position: fixed"
          data={{
            description:
              '부모에 transform이 있으면 자식의 position: fixed가 viewport가 아닌 부모 기준으로 변합니다. Modal, Toast 등 fixed 요소가 의도치 않게 부모 안에 갇히는 원인입니다.',
            demo: <FixedInsideTransformDemo />,
            code: FIXED_TRANSFORM_CODE,
          }}
        />
      </div>
    </div>
  )
}

function FixedInsideTransformDemo() {
  const [hasTransform, setHasTransform] = useState(false)
  const [hasFilter, setHasFilter] = useState(false)

  const parentStyle: React.CSSProperties = {
    ...(hasTransform ? { transform: 'translateX(0)' } : {}),
    ...(hasFilter ? { filter: 'blur(0px)' } : {}),
  }

  const isContained = hasTransform || hasFilter

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={hasTransform}
            onChange={(e) => setHasTransform(e.target.checked)}
            className="rounded"
          />
          <span className="text-gray-600">
            부모에 <span className="font-mono">transform: translateX(0)</span>
          </span>
        </label>
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={hasFilter}
            onChange={(e) => setHasFilter(e.target.checked)}
            className="rounded"
          />
          <span className="text-gray-600">
            부모에 <span className="font-mono">filter: blur(0px)</span>
          </span>
        </label>
      </div>

      {/* Demo container simulating viewport */}
      <div className="relative h-56 overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
        <p className="p-2 text-[10px] text-gray-400">시뮬레이션 viewport</p>

        {/* Scrollable parent with optional transform */}
        <div
          className={`mx-4 h-40 overflow-auto rounded-lg border-2 p-3 transition-all ${
            isContained ? 'border-red-400 bg-red-50/50' : 'border-gray-300 bg-white'
          }`}
          style={parentStyle}
        >
          <p className="text-xs font-medium text-gray-600">
            Scrollable Parent
          </p>
          <p className="font-mono text-[10px] text-gray-400">
            {hasTransform && 'transform: translateX(0); '}
            {hasFilter && 'filter: blur(0px); '}
            {!isContained && '(특별한 속성 없음)'}
          </p>
          {isContained && (
            <p className="mt-1 text-[10px] text-red-500">
              ⚠️ Containing Block이 됨 → fixed가 이 요소 기준!
            </p>
          )}

          {/* Long content for scrolling */}
          <div className="mt-3 space-y-2">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="rounded bg-gray-100 px-2 py-1 text-[10px] text-gray-500">
                콘텐츠 항목 {i + 1}
              </div>
            ))}
          </div>

          {/* Fixed element */}
          <div
            className="rounded-lg border-2 border-blue-400 bg-blue-100 p-2 shadow-lg"
            style={{
              position: 'fixed',
              bottom: isContained ? 8 : undefined,
              right: 8,
              top: isContained ? undefined : 8,
              width: 'fit-content',
            }}
          >
            <p className="text-[10px] font-bold text-blue-700">Fixed Element</p>
            <p className="font-mono text-[10px] text-blue-500">position: fixed</p>
            <p className="text-[10px] text-blue-600">
              {isContained
                ? '😱 부모 안에 갇힘! 스크롤하면 같이 움직임'
                : '✅ viewport 기준으로 고정됨'}
            </p>
          </div>
        </div>

        {/* Explanation */}
        <div className="absolute bottom-1 left-2 right-2">
          <div
            className={`rounded px-3 py-1.5 text-center text-xs font-medium ${
              isContained
                ? 'bg-red-100 text-red-700'
                : 'bg-green-100 text-green-700'
            }`}
          >
            {isContained
              ? 'fixed의 Containing Block = 부모 → viewport 기준이 아님!'
              : 'fixed의 Containing Block = viewport → 정상 동작'}
          </div>
        </div>
      </div>

      {/* Containing Block rule summary */}
      <div className="rounded-lg border border-gray-200 bg-white p-3">
        <p className="mb-2 text-xs font-medium text-gray-700">Containing Block을 바꾸는 속성:</p>
        <div className="grid grid-cols-2 gap-1.5 text-[10px]">
          {[
            { prop: 'transform', desc: '어떤 값이든 (none 제외)' },
            { prop: 'filter', desc: '어떤 값이든 (none 제외)' },
            { prop: 'backdrop-filter', desc: '어떤 값이든 (none 제외)' },
            { prop: 'perspective', desc: '어떤 값이든 (none 제외)' },
            { prop: 'will-change', desc: 'transform/filter 등 지정 시' },
            { prop: 'contain: paint', desc: 'paint 포함 시' },
          ].map(({ prop, desc }) => (
            <div key={prop} className="flex items-center gap-2 rounded bg-gray-50 px-2 py-1">
              <span className="font-mono font-medium text-gray-700">{prop}</span>
              <span className="text-gray-400">{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const FIXED_TRANSFORM_CODE = `/* ❌ transform이 있는 조상 안의 position: fixed */

.parent {
  transform: translateX(0);  /* 시각적 변화 없지만... */
  /* → 이 요소가 fixed 자식의 "Containing Block"이 됨 */
  /* → fixed가 viewport가 아닌 이 요소 기준으로 동작! */
}

.parent .toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  /* 의도: viewport 우하단에 고정
   * 실제: .parent 우하단에 고정되고, 스크롤하면 같이 움직임! */
}

/* ===== CSS 스펙 (Containing Block 규칙) ===== */
/*
 * position: fixed의 Containing Block은 기본적으로 viewport.
 * 하지만 조상 중 아래 속성을 가진 요소가 있으면
 * 해당 조상이 Containing Block이 됨:
 *
 * - transform (none 아닌 값)
 * - filter (none 아닌 값)
 * - backdrop-filter (none 아닌 값)
 * - perspective (none 아닌 값)
 * - will-change (위 속성 중 하나 지정)
 * - contain: paint
 *
 * 이것은 Stacking Context 생성과는 별개의 규칙이지만,
 * 같은 속성들이 두 가지 부작용을 동시에 일으킴.
 */

/* ✅ 해결: Portal로 DOM 트리 탈출 */
// React
function Toast({ message }) {
  return createPortal(
    <div className="fixed bottom-5 right-5">
      {message}
    </div>,
    document.body  // transform 조상 밖으로 탈출
  )
}`
