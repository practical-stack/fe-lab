import { Panel } from '~/@lib/ui/common/panel'

export function DefaultStackingOrder() {
  return (
    <div>
      <h3 className="mb-3 text-base font-semibold text-gray-800">1. 기본 쌓임 순서 (Default Stacking Order)</h3>
      <p className="mb-4 text-sm text-gray-600">
        z-index를 지정하지 않아도 브라우저는 정해진 규칙에 따라 요소를 쌓습니다. 아래에서 위로 7단계 순서를 가집니다.
      </p>

      <Panel
        variant="solution"
        label="Concept"
        tag="7-Layer Stacking Order"
        data={{
          description:
            '같은 Stacking Context 내에서 요소는 아래 순서대로 뒤에서 앞으로 쌓입니다. z-index가 같으면 HTML 소스 순서(나중에 등장한 요소가 위)로 결정됩니다.',
          demo: <DefaultStackingOrderDemo />,
          code: DEFAULT_ORDER_CODE,
        }}
      />
    </div>
  )
}

function DefaultStackingOrderDemo() {
  return (
    <div className="space-y-6">
      {/* 7-layer diagram */}
      <div className="flex flex-col items-center gap-1">
        {LAYERS.map((layer, i) => (
          <div
            key={layer.label}
            className="flex w-full max-w-lg items-center gap-3 rounded-md border px-4 py-2 text-sm"
            style={{ backgroundColor: layer.color, borderColor: layer.border }}
          >
            <span className="w-6 font-mono font-bold text-gray-500">{LAYERS.length - i}</span>
            <span className="font-medium text-gray-800">{layer.label}</span>
            <span className="ml-auto text-xs text-gray-500">{layer.desc}</span>
          </div>
        ))}
        <div className="mt-1 text-xs text-gray-400">← 화면 뒤쪽 (사용자에서 먼) ─────── 화면 앞쪽 (사용자에 가까움) →</div>
      </div>

      {/* Live demo — cards cascade diagonally from top-left to bottom-right */}
      <div
        className="relative mx-auto w-full max-w-lg rounded-lg border border-gray-200 bg-amber-50"
        style={{ isolation: 'isolate' as React.CSSProperties['isolation'], height: 280 }}
      >
        <p className="p-2 text-xs font-medium text-gray-400">
          라이브 데모 — 뒤(①)에서 앞(⑦)으로 순서대로 겹침
        </p>
        <span className="absolute bottom-1 left-2 text-[9px] text-amber-400">① 이 노란 배경 = SC의 background/border (가장 뒤)</span>

        {DEMO_LAYERS.map((layer, i) => (
          <div
            key={layer.label}
            className={`absolute flex h-16 w-44 items-center gap-2 rounded-lg border-2 shadow-sm ${layer.className}`}
            style={{
              left: 12 + i * 36,
              top: 32 + i * 30,
              position: 'absolute',
              zIndex: layer.zIndex,
            }}
          >
            <span className="flex h-full w-8 shrink-0 items-center justify-center rounded-l-md bg-black/5 text-sm font-bold text-gray-500">
              {layer.num}
            </span>
            <div className="min-w-0 pr-2">
              <p className="text-[11px] font-bold" style={{ color: layer.labelColor }}>{layer.label}</p>
              <p className="text-[9px] text-gray-500">{layer.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const DEMO_LAYERS = [
  { num: '②', label: 'z-index: -1', desc: '배경 위, block 아래', zIndex: -1, className: 'border-red-400 bg-red-200/70 backdrop-blur-sm', labelColor: '#b91c1c' },
  { num: '③', label: 'block 요소', desc: 'non-positioned div, p', zIndex: 'auto' as const, className: 'border-blue-400 bg-blue-200/70 backdrop-blur-sm', labelColor: '#1d4ed8' },
  { num: '④', label: 'float 요소', desc: 'float: left / right', zIndex: 'auto' as const, className: 'border-purple-400 bg-purple-200/70 backdrop-blur-sm', labelColor: '#7e22ce' },
  { num: '⑤', label: 'inline 요소', desc: 'text, span, inline-block', zIndex: 'auto' as const, className: 'border-green-400 bg-green-200/70 backdrop-blur-sm', labelColor: '#15803d' },
  { num: '⑥', label: 'z-index: 0', desc: 'positioned + z-index: 0', zIndex: 0, className: 'border-cyan-400 bg-cyan-200/70 backdrop-blur-sm', labelColor: '#0e7490' },
  { num: '⑦', label: 'z-index: 1+', desc: 'positioned + 양수 z-index', zIndex: 1, className: 'border-pink-500 bg-pink-300/70 backdrop-blur-sm shadow-md', labelColor: '#be185d' },
]

const LAYERS = [
  { label: '⑦ positive z-index', desc: 'z-index: 1, 2, 3, ...', color: '#fce7f3', border: '#f9a8d4' },
  { label: '⑥ z-index: 0 / auto (positioned)', desc: 'position: relative/absolute + z-index: 0', color: '#cffafe', border: '#67e8f9' },
  { label: '⑤ inline / inline-block', desc: 'text, <span>, inline 요소', color: '#dcfce7', border: '#86efac' },
  { label: '④ float', desc: 'float: left / right', color: '#f3e8ff', border: '#c084fc' },
  { label: '③ block (non-positioned)', desc: 'div, p 등 block 요소', color: '#dbeafe', border: '#93c5fd' },
  { label: '② negative z-index', desc: 'z-index: -1, -2, ...', color: '#fee2e2', border: '#fca5a5' },
  { label: '① background / borders', desc: '현재 stacking context의 배경과 테두리', color: '#fef3c7', border: '#fcd34d' },
]

const DEFAULT_ORDER_CODE = `/* CSS Stacking Order (뒤 → 앞, 같은 stacking context 내) */

/*
 * ① 현재 stacking context의 background / border
 * ② z-index가 음수인 positioned 요소 (z-index: -1)
 * ③ non-positioned block 요소 (div, p 등)
 * ④ float 요소
 * ⑤ inline / inline-block 요소 (text, span)
 * ⑥ z-index: 0 또는 auto인 positioned 요소
 * ⑦ z-index가 양수인 positioned 요소 (z-index: 1, 2, ...)
 */

/* 핵심 포인트:
 * - z-index는 positioned 요소(relative, absolute, fixed, sticky)에만 작동
 * - z-index가 같으면 HTML 소스 순서가 뒤인 요소가 위에 표시
 * - inline 요소가 float보다 위에 있다! (텍스트가 float 위에 보이는 이유)
 */

/* 예시: z-index 없이도 inline이 block 위에 표시됨 */
.block-element {
  /* ③번 레이어 */
  display: block;
  background: lightblue;
}

.inline-element {
  /* ⑤번 레이어 — block보다 위 */
  display: inline;
  background: lightgreen;
}`
