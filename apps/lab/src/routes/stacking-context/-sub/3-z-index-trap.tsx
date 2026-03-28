import { useState } from 'react'
import { Panel } from '~/@lib/ui/common/panel'

export function ZIndexTrap() {
  return (
    <div>
      <h3 className="mb-3 text-base font-semibold text-gray-800">3. z-index: 9999가 안 먹히는 이유</h3>
      <p className="mb-4 text-sm text-gray-600">
        z-index는 같은 Stacking Context 안에서만 비교됩니다.
        서로 다른 SC에 속한 요소끼리는 z-index 값이 아무리 커도 부모 SC의 순서를 넘을 수 없습니다.
      </p>

      <div className="space-y-6">
        <Panel
          variant="problem"
          label="Problem"
          tag="z-index 전쟁 — 숫자를 아무리 올려도 안 됨"
          data={{
            description:
              'Sidebar(z-index: 10) 안의 Dropdown에 z-index: 9999를 줘도 Main Content의 Modal(z-index: 20) 아래에 표시됩니다. 부모인 Sidebar의 z-index: 10이 천장이 되기 때문입니다.',
            demo: <ZIndexProblemDemo />,
            code: PROBLEM_CODE,
          }}
        />

        <Panel
          variant="solution"
          label="Solution"
          tag="Stacking Context 경계 이해하기"
          data={{
            description:
              'Dropdown을 Sidebar 바깥(Portal)으로 옮기거나, Sidebar의 z-index를 제거하여 같은 SC에서 비교되게 합니다. 핵심은 "비교 대상이 같은 SC에 있는가"입니다.',
            demo: <ZIndexSolutionDemo />,
            code: SOLUTION_CODE,
          }}
        />
      </div>
    </div>
  )
}

function ZIndexProblemDemo() {
  const [showDropdown, setShowDropdown] = useState(false)
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="rounded bg-blue-500 px-3 py-1 text-xs text-white hover:bg-blue-600"
        >
          {showDropdown ? 'Dropdown 닫기' : 'Dropdown 열기'}
        </button>
        <button
          onClick={() => setShowModal(!showModal)}
          className="rounded bg-purple-500 px-3 py-1 text-xs text-white hover:bg-purple-600"
        >
          {showModal ? 'Modal 닫기' : 'Modal 열기'}
        </button>
      </div>

      <div className="relative h-48 overflow-visible rounded-lg border border-gray-200 bg-gray-50">
        {/* Sidebar — z-index: 10, creates stacking context */}
        <div
          className="absolute left-0 top-0 h-full w-36 rounded-l-lg border-r border-gray-300 bg-slate-100 p-2"
          style={{ position: 'absolute', zIndex: 10 }}
        >
          <p className="text-[10px] font-bold text-slate-600">Sidebar</p>
          <p className="font-mono text-[10px] text-slate-400">z-index: 10</p>
          <p className="mt-1 text-[10px] text-orange-500">← SC 경계</p>

          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="mt-2 w-full rounded bg-slate-200 px-2 py-1 text-left text-[10px] text-slate-600"
          >
            메뉴 ▾
          </button>

          {showDropdown && (
            <div
              className="absolute left-2 top-24 w-40 rounded-md border border-blue-300 bg-blue-50 p-2 shadow-lg"
              style={{ position: 'absolute', zIndex: 9999 }}
            >
              <p className="text-[10px] font-bold text-blue-700">Dropdown</p>
              <p className="font-mono text-[10px] text-blue-500">z-index: 9999</p>
              <p className="mt-1 text-[10px] text-red-500">😱 9999인데 Modal 뒤에!</p>
              <div className="mt-1 space-y-1">
                {['항목 1', '항목 2', '항목 3'].map((item) => (
                  <div key={item} className="rounded bg-blue-100 px-2 py-0.5 text-[10px] text-blue-700">{item}</div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main content area */}
        <div className="ml-36 p-3">
          <p className="text-xs text-gray-500">Main Content</p>

          {showModal && (
            <div
              className="absolute inset-x-32 top-6 bottom-6 rounded-lg border-2 border-purple-400 bg-purple-50 p-3 shadow-xl"
              style={{ position: 'absolute', zIndex: 20 }}
            >
              <p className="text-xs font-bold text-purple-700">Modal Overlay</p>
              <p className="font-mono text-[10px] text-purple-500">z-index: 20</p>
              <p className="mt-2 text-[10px] text-purple-600">
                20 {'<'} 9999 인데도 Dropdown 위에 표시됨!
              </p>
              <p className="mt-1 text-[10px] text-gray-500">
                이유: Dropdown의 부모(Sidebar)가 z-index: 10으로 SC를 만들었고,
                Modal의 z-index: 20과 Sidebar의 z-index: 10이 비교됨
              </p>
            </div>
          )}
        </div>

        {/* Comparison diagram */}
        <div className="absolute bottom-1 right-2 rounded bg-white/90 px-2 py-1 text-[10px] text-gray-500">
          비교: Sidebar(10) vs Modal(20) → Modal 승
        </div>
      </div>
    </div>
  )
}

function ZIndexSolutionDemo() {
  const [showDropdown, setShowDropdown] = useState(false)
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="rounded bg-blue-500 px-3 py-1 text-xs text-white hover:bg-blue-600"
        >
          {showDropdown ? 'Dropdown 닫기' : 'Dropdown 열기'}
        </button>
        <button
          onClick={() => setShowModal(!showModal)}
          className="rounded bg-purple-500 px-3 py-1 text-xs text-white hover:bg-purple-600"
        >
          {showModal ? 'Modal 닫기' : 'Modal 열기'}
        </button>
      </div>

      <div className="relative h-48 overflow-visible rounded-lg border border-gray-200 bg-gray-50">
        {/* Sidebar — NO z-index, no stacking context */}
        <div className="absolute left-0 top-0 h-full w-36 rounded-l-lg border-r border-gray-300 bg-slate-100 p-2">
          <p className="text-[10px] font-bold text-slate-600">Sidebar</p>
          <p className="font-mono text-[10px] text-green-600">z-index: 제거!</p>
          <p className="mt-1 text-[10px] text-green-500">← SC 없음</p>

          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="mt-2 w-full rounded bg-slate-200 px-2 py-1 text-left text-[10px] text-slate-600"
          >
            메뉴 ▾
          </button>
        </div>

        {/* Dropdown — now at root SC level (Portal 시뮬레이션) */}
        {showDropdown && (
          <div
            className="absolute left-2 top-28 w-40 rounded-md border border-blue-300 bg-blue-50 p-2 shadow-lg"
            style={{ position: 'absolute', zIndex: 9999 }}
          >
            <p className="text-[10px] font-bold text-blue-700">Dropdown (Portal)</p>
            <p className="font-mono text-[10px] text-blue-500">z-index: 9999</p>
            <p className="mt-1 text-[10px] text-green-600">✅ Modal 위에 정상 표시!</p>
            <div className="mt-1 space-y-1">
              {['항목 1', '항목 2', '항목 3'].map((item) => (
                <div key={item} className="rounded bg-blue-100 px-2 py-0.5 text-[10px] text-blue-700">{item}</div>
              ))}
            </div>
          </div>
        )}

        {/* Main content area */}
        <div className="ml-36 p-3">
          <p className="text-xs text-gray-500">Main Content</p>

          {showModal && (
            <div
              className="absolute inset-x-32 top-6 bottom-6 rounded-lg border-2 border-purple-400 bg-purple-50 p-3 shadow-xl"
              style={{ position: 'absolute', zIndex: 20 }}
            >
              <p className="text-xs font-bold text-purple-700">Modal Overlay</p>
              <p className="font-mono text-[10px] text-purple-500">z-index: 20</p>
              <p className="mt-2 text-[10px] text-green-600">
                이제 Dropdown(9999)과 같은 root SC에서 비교됨
              </p>
            </div>
          )}
        </div>

        <div className="absolute bottom-1 right-2 rounded bg-white/90 px-2 py-1 text-[10px] text-gray-500">
          비교: Dropdown(9999) vs Modal(20) → Dropdown 승 ✅
        </div>
      </div>
    </div>
  )
}

const PROBLEM_CODE = `/* ❌ z-index 전쟁 — 숫자를 올려도 해결 안 됨 */

.sidebar {
  position: relative;
  z-index: 10;           /* ← SC 생성! 자식의 천장이 됨 */
}

.sidebar .dropdown {
  position: absolute;
  z-index: 9999;         /* 부모 SC(10) 안에 갇힘 → 무의미 */
}

.modal {
  position: fixed;
  z-index: 20;           /* root SC에서 Sidebar(10)과 비교 → 20 > 10 → Modal 승 */
}

/*
 * 비교 구조 (자세한 규칙은 섹션 2 참고):
 *
 * root SC
 * ├── Sidebar (z-index: 10) ← SC
 * │   └── Dropdown (z-index: 9999) ← 부모(10) 안에서만 유효
 * └── Modal (z-index: 20) ← root SC에서 Sidebar(10)과 비교 → 20 승
 *
 * 결과: Modal(20) > Sidebar(10) → Dropdown은 아무리 커도 Modal 아래
 */`

const SOLUTION_CODE = `/* ✅ 해결 방법 1: Portal로 DOM 위치 이동 */

// React Portal — Dropdown을 document.body에 렌더링
function Dropdown({ anchorRef, children }) {
  return createPortal(
    <div style={{ position: 'absolute', zIndex: 9999 }}>
      {children}
    </div>,
    document.body  // root SC에 직접 배치
  )
}

/* ✅ 해결 방법 2: 부모의 z-index 제거 */

.sidebar {
  position: relative;
  /* z-index 제거 → SC를 만들지 않음 */
  /* 자식 Dropdown이 root SC에서 직접 비교됨 */
}

/* ✅ 해결 방법 3: z-index 계층 설계 */

:root {
  --z-base: 0;
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-overlay: 300;
  --z-modal: 400;
  --z-popover: 500;
  --z-toast: 600;
}

/*
 * 핵심 원칙:
 * 1. 불필요한 SC를 만들지 않는다
 * 2. SC가 필요하면 z-index 계층을 미리 설계한다
 * 3. Portal을 활용하여 SC 탈출한다
 */`
