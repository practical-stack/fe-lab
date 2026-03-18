# Sticky Tab Header 패턴

중간에 위치한 탭 바가 스크롤되어 화면 상단에 닿으면 고정되고, 탭 클릭 시 해당 섹션으로 이동하는 패턴.

---

## 1. Sentinel 패턴 — sticky 상태 감지

### 문제

CSS `position: sticky`는 요소를 상단에 고정시키지만, **"지금 고정 상태인지"를 JS로 알 수 있는 API가 없다.**

### 해결

높이 0의 보이지 않는 **sentinel**(보초) 요소를 sticky 대상 바로 위에 배치하고, `IntersectionObserver`로 감시한다.

```
[ Hero 콘텐츠      ]
[ sentinel (h-0)   ]  ← 눈에 안 보이는 높이 0 요소
[ sticky tab bar   ]  ← position: sticky; top: 0
[ 섹션 콘텐츠들     ]
```

**동작 흐름:**

| 상태 | sentinel | isIntersecting | isStuck |
|------|----------|----------------|---------|
| 스크롤 전 | 뷰포트 안 | `true` | `false` |
| 아래로 스크롤 | 뷰포트 밖 | `false` | `true` |
| 다시 위로 스크롤 | 뷰포트 안 | `true` | `false` |

sticky 요소가 상단에 "붙는" 시점 = sentinel이 뷰포트를 벗어나는 시점이 정확히 일치하므로, sentinel의 visibility가 곧 sticky 상태의 반전값이 된다.

```tsx
useEffect(() => {
  const sentinel = sentinelRef.current
  const container = scrollContainerRef.current
  if (!sentinel || !container) return

  const observer = new IntersectionObserver(
    ([entry]) => setIsStuck(!entry.isIntersecting),
    { root: container, threshold: 0 }
  )

  observer.observe(sentinel)
  return () => observer.disconnect()
}, [])
```

### 왜 로컬 변수 `sentinel`에 캡처하는가?

`sentinelRef.current`는 mutable이라 cleanup 실행 시점에 이미 `null`로 바뀌었을 수 있다. 로컬 변수에 캡처해두면 클로저가 마운트 시점의 DOM 노드를 안정적으로 유지한다. React ESLint 규칙(`react-hooks/exhaustive-deps`)도 cleanup에서 `.current`를 직접 쓰면 경고를 준다.

### `root: container` 옵션

페이지 전체가 아닌 `overflow-y-auto`인 내부 컨테이너에서 스크롤될 경우, `root`를 해당 컨테이너로 지정해야 교차 감지가 올바르게 작동한다. 생략하면 브라우저 뷰포트 기준으로 감지된다.

---

## 2. 스크롤 → 탭 동기화 (역순 탐색)

스크롤 위치에 따라 현재 보이는 섹션을 감지하여 activeTab을 자동 갱신한다.

```tsx
for (let i = TABS.length - 1; i >= 0; i--) {
  const section = sectionRefs.current[TABS[i].id]
  if (section && section.offsetTop <= offset) {
    setActiveTab(TABS[i].id)
    break
  }
}
```

### `offsetTop <= offset` 은 무슨 뜻인가?

- **offsetTop** — 각 섹션이 콘텐츠 최상단에서 얼마나 떨어져 있는지 (고정값)
- **offset** — 현재 화면에서 tab bar 바로 아래 지점의 위치 (`scrollTop + tabBarHeight + 여유값`)
- **offsetTop <= offset** — 해당 섹션이 tab bar 아래로 이미 지나갔거나 딱 도달한 것

예시: `scrollTop = 750`, `offset = 750 + 44 + 20 = 814`

| 섹션 | offsetTop | offsetTop <= 814 | 결과 |
|------|-----------|------------------|------|
| Accessories | 1800 | 1800 > 814 ✗ | skip |
| Bottoms | 1300 | 1300 > 814 ✗ | skip |
| **Tops** | **800** | **800 ≤ 814 ✓** | **activeTab!** |
| Shoes | 300 | 300 ≤ 814 ✓ | break로 도달하지 않음 |

### 왜 역순(아래→위)으로 순회하는가?

섹션들이 위에서 아래로 배치되어 있으므로, `offsetTop <= offset`을 만족하는 섹션이 여러 개일 수 있다. 역순으로 돌면 **가장 아래에 있으면서 조건을 만족하는 섹션**(= 현재 보고 있는 섹션)을 바로 찾고 `break`한다. 정순으로 돌면 항상 첫 번째 섹션에 걸린다.

---

## 3. 클릭 스크롤 vs 사용자 스크롤 충돌 방지

### 문제

"하의" 탭 클릭 → `scrollTo({ behavior: 'smooth' })` → smooth scroll 중에 "신발", "상의" 섹션을 지나감 → scroll 이벤트 발생 → activeTab이 중간 섹션으로 깜빡거림.

### 해결

`isClickScrolling` ref 플래그로 탭 클릭에 의한 스크롤 동안 scroll 기반 탭 갱신을 일시 중단한다. 스크롤이 실제로 끝난 시점은 `scrollend` 이벤트로 감지한다.

```tsx
// 탭 클릭 시
const handleTabClick = (tabId: TabId) => {
  setActiveTab(tabId)
  isClickScrolling.current = true       // 플래그 ON → scroll 감지 중단

  container.scrollTo({
    top: targetTop,
    behavior: 'smooth',
  })

  // smooth scroll이 실제로 끝난 뒤 플래그 OFF
  container.addEventListener(
    'scrollend',
    () => {
      isClickScrolling.current = false
    },
    { once: true }                       // 한 번 발생 후 자동 해제
  )
}

// 스크롤 감지
const handleScroll = () => {
  if (isClickScrolling.current) return   // 플래그 ON이면 무시
  // ...activeTab 갱신
}
```

- `useRef`를 쓰는 이유: 리렌더 없이 값을 변경하기 위해서.
- `scrollend` 이벤트: 스크롤 애니메이션이 실제로 끝난 시점에 브라우저가 발생시킨다. `setTimeout`으로 근사하는 것보다 정확하다.
- `{ once: true }`: 이벤트 핸들러가 한 번 실행된 후 자동으로 제거되므로 cleanup이 필요 없다.

---

## 4. 스크롤 offset 계산 — DOM 속성 이해

### Visual Structure

```
┌─── scrollContainer (overflow-y: auto) ──────────┐
│                                                   │
│  ┌─ scrollable content ───────────────────────┐  │
│  │                                             │  │
│  │  [ Hero ]                                   │  │  ← offsetTop: ~0
│  │  [ sentinel (h-0) ]                         │  │
│  │  ┌─ sticky tab bar (h=44px) ──────────────┐│  │  ← sticky top: 0
│  │  │  Shoes | Tops | Bottoms | Accessories   ││  │
│  │  └────────────────────────────────────────┘│  │
│  │                                             │  │
│  │  ┌─ section: Shoes ──────────────────────┐ │  │  ← offsetTop: 300
│  │  │  ...                                   │ │  │
│  │  └────────────────────────────────────────┘│  │
│  │  ┌─ section: Tops ───────────────────────┐ │  │  ← offsetTop: 800
│  │  │  ...                                   │ │  │
│  │  └────────────────────────────────────────┘│  │
│  └─────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────┘
```

### `container.scrollTop`

컨테이너가 **위로 얼마나 스크롤되었는지**. 맨 위에서는 `0`, 아래로 스크롤할수록 값이 커진다.

```
scrollTop = 0          scrollTop = 400
┌──────────┐           ┌──────────┐
│ Hero     │ ← visible │ Shoes #3 │ ← Hero scrolled away
│ Tab bar  │           │ Shoes #4 │
│ Shoes #1 │           │ Shoes #5 │
│ Shoes #2 │           │ Shoes #6 │
└──────────┘           └──────────┘
```

### `section.offsetTop`

해당 섹션이 **offsetParent(여기선 스크롤 컨테이너) 상단에서 얼마나 떨어져 있는지**. 스크롤과 무관하게 고정된 값이다.

```
scrollable content (scrollHeight)
├── 0px    : Hero
├── 200px  : sentinel
├── 244px  : tab bar
├── 300px  : Shoes       ← offsetTop = 300
├── 800px  : Tops        ← offsetTop = 800
├── 1300px : Bottoms     ← offsetTop = 1300
└── 1800px : Accessories ← offsetTop = 1800
```

### 스크롤 → 탭 갱신 offset

```ts
const tabBarHeight = 44
const offset = container.scrollTop + tabBarHeight + 20
```

```
offset = scrollTop + 44 + 20
         ─────────   ──   ──
            │         │    └─ 여유값 (섹션 제목이 살짝 보이면 전환)
            │         └────── tab bar가 가리는 높이
            └──────────────── 현재 스크롤 위치
```

이 `offset`은 **"tab bar 아래 경계에서 약간 아래 지점"** 을 의미한다. 이 지점보다 위에 있는 섹션 중 가장 아래쪽 섹션이 현재 보고 있는 섹션이 된다.

### 탭 클릭 → 섹션 이동 offset

```ts
const tabBarHeight = 44
const sectionGap = 16
const targetTop = section.offsetTop - tabBarHeight - sectionGap
```

```
targetTop = section.offsetTop - 44 - 16
            ─────────────────   ──   ──
                    │            │    └─ 섹션 위 여백
                    │            └────── tab bar에 가려지지 않도록 보정
                    └─────────────────── 섹션의 절대 위치

scrollTo(targetTop) → 섹션 제목이 tab bar 바로 아래 + 16px 여백에 위치
```

**보정 없이** `scrollTo(section.offsetTop)`만 하면 섹션 제목이 tab bar 뒤에 가려진다. `tabBarHeight`를 빼서 가려지지 않게 하고, `sectionGap`을 추가로 빼서 여유 공간을 확보한다.

---

## 용어: Sentinel

**Sentinel**(보초, 감시병) — 프로그래밍에서 널리 쓰이는 용어. 배열 끝에 특수값을 두고 종료 조건을 판별하는 것을 sentinel value라고 한다. IntersectionObserver와 함께 쓰는 이 패턴도 **sentinel pattern**으로 불린다.
