import { useState } from 'react'
import { Panel } from '~/@lib/ui/common/panel'

export function WhatCreatesStackingContext() {
  return (
    <div>
      <h3 className="mb-3 text-base font-semibold text-gray-800">2. Stacking Context를 만드는 조건</h3>
      <p className="mb-4 text-sm text-gray-600">
        아래 조건 중 하나라도 만족하면 해당 요소는 새로운 Stacking Context를 생성합니다.
        자식 요소의 z-index는 이 Context 안에서만 유효합니다.
      </p>

      <div className="mb-6 space-y-4">
        {/* SC 개념 설명 */}
        <Panel
          variant="solution"
          label="Concept"
          tag="Stacking Context란?"
          data={{
            description:
              'Stacking Context(SC)는 z축 방향으로 요소들이 쌓이는 독립적인 공간입니다. 새로운 SC가 생기면 그 안의 z-index는 외부와 완전히 격리됩니다.',
            demo: <SCConceptDiagram />,
            code: SC_CONCEPT_CODE,
          }}
        />
      </div>

      <Panel
        variant="solution"
        label="Reference"
        tag="Stacking Context 생성 조건 체크리스트"
        data={{
          description:
            '토글을 켜서 각 속성이 실제로 새 Stacking Context를 만드는지 확인하세요. 파란 박스(z-index: 999)가 빨간 박스 위에 올라오지 못하면 부모가 새 Stacking Context를 만든 것입니다.',
          demo: <WhatCreatesDemo />,
          code: CREATES_SC_CODE,
        }}
      />
    </div>
  )
}

function SCConceptDiagram() {
  return (
    <div className="space-y-6">
      {/* SC 없는 경우 vs SC 있는 경우 비교 */}
      <div className="grid grid-cols-2 gap-6">
        {/* SC 없음 */}
        <div>
          <p className="mb-2 text-xs font-semibold text-green-700">SC 없음 — 같은 평면에서 비교</p>

          {/* DOM 구조 표시 */}
          <div className="mb-2 rounded-md bg-gray-50 p-2 font-mono text-[10px] text-gray-600">
            <p>&lt;div&gt; <span className="text-gray-400">{'// root'}</span></p>
            <p>&nbsp; &lt;div class="<span className="text-gray-500">parent</span>"&gt; <span className="text-gray-400">{'// SC 없음'}</span></p>
            <p>&nbsp;&nbsp;&nbsp; &lt;div class="<span className="text-blue-600">child</span>" z-index: 999&gt;</p>
            <p>&nbsp; &lt;/div&gt;</p>
            <p>&nbsp; &lt;div class="<span className="text-red-600">sibling</span>" z-index: 5&gt;</p>
            <p>&lt;/div&gt;</p>
          </div>

          <div className="relative h-40 rounded-lg border-2 border-dashed border-green-300 bg-green-50/30 p-2" style={{ isolation: 'isolate' as React.CSSProperties['isolation'] }}>
            <p className="text-[9px] text-green-400">root SC</p>

            {/* Parent — no SC */}
            <div className="absolute left-3 top-7 h-14 w-20 rounded border-2 border-gray-300 bg-white/70 p-1">
              <p className="text-[9px] text-gray-500">.parent</p>
              <p className="text-[8px] text-gray-400">SC 없음</p>
            </div>

            {/* .child — z:999 */}
            <div
              className="absolute left-6 top-14 flex h-11 w-26 items-center justify-center rounded-lg border-2 border-blue-400 bg-blue-200/80 shadow-sm"
              style={{ position: 'absolute', zIndex: 999 }}
            >
              <div className="text-center">
                <p className="text-[10px] font-bold text-blue-700">.child</p>
                <p className="font-mono text-[8px] text-blue-500">z: 999</p>
              </div>
            </div>

            {/* .sibling — z:5, 겹침 */}
            <div
              className="absolute left-20 top-11 flex h-11 w-26 items-center justify-center rounded-lg border-2 border-red-400 bg-red-200/80 shadow-sm"
              style={{ position: 'absolute', zIndex: 5 }}
            >
              <div className="text-center">
                <p className="text-[10px] font-bold text-red-700">.sibling</p>
                <p className="font-mono text-[8px] text-red-500">z: 5</p>
              </div>
            </div>

            <div className="absolute bottom-1 inset-x-1">
              <div className="rounded bg-green-100 px-2 py-1 text-center text-[10px] font-medium text-green-700">
                .child(999) vs .sibling(5) → .child 위 ✅
              </div>
            </div>
          </div>
        </div>

        {/* SC 있음 */}
        <div>
          <p className="mb-2 text-xs font-semibold text-red-700">SC 있음 — 부모가 천장이 됨</p>

          {/* DOM 구조 표시 */}
          <div className="mb-2 rounded-md bg-gray-50 p-2 font-mono text-[10px] text-gray-600">
            <p>&lt;div&gt; <span className="text-gray-400">{'// root'}</span></p>
            <p>&nbsp; &lt;div class="<span className="text-orange-600">parent</span>" z-index: 1&gt; <span className="text-red-500">{'// ← SC 생성!'}</span></p>
            <p>&nbsp;&nbsp;&nbsp; &lt;div class="<span className="text-blue-600">child</span>" z-index: 999&gt;</p>
            <p>&nbsp; &lt;/div&gt;</p>
            <p>&nbsp; &lt;div class="<span className="text-red-600">sibling</span>" z-index: 5&gt;</p>
            <p>&lt;/div&gt;</p>
          </div>

          <div className="relative h-40 rounded-lg border-2 border-dashed border-red-300 bg-red-50/30 p-2" style={{ isolation: 'isolate' as React.CSSProperties['isolation'] }}>
            <p className="text-[9px] text-red-400">root SC</p>

            {/* .parent SC — z:1 */}
            <div
              className="absolute left-3 top-7 h-20 w-24 rounded border-2 border-orange-400 bg-orange-100/70 p-1"
              style={{ position: 'relative', zIndex: 1 }}
            >
              <p className="text-[9px] font-bold text-orange-600">.parent (z:1)</p>
              <p className="text-[8px] text-orange-500">SC 경계</p>

              {/* .child — z:999 but trapped */}
              <div
                className="absolute left-1 top-9 flex h-11 w-26 items-center justify-center rounded-lg border-2 border-blue-400 bg-blue-200/80 shadow-sm"
                style={{ position: 'absolute', zIndex: 999 }}
              >
                <div className="text-center">
                  <p className="text-[10px] font-bold text-blue-700">.child</p>
                  <p className="font-mono text-[8px] text-blue-500">z: 999</p>
                </div>
              </div>
            </div>

            {/* .sibling — z:5, 겹침 */}
            <div
              className="absolute left-20 top-14 flex h-11 w-26 items-center justify-center rounded-lg border-2 border-red-400 bg-red-200/80 shadow-sm"
              style={{ position: 'absolute', zIndex: 5 }}
            >
              <div className="text-center">
                <p className="text-[10px] font-bold text-red-700">.sibling</p>
                <p className="font-mono text-[8px] text-red-500">z: 5</p>
              </div>
            </div>

            <div className="absolute bottom-1 inset-x-1">
              <div className="rounded bg-red-100 px-2 py-1 text-center text-[10px] font-medium text-red-700">
                .parent(1) vs .sibling(5) → .sibling 위 ❌
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 부모-자식 SC 관계 트리 */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <p className="mb-3 text-xs font-semibold text-gray-700">SC 부모-자식 관계 규칙</p>
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-600">1</div>
            <div>
              <p className="text-xs font-medium text-gray-700">새 SC = 부모 SC의 자식</p>
              <p className="text-[11px] text-gray-500">
                새로 만들어진 SC는 DOM 트리처럼 부모 SC 안에 포함됩니다.
                자식 SC 전체가 하나의 레이어로 취급되어 부모 SC의 다른 형제들과 z-index로 비교됩니다.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-600">2</div>
            <div>
              <p className="text-xs font-medium text-gray-700">자식 SC 내부의 z-index는 외부로 탈출 불가</p>
              <p className="text-[11px] text-gray-500">
                자식 SC 안에서 z-index: 999999를 줘도, 부모 SC의 z-index가 1이면
                부모 SC 밖에서 z-index: 2인 요소보다 뒤에 표시됩니다.
                <strong> 부모의 z-index가 자식의 천장입니다.</strong>
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-600">3</div>
            <div>
              <p className="text-xs font-medium text-gray-700">비교는 항상 같은 부모 SC의 직계 자식끼리</p>
              <p className="text-[11px] text-gray-500">
                두 요소가 겹칠 때, 브라우저는 두 요소의 가장 가까운 공통 SC 조상을 찾고,
                그 SC의 직계 자식 레벨에서 z-index를 비교합니다.
              </p>
            </div>
          </div>
        </div>

        {/* Mini tree visualization */}
        <div className="mt-4 rounded-md bg-gray-50 p-3 font-mono text-[11px] text-gray-600">
          <p className="text-gray-400">/* SC 트리 — 비교는 같은 깊이에서만 */</p>
          <p>root SC</p>
          <p>├── <span className="text-orange-600">Parent SC (z: 1)</span> ← 이 z-index가 비교됨</p>
          <p>│   ├── 자식 A (z: 100) ← <span className="text-gray-400">Parent SC 안에서만 유효</span></p>
          <p>│   └── 자식 B (z: 200) ← <span className="text-gray-400">Parent SC 안에서만 유효</span></p>
          <p>└── <span className="text-red-600">형제 .sibling (z: 5)</span>   ← 이 z-index가 비교됨</p>
          <p className="mt-1 text-gray-400">→ Parent(1) vs .sibling(5) = .sibling 승. 자식 B(200)도 .sibling(5) 아래.</p>
        </div>

        {/* Paint order — absorbed from section 7 */}
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-3">
          <p className="mb-2 text-xs font-medium text-gray-700">브라우저 페인트 순서 (뒤→앞):</p>
          <div className="flex flex-wrap items-center gap-1 text-[10px]">
            {[
              { label: 'root bg', color: 'bg-gray-200' },
              { label: '.sibling (z:5)', color: 'bg-red-100' },
              { label: 'Parent bg (z:1)', color: 'bg-orange-100' },
              { label: '자식 A (z:100)', color: 'bg-orange-200' },
              { label: '자식 B (z:200)', color: 'bg-orange-300' },
            ].map((step, i) => (
              <div key={step.label} className="flex items-center gap-1">
                {i > 0 && <span className="text-gray-300">→</span>}
                <span className={`rounded px-1.5 py-0.5 ${step.color} text-gray-700`}>{step.label}</span>
              </div>
            ))}
          </div>
          <p className="mt-1 text-[10px] text-gray-400">
            .sibling(5)이 Parent(1)보다 높지만, Parent의 자식들이 Parent 내부에서 먼저 모두 그려진 뒤 .sibling이 그 위에 덮어씁니다.
          </p>
        </div>
      </div>
    </div>
  )
}

const SC_CONCEPT_CODE = `/* ===== Stacking Context(SC) = 독립된 z-index 공간 ===== */

/*
 * SC가 없는 경우:
 * → 모든 요소가 root SC에서 z-index 직접 비교
 * → z-index: 999 > z-index: 5 → 예상대로 동작
 */

.parent { position: relative; /* z-index 없음 → SC 안 만듦 */ }
.child  { position: absolute; z-index: 999; } /* root SC에서 비교 */
.sibling  { position: absolute; z-index: 5; }   /* root SC에서 비교 */
/* → .child(999) > .sibling(5) → child가 위에 표시 ✅ */


/*
 * SC가 있는 경우:
 * → 부모가 새 SC를 만들면, 자식의 z-index는 그 안에 갇힘
 * → 형제 .sibling와 비교할 때는 "부모의 z-index"가 대표값
 */

.parent { position: relative; z-index: 1; }  /* ← SC 생성! */
.child  { position: absolute; z-index: 999; } /* parent SC 안 */
.sibling  { position: absolute; z-index: 5; }   /* root SC */
/* → parent(1) vs other(5) → other가 위에 표시!
 *   child(999)는 parent(1) 안에 갇혀서 탈출 불가 ❌ */


/* ===== 핵심 규칙 ===== */

/*
 * 1. SC가 없으면 모든 자식이 부모 SC에서 직접 비교됨
 * 2. SC가 있으면 자식의 z-index는 해당 SC 안에 갇힘
 * 3. 부모의 z-index = 자식의 천장
 *    → 자식이 아무리 큰 z-index를 가져도
 *      부모 SC의 z-index보다 높은 형제를 이길 수 없음
 */`

type TriggerProperty = {
  label: string
  css: string
  style: React.CSSProperties
  note: string
  common: boolean
}

const TRIGGER_PROPERTIES: TriggerProperty[] = [
  {
    label: 'position + z-index',
    css: 'position: relative; z-index: 1',
    style: { position: 'relative', zIndex: 1 },
    note: '가장 기본적인 방법. position이 static이 아니고 z-index가 auto가 아닐 때.',
    common: true,
  },
  {
    label: 'opacity < 1',
    css: 'opacity: 0.99',
    style: { opacity: 0.99 },
    note: '1보다 작은 opacity는 무조건 새 SC를 만듦. fade-in 애니메이션 중 흔히 발생.',
    common: true,
  },
  {
    label: 'transform',
    css: 'transform: translateZ(0)',
    style: { transform: 'translateZ(0)' },
    note: 'GPU 가속(will-change 대용)으로 자주 쓰이지만 SC 생성 부작용이 있음.',
    common: true,
  },
  {
    label: 'filter',
    css: 'filter: blur(0px)',
    style: { filter: 'blur(0px)' },
    note: 'blur(0px)처럼 시각적으로 아무 변화 없어도 SC를 생성함.',
    common: true,
  },
  {
    label: 'isolation: isolate',
    css: 'isolation: isolate',
    style: { isolation: 'isolate' as React.CSSProperties['isolation'] },
    note: 'SC를 만들기 위해 설계된 속성. 부작용 없이 의도적으로 SC를 생성.',
    common: true,
  },
  {
    label: 'will-change: transform',
    css: 'will-change: transform',
    style: { willChange: 'transform' },
    note: '브라우저에 힌트를 주는 속성이지만 SC도 만듦.',
    common: false,
  },
  {
    label: 'mix-blend-mode',
    css: 'mix-blend-mode: multiply',
    style: { mixBlendMode: 'multiply' },
    note: 'normal이 아닌 값이면 새 SC를 생성.',
    common: false,
  },
  {
    label: 'clip-path',
    css: 'clip-path: inset(0)',
    style: { clipPath: 'inset(0)' },
    note: 'none이 아닌 값이면 새 SC를 생성.',
    common: false,
  },
  {
    label: 'contain: paint',
    css: 'contain: paint',
    style: { contain: 'paint' },
    note: 'layout, paint, strict, content 값이 SC를 생성.',
    common: false,
  },
  {
    label: 'container-type',
    css: 'container-type: inline-size',
    style: { containerType: 'inline-size' },
    note: 'CSS Container Query에 사용. normal이 아닌 값이면 SC 생성.',
    common: false,
  },
]

function WhatCreatesDemo() {
  const [activeProperty, setActiveProperty] = useState<number | null>(null)

  const parentStyle: React.CSSProperties =
    activeProperty !== null ? TRIGGER_PROPERTIES[activeProperty].style : {}

  return (
    <div className="space-y-4">
      {/* Property selector */}
      <div>
        <p className="mb-2 text-xs font-medium text-gray-500">부모 요소에 적용할 속성 선택:</p>
        <div className="flex flex-wrap gap-1.5">
          {TRIGGER_PROPERTIES.map((prop, i) => (
            <button
              key={prop.label}
              onClick={() => setActiveProperty(activeProperty === i ? null : i)}
              className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${
                activeProperty === i
                  ? 'border-blue-500 bg-blue-50 font-medium text-blue-700'
                  : prop.common
                    ? 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                    : 'border-gray-200 bg-gray-50 text-gray-400 hover:border-gray-300'
              }`}
            >
              {prop.label}
              {prop.common && <span className="ml-1 text-[10px] text-orange-500">★</span>}
            </button>
          ))}
        </div>
        {activeProperty !== null && (
          <div className="mt-2 rounded-md bg-amber-50 border border-amber-200 px-3 py-2">
            <p className="text-xs text-amber-800">
              <span className="font-mono font-medium">{TRIGGER_PROPERTIES[activeProperty].css}</span>
              {' — '}
              {TRIGGER_PROPERTIES[activeProperty].note}
            </p>
          </div>
        )}
      </div>

      {/* Visual demo */}
      <div className="relative h-52 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4">
        <p className="text-[10px] text-gray-400">root stacking context</p>

        {/* Parent with togglable stacking context */}
        <div
          className={`absolute left-4 top-8 h-28 w-40 rounded-lg border-2 p-2 transition-all ${
            activeProperty !== null
              ? 'border-orange-400 bg-orange-50'
              : 'border-gray-300 bg-white'
          }`}
          style={parentStyle}
        >
          <p className="text-[10px] text-gray-500">
            .parent {activeProperty !== null ? '(SC!)' : '(SC 없음)'}
          </p>
          <p className="font-mono text-[9px] text-gray-400">
            {activeProperty !== null ? TRIGGER_PROPERTIES[activeProperty].css : 'no special property'}
          </p>

          {/* Blue child — 오른쪽으로 튀어나와 Red와 모서리 겹침 */}
          <div
            className="absolute top-3 left-20 flex h-14 w-28 items-center justify-center rounded-lg border-2 border-blue-400 bg-blue-100 shadow-sm"
            style={{ position: 'absolute', zIndex: 999 }}
          >
            <div className="text-center">
              <p className="text-xs font-bold text-blue-700">.child</p>
              <p className="font-mono text-[10px] text-blue-500">z: 999</p>
            </div>
          </div>
        </div>

        {/* Red box — parent의 형제, Blue와 우하단 모서리가 겹침 */}
        <div
          className="absolute top-14 left-36 flex h-14 w-28 items-center justify-center rounded-lg border-2 border-red-400 bg-red-100 shadow-sm"
          style={{ position: 'absolute', zIndex: 5 }}
        >
          <div className="text-center">
            <p className="text-xs font-bold text-red-700">.sibling</p>
            <p className="font-mono text-[10px] text-red-500">z-index: 5</p>
          </div>
        </div>

        {/* Result indicator */}
        <div className="absolute bottom-2 left-2 right-2">
          <div
            className={`rounded-md px-3 py-1.5 text-center text-xs font-medium ${
              activeProperty !== null
                ? 'bg-red-100 text-red-700'
                : 'bg-green-100 text-green-700'
            }`}
          >
            {activeProperty !== null
              ? '❌ .child(999)가 .sibling(5) 아래! — .parent의 SC에 갇혀서 탈출 불가'
              : '✅ .child(999)가 .sibling(5) 위에 표시 — 같은 root SC에서 비교'}
          </div>
        </div>
      </div>
    </div>
  )
}

const CREATES_SC_CODE = `/* Stacking Context를 생성하는 주요 CSS 속성들 */

/* ★ 자주 만나는 것들 (실무에서 함정이 되기 쉬움) */

position: relative/absolute/fixed + z-index: (auto 아닌 값)
opacity: 0.99                    /* 1 미만이면 무조건 */
transform: translateZ(0)         /* GPU 가속 핵으로 자주 사용 */
filter: blur(0px)                /* 값이 none이 아니면 */
isolation: isolate               /* 의도적 SC 생성 전용 */

/* 덜 흔하지만 알아야 하는 것들 */

will-change: transform/opacity   /* 브라우저 힌트 */
mix-blend-mode: (normal 아닌 값)
clip-path: (none 아닌 값)
mask / mask-image               /* none이 아닌 값 */
contain: paint/layout/strict
container-type: (normal 아닌 값)  /* Container Query */
backdrop-filter                 /* none이 아닌 값 */
perspective                     /* none이 아닌 값 */

/* 주요 포인트:
 *
 * 1. position: relative만으로는 SC를 만들지 않음!
 *    → z-index: auto가 아닌 값이 필요
 *
 * 2. position: fixed / sticky는
 *    → 항상 새 SC를 만듦 (z-index 불필요)
 *
 * 3. flex/grid 자식 + z-index: auto가 아닌 값
 *    → position 없이도 SC를 만듦!
 */

.flex-parent {
  display: flex;
}
.flex-child {
  /* position 없어도 flex 자식이면 z-index가 SC를 만듦 */
  z-index: 1; /* ← 새 SC 생성! */
}`
