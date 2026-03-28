import { useState } from 'react'
import { Panel } from '~/@lib/ui/common/panel'

export function PracticalPatterns() {
  return (
    <div>
      <h3 className="mb-3 text-base font-semibold text-gray-800">8. 실전 패턴: z-index 계층 설계</h3>
      <p className="mb-4 text-sm text-gray-600">
        대규모 프로젝트에서 z-index 충돌을 방지하는 아키텍처 패턴입니다.
        계층을 미리 정의하고, 각 레이어를 독립적인 SC로 격리합니다.
      </p>

      <div className="space-y-6">
        <Panel
          variant="solution"
          label="Pattern"
          tag="z-index 토큰 시스템 + SC 격리"
          data={{
            description:
              'CSS Custom Properties로 z-index 계층을 정의하고, isolation: isolate로 각 영역을 격리합니다. 컴포넌트 내부 z-index가 외부에 누출되지 않아 충돌이 원천 차단됩니다.',
            demo: <PracticalPatternsDemo />,
            code: PRACTICAL_CODE,
          }}
        />

        <Panel
          variant="solution"
          label="Checklist"
          tag="Stacking Context 디버깅 체크리스트"
          data={{
            description:
              'z-index가 안 먹힐 때 따라가는 디버깅 순서입니다.',
            demo: <DebuggingChecklist />,
            code: DEBUGGING_CODE,
          }}
        />
      </div>
    </div>
  )
}

function PracticalPatternsDemo() {
  const [activeLayer, setActiveLayer] = useState<string | null>(null)

  const layers = [
    { name: 'base', zIndex: 0, color: 'bg-gray-200', label: 'Base Content', items: ['카드', '리스트', '폼'] },
    { name: 'dropdown', zIndex: 100, color: 'bg-blue-200', label: 'Dropdown / Popover', items: ['셀렉트 메뉴', '자동완성', '툴팁'] },
    { name: 'sticky', zIndex: 200, color: 'bg-cyan-200', label: 'Sticky / Fixed', items: ['헤더', 'FAB', '사이드바'] },
    { name: 'overlay', zIndex: 300, color: 'bg-purple-200', label: 'Overlay / Backdrop', items: ['딤 배경', '슬라이드 오버'] },
    { name: 'modal', zIndex: 400, color: 'bg-pink-200', label: 'Modal / Dialog', items: ['컨펌 다이얼로그', '바텀시트'] },
    { name: 'popover', zIndex: 500, color: 'bg-orange-200', label: 'Popover (Modal 위)', items: ['날짜선택기', '컬러피커'] },
    { name: 'toast', zIndex: 600, color: 'bg-red-200', label: 'Toast / Notification', items: ['성공 알림', '에러 알림'] },
  ]

  return (
    <div className="space-y-4">
      {/* Layer diagram */}
      <div className="relative">
        <div className="space-y-1">
          {[...layers].reverse().map((layer) => (
            <button
              key={layer.name}
              onClick={() => setActiveLayer(activeLayer === layer.name ? null : layer.name)}
              className={`flex w-full items-center gap-3 rounded-md border px-3 py-2 text-left text-xs transition-all ${
                activeLayer === layer.name
                  ? 'border-gray-400 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`h-6 w-6 rounded ${layer.color} flex items-center justify-center`}>
                <span className="font-mono text-[10px] font-bold text-gray-700">{layer.zIndex}</span>
              </div>
              <div className="flex-1">
                <span className="font-medium text-gray-700">{layer.label}</span>
                <span className="ml-2 font-mono text-[10px] text-gray-400">--z-{layer.name}: {layer.zIndex}</span>
              </div>
              <div className="flex gap-1">
                {layer.items.map((item) => (
                  <span key={item} className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">
                    {item}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Live stacking visualization */}
      <div className="relative h-56 overflow-hidden rounded-lg border border-gray-200 bg-white">
        {/* Base content */}
        <div className="absolute inset-0 p-3" style={{ zIndex: 0 }}>
          <div className="space-y-2">
            <div className="rounded bg-gray-100 p-2 text-xs text-gray-500">Card Component</div>
            <div className="rounded bg-gray-100 p-2 text-xs text-gray-500">List Component</div>
          </div>
        </div>

        {/* Dropdown */}
        {(activeLayer === 'dropdown' || activeLayer === null) && (
          <div
            className="absolute left-4 top-10 w-32 rounded-md border border-blue-300 bg-blue-50 p-2 shadow-md"
            style={{ zIndex: 100 }}
          >
            <p className="text-[10px] font-medium text-blue-700">Dropdown (100)</p>
          </div>
        )}

        {/* Sticky header */}
        {(activeLayer === 'sticky' || activeLayer === null) && (
          <div
            className="absolute left-0 right-0 top-0 border-b border-cyan-300 bg-cyan-50/90 px-3 py-2 backdrop-blur-sm"
            style={{ zIndex: 200 }}
          >
            <p className="text-[10px] font-medium text-cyan-700">Sticky Header (200)</p>
          </div>
        )}

        {/* Overlay */}
        {(activeLayer === 'overlay' || activeLayer === 'modal') && (
          <div
            className="absolute inset-0 bg-black/20"
            style={{ zIndex: 300 }}
          />
        )}

        {/* Modal */}
        {activeLayer === 'modal' && (
          <div
            className="absolute inset-x-12 top-12 bottom-12 rounded-lg border border-pink-300 bg-pink-50 p-3 shadow-xl"
            style={{ zIndex: 400 }}
          >
            <p className="text-xs font-medium text-pink-700">Modal Dialog (400)</p>
          </div>
        )}

        {/* Toast */}
        {(activeLayer === 'toast' || activeLayer === null) && (
          <div
            className="absolute bottom-3 right-3 rounded-lg border border-red-300 bg-red-50 px-3 py-2 shadow-lg"
            style={{ zIndex: 600 }}
          >
            <p className="text-[10px] font-medium text-red-700">Toast (600) — 항상 최상위</p>
          </div>
        )}

        {!activeLayer && (
          <div className="absolute bottom-3 left-3 text-[10px] text-gray-400">
            위 레이어를 클릭하여 개별 확인
          </div>
        )}
      </div>
    </div>
  )
}

function DebuggingChecklist() {
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set())

  const toggleItem = (index: number) => {
    setCheckedItems((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  const steps = [
    {
      title: '1. position 확인',
      detail: 'z-index는 positioned 요소(relative, absolute, fixed, sticky) 또는 flex/grid 자식에만 작동합니다.',
    },
    {
      title: '2. 부모 SC 경계 확인',
      detail: '대상 요소에서 위로 올라가며 SC를 만드는 속성을 가진 조상을 찾습니다. 그 조상이 z-index의 천장입니다.',
    },
    {
      title: '3. 비교 대상 찾기',
      detail: '겹치는 두 요소의 가장 가까운 공통 SC 조상을 찾고, 그 SC 안에서 직계 자식들의 z-index를 비교합니다.',
    },
    {
      title: '4. 숨겨진 SC 생성자 스캔',
      detail: 'opacity < 1, transform, filter, will-change, backdrop-filter, contain, container-type 확인.',
    },
    {
      title: '5. Chrome DevTools Layers 패널',
      detail: 'More tools → Layers에서 SC 경계를 시각적으로 확인합니다.',
    },
    {
      title: '6. 해결책 선택',
      detail: 'Portal 이동, 불필요한 SC 제거, isolation: isolate 적용, z-index 토큰 시스템 도입 중 선택.',
    },
  ]

  return (
    <div className="space-y-2">
      {steps.map((step, i) => (
        <button
          key={step.title}
          onClick={() => toggleItem(i)}
          className={`flex w-full items-start gap-3 rounded-md border px-3 py-2 text-left transition-colors ${
            checkedItems.has(i)
              ? 'border-green-300 bg-green-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <div
            className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] ${
              checkedItems.has(i)
                ? 'border-green-500 bg-green-500 text-white'
                : 'border-gray-300'
            }`}
          >
            {checkedItems.has(i) && '✓'}
          </div>
          <div>
            <p className="text-xs font-medium text-gray-700">{step.title}</p>
            <p className="text-[10px] text-gray-500">{step.detail}</p>
          </div>
        </button>
      ))}
    </div>
  )
}

const PRACTICAL_CODE = `/* ===== z-index 토큰 시스템 ===== */

:root {
  /* 계층별 z-index 토큰 (100 단위 간격) */
  --z-base: 0;
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-overlay: 300;
  --z-modal: 400;
  --z-popover: 500;
  --z-toast: 600;
}

/* Tailwind CSS 설정 */
// tailwind.config.js
module.exports = {
  theme: {
    zIndex: {
      base: '0',
      dropdown: '100',
      sticky: '200',
      overlay: '300',
      modal: '400',
      popover: '500',
      toast: '600',
    },
  },
}

/* ===== 컴포넌트 SC 격리 패턴 ===== */

/* 패턴: 각 레이어를 isolation으로 격리 */
.app-layout {
  isolation: isolate; /* 앱 전체 SC */
}

.header {
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  isolation: isolate; /* 헤더 내부 z-index 격리 */
}

.modal-root {
  position: fixed;
  z-index: var(--z-modal);
  isolation: isolate; /* 모달 내부 z-index 격리 */
}

.toast-container {
  position: fixed;
  z-index: var(--z-toast);
  /* 항상 최상위 — 모달 위에도 표시 */
}

/* ===== React 컴포넌트 패턴 ===== */

// Portal 기반 레이어 컴포넌트
function Layer({ level, children }) {
  return createPortal(
    <div style={{
      position: 'fixed',
      zIndex: Z_INDEX[level],
      isolation: 'isolate',
    }}>
      {children}
    </div>,
    document.getElementById('layer-root')
  )
}

// 사용
<Layer level="modal">
  <Dialog />
</Layer>
<Layer level="toast">
  <Toast />
</Layer>`

const DEBUGGING_CODE = `/* ===== Stacking Context 디버깅 체크리스트 ===== */

/*
 * z-index가 안 먹힐 때 따라가는 순서:
 *
 * □ Step 1: position 확인
 *   → z-index는 positioned 요소 또는 flex/grid 자식에만 작동
 *   → position: static이면 z-index 무시됨
 *
 * □ Step 2: 부모 SC 경계 확인
 *   → 대상에서 위로 올라가며 SC를 만드는 조상 찾기
 *   → 그 조상의 z-index가 자식의 천장
 *
 * □ Step 3: 비교 대상의 공통 SC 찾기
 *   → 겹치는 두 요소의 가장 가까운 공통 SC 조상 찾기
 *   → 그 SC 안에서 직계 자식의 z-index 비교
 *
 * □ Step 4: 숨겨진 SC 생성자 스캔
 *   → opacity < 1
 *   → transform (translateZ(0) 포함)
 *   → filter, backdrop-filter
 *   → will-change
 *   → contain: paint/layout/strict
 *   → container-type
 *   → mix-blend-mode
 *   → clip-path, mask
 *
 * □ Step 5: DevTools로 확인
 *   → Elements → Computed → z-index
 *   → More tools → Layers (3D 시각화)
 *   → Performance → Layer tree
 *
 * □ Step 6: 해결책 적용
 *   → Portal로 DOM 위치 이동
 *   → 불필요한 SC 제거 (z-index/transform 제거)
 *   → isolation: isolate 적용
 *   → z-index 토큰 시스템 도입
 */

/* ===== Quick DevTools 명령어 ===== */

// Console에서 특정 요소의 SC 조상 찾기
function findStackingContexts(element) {
  const contexts = [];
  let el = element;
  while (el && el !== document.documentElement) {
    const style = getComputedStyle(el);
    const isRoot = el === document.documentElement;
    const hasZIndex = style.zIndex !== 'auto' &&
      style.position !== 'static';
    const hasOpacity = parseFloat(style.opacity) < 1;
    const hasTransform = style.transform !== 'none';
    const hasFilter = style.filter !== 'none';
    const hasIsolation = style.isolation === 'isolate';
    const hasWillChange = style.willChange === 'transform'
      || style.willChange === 'opacity';

    if (isRoot || hasZIndex || hasOpacity || hasTransform
        || hasFilter || hasIsolation || hasWillChange) {
      contexts.push({
        element: el,
        reason: [
          isRoot && 'root',
          hasZIndex && \`z-index: \${style.zIndex}\`,
          hasOpacity && \`opacity: \${style.opacity}\`,
          hasTransform && 'transform',
          hasFilter && 'filter',
          hasIsolation && 'isolation',
          hasWillChange && \`will-change: \${style.willChange}\`,
        ].filter(Boolean).join(', '),
      });
    }
    el = el.parentElement;
  }
  console.table(contexts);
  return contexts;
}

// 사용법: DevTools Console에서
// findStackingContexts(document.querySelector('.my-element'))`
