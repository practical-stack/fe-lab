---
title: "변수 역할(Roles of Variables) 프레임워크"
description: "Sajaniemi의 변수 역할 프레임워크를 TypeScript/프론트엔드 관점으로 확장합니다. 12가지 변수 역할 분류, 실무 코드 예시, 인지과학적 근거(청킹, LTM, 스키마)를 다룹니다."
type: reference
tags: [Architecture, BestPractice]
order: 2
related: [./01-naming-convention.md]
---

# 변수 역할(Roles of Variables) 프레임워크

## 배경: 코드 읽기와 텍스트 읽기의 관계

최근 연구에 의하면, 코드를 읽을 때 **인간의 언어로 된 텍스트를 읽을 때 사용하는 인지 기술이 밀접하게 관련**되어 있다. 따라서 텍스트를 깊이 이해하기 위해 두뇌가 하는 일을 살펴보면, 프로그래머로서도 많은 것을 배울 수 있다.

코드에 대해 추론할 때는 변수가 중심적인 역할을 한다. 어떤 변수가 나타내고자 하는 것을 이해하지 못하면 코드에 대해 생각하는 것이 매우 어려워진다. 바로 이 점 때문에 적절한 변수명은 **표식(beacon)** 으로 사용될 수 있고, 읽고 있는 코드를 깊이 이해하는 데 도움이 된다.

---

## 왜 변수를 이해하기 어려운가

Jorma Sajaniemi(이스턴 핀란드 대학교)에 따르면, 변수를 이해하기 어려운 이유는 대부분의 프로그래머가 변수와 연관지을 좋은 **스키마(schema)** 를 LTM에 가지고 있지 않기 때문이다. "변수"나 "정수"처럼 너무 넓은 청크를 사용하거나, `numberOfCustomers`처럼 너무 좁은 청크를 사용하는 경향이 있다. 그 사이의 중간 수준이 필요한데, 이것이 **변수 역할 프레임워크**이다.

변수의 역할은 프로그램 내에서 변수가 하고자 하는 바를 나타낸다.

---

## 변수 역할 분류

Sajaniemi의 원본 프레임워크는 11가지 역할을 정의한다. 여기에 프론트엔드 개발에서 빈번히 등장하는 역할 1가지를 추가하여 **12가지 역할**로 확장한다.

---

### 1. 고정값 (Fixed Value)

**초기화 후 값이 변경되지 않는 변수.** 상수, 설정값, 환경 변수가 해당한다.

```typescript
// 앱 전역 설정
const API_BASE_URL = import.meta.env.VITE_API_URL
const MAX_FILE_SIZE = 10 * 1024 * 1024  // 10MB
const DEBOUNCE_MS = 300

// 라우트 정의
const ROUTES = {
  home: '/',
  product: '/products/:id',
  checkout: '/checkout',
} as const

// 컴포넌트 내부 설정
function InfiniteList() {
  const PAGE_SIZE = 20
  const THRESHOLD_PX = 100
  // ...
}
```

**네이밍 패턴**: `SCREAMING_SNAKE_CASE` (모듈 스코프) 또는 `camelCase` (함수 스코프이나 값이 고정일 때). `const` 선언 자체가 고정값을 암시하지만, `SCREAMING_SNAKE_CASE`는 "이 값은 설정이니 읽고 넘어가라"는 강한 신호를 준다.

---

### 2. 스테퍼 (Stepper)

**예측 가능한 단계로 값이 변하는 변수.** 루프 카운터뿐 아니라, UI에서 단계적으로 진행되는 모든 값이 해당한다.

```tsx
// 페이지네이션
const [currentPage, setCurrentPage] = useState(1)
const handleNext = () => setCurrentPage((p) => p + 1)

// 멀티스텝 폼 위저드
const [step, setStep] = useState<1 | 2 | 3>(1)
const handleNextStep = () => setStep((s) => Math.min(s + 1, 3) as 1 | 2 | 3)

// 캐러셀 / 탭
const [activeIndex, setActiveIndex] = useState(0)
const handleSlide = (direction: 'prev' | 'next') => {
  setActiveIndex((i) =>
    direction === 'next' ? (i + 1) % slides.length : (i - 1 + slides.length) % slides.length,
  )
}
```

**네이밍 패턴**: 현재 위치를 나타내는 이름 — `currentPage`, `step`, `activeIndex`. "지금 어디에 있는가"가 핵심이다.

---

### 3. 플래그 (Flag)

**무엇인가 발생했거나 어떤 상태에 해당하는지를 나타내는 boolean 변수.**

```tsx
// UI 상태
const [isOpen, setIsOpen] = useState(false)
const [isLoading, setIsLoading] = useState(false)

// 비즈니스 로직 상태
const hasUnsavedChanges = formState.isDirty
const isAuthenticated = session !== null
const shouldRefetch = staleTime < Date.now()

// 조건부 렌더링의 근거
const canSubmit = !isLoading && !hasErrors && hasUnsavedChanges
```

**네이밍 패턴**: 접두어가 없으면 플래그인지 다른 역할인지 구분이 어려워진다 — `open`(형용사? 동사?)보다 `isOpen`(플래그)이 역할을 즉시 드러낸다. 각 접두어는 서로 다른 질문에 답한다:

#### `is___` — "지금 ~한 상태인가?"

현재 상태를 나타낸다. 주어의 속성이나 진행 중인 상태를 묘사한다.

```tsx
// 주어의 현재 속성
const isActive = user.status === 'active'
const isAuthenticated = session !== null
const isVisible = intersectionEntry?.isIntersecting ?? false

// 진행 중인 상태
const isLoading = status === 'pending'
const isSubmitting = form.formState.isSubmitting
const isDragging = dragState !== null

// UI 토글 상태
const [isOpen, setIsOpen] = useState(false)
const [isExpanded, setIsExpanded] = useState(false)
const [isEditing, setIsEditing] = useState(false)
```

#### `has___` — "~을 가지고 있는가?"

존재 여부를 나타낸다. 무엇인가 **있다/없다**를 판단한다.

```tsx
// 데이터 존재 여부
const hasResults = results.length > 0
const hasNextPage = pageInfo.hasNextPage
const hasPermission = user.roles.includes('admin')

// 발생 여부 (과거에 무언가 축적됨)
const hasUnsavedChanges = formState.isDirty
const hasErrors = Object.keys(errors).length > 0
const hasBeenViewed = viewCount > 0
```

**`is` vs `has` 구분**: `is`는 주어 자체의 상태(`isValid` — 이것이 유효한가), `has`는 주어가 무언가를 소유하거나 축적했는지(`hasErrors` — 에러를 가지고 있는가). 같은 대상도 관점에 따라 달라진다: `isInvalid`(상태) vs `hasValidationErrors`(에러의 존재).

#### `should___` — "~해야 하는가?"

조건에 따른 행동 지침을 나타낸다. 로직이 **다음에 무엇을 할지** 결정하는 근거가 된다.

```tsx
// 데이터 패칭 판단
const shouldRefetch = staleTime < Date.now()
const shouldPaginate = totalCount > PAGE_SIZE
const shouldShowSkeleton = isLoading && !hasPreviousData

// 렌더링 판단
const shouldAnimate = !prefersReducedMotion && isFirstRender
const shouldTruncate = text.length > MAX_LENGTH
const shouldShowFallback = isError || isEmpty

// 기능 활성화 판단
const shouldEnablePolling = isRealtime && isVisible
const shouldTrack = !isBot && hasConsent
```

**`is` vs `should` 구분**: `is`는 현재 상태의 관찰(`isVisible` — 지금 보이는가), `should`는 상태를 종합한 의사결정(`shouldAnimate` — 여러 조건을 고려했을 때 애니메이션을 해야 하는가). `should`는 보통 여러 `is`/`has`의 조합이다.

#### `can___` — "~할 수 있는가?"

능력 또는 허가 여부를 나타낸다. 행동이 **가능한지** 판단한다.

```tsx
// 권한 기반
const canEdit = isOwner || hasRole('editor')
const canDelete = canEdit && !isArchived
const canAccessDashboard = subscription.plan !== 'free'

// 상태 기반 가능 여부
const canSubmit = isValid && !isSubmitting && hasUnsavedChanges
const canUndo = historyIndex > 0
const canRedo = historyIndex < history.length - 1

// UI 인터랙션 가능 여부
const canDragItem = !isLocked && isEditing
const canLoadMore = hasNextPage && !isLoading
```

**`should` vs `can` 구분**: `can`은 가능/불가능(`canSubmit` — 제출 버튼을 눌러도 되는 상태인가), `should`는 그래야 하는가(`shouldAutoSave` — 자동 저장을 실행해야 하는가). `can`은 주로 UI의 `disabled` 속성에, `should`는 로직의 분기 조건에 사용된다.

#### 요약

| 접두어 | 질문 | 사용처 | 예시 |
|--------|------|--------|------|
| `is___` | 지금 ~한 상태인가? | 현재 상태, UI 토글, 진행 중 | `isOpen`, `isLoading`, `isAuthenticated` |
| `has___` | ~을 가지고 있는가? | 존재 여부, 축적 여부 | `hasErrors`, `hasNextPage`, `hasPermission` |
| `should___` | ~해야 하는가? | 행동 의사결정, 조건 분기 | `shouldRefetch`, `shouldAnimate`, `shouldTrack` |
| `can___` | ~할 수 있는가? | 권한, 가능 여부, disabled | `canSubmit`, `canEdit`, `canUndo` |

---

### 4. 워커 (Walker)

**자료구조를 순회하되, 경로가 런타임에 결정되는 변수.** 배열의 순차 순회(스테퍼)와 달리 조건에 따라 경로가 달라진다.

```typescript
// DOM 트리 탐색
const walker = document.createTreeWalker(
  root,
  NodeFilter.SHOW_TEXT,
  { acceptNode: (node) => node.textContent?.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP },
)

let focusedNode: Node | null = walker.nextNode()
while (focusedNode) {
  // 조건에 따라 건너뛰거나 깊이 들어감
  if (shouldSkip(focusedNode)) {
    focusedNode = walker.nextSibling() ?? walker.nextNode()
  } else {
    focusedNode = walker.firstChild() ?? walker.nextNode()
  }
}

// 중첩 메뉴 탐색 — 사용자 입력에 따라 경로가 달라짐
function findMenuItem(menu: MenuItem[], targetId: string): MenuItem | null {
  for (const item of menu) {
    if (item.id === targetId) return item
    if (item.children) {
      const found = findMenuItem(item.children, targetId)
      if (found) return found
    }
  }
  return null
}
```

**네이밍 패턴**: 순회 대상을 나타내는 이름 — `focusedNode`, `currentItem`, `walker`. 스테퍼와 달리 "다음 값이 무엇인지" 예측할 수 없다는 것이 핵심 구분점이다.

---

### 5. 최근값 보유자 (Most Recent Holder)

**가장 최근에 발생한 입력, 이벤트, 응답 등을 보유하는 변수.** 프론트엔드에서 가장 빈번한 역할 중 하나다.

```tsx
// 사용자 입력의 최신값
const [searchQuery, setSearchQuery] = useState('')
const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
  setSearchQuery(e.target.value)  // 항상 최신 입력으로 덮어씀
}

// API 응답의 최신값
const { data: currentUser } = useQuery({ queryKey: ['user', userId], queryFn: fetchUser })

// 이벤트의 최신값
const [lastClickPosition, setLastClickPosition] = useState<{ x: number; y: number } | null>(null)
```

**네이밍 패턴**: `current___`, `latest___`, 또는 그 자체가 "최신 상태"를 나타내는 이름 — `searchQuery`(지금 입력된 검색어), `currentUser`(지금 로그인한 사용자). React의 `useState` 반환값 대부분이 이 역할이다.

---

### 6. 목적값 보유자 (Most Wanted Holder)

**찾고자 하는 특정 값, 또는 현재까지의 최적값을 보유하는 변수.**

```tsx
// 자동완성에서 가장 유사한 결과
const bestMatch = suggestions.find((s) => s.score > MATCH_THRESHOLD)

// 현재 뷰포트에 가장 가까운 섹션 (스크롤 스파이)
const nearestSection = sections.reduce((closest, section) => {
  const distance = Math.abs(section.offsetTop - scrollY)
  return distance < Math.abs(closest.offsetTop - scrollY) ? section : closest
})

// 사용자가 선택한 항목
const [selectedItem, setSelectedItem] = useState<Product | null>(null)

// 폼 검증에서 첫 번째 에러
const firstError = Object.values(errors).find((e) => e !== undefined)
```

**네이밍 패턴**: `selected___`, `best___`, `nearest___`, `first___`. "원하는 것을 찾았는가?"가 핵심 질문이다.

---

### 7. 모집자 (Gatherer)

**데이터를 순회하며 누적 연산을 수행하는 변수.** 합계, 카운트, 문자열 결합 등.

```tsx
// 장바구니 합계
const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

// 업로드 진행률
const uploadProgress = uploadedChunks / totalChunks

// 에러 집계
const errorCount = validationResults.filter((r) => !r.isValid).length

// 폼 완성도
const completedFields = Object.values(formState).filter(Boolean).length
const completionRate = completedFields / totalFields
```

**네이밍 패턴**: `total___`, `___Count`, `___Sum`, `___Rate`. 연산의 결과를 나타내는 이름이 역할을 드러낸다.

---

### 8. 컨테이너 (Container)

**값을 추가하거나 삭제할 수 있는 자료구조 변수.** 배열, Set, Map 등.

```tsx
// 알림 목록
const [notifications, setNotifications] = useState<Notification[]>([])
const addNotification = (n: Notification) => setNotifications((prev) => [...prev, n])
const removeNotification = (id: string) => setNotifications((prev) => prev.filter((n) => n.id !== id))

// 선택된 항목들
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
const toggleSelection = (id: string) => {
  setSelectedIds((prev) => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })
}

// 필터 조건
const [filters, setFilters] = useState<Map<string, string[]>>(new Map())
```

**네이밍 패턴**: 복수형 — `notifications`, `cartItems`, `selectedIds`. 또는 자료구조를 나타내는 접미사 — `filterMap`, `userSet`. 단수형과 구별되어야 한다.

---

### 9. 추적자 (Follower)

**다른 변수의 이전 값 또는 이전 상태를 추적하는 변수.** 변화 감지, 비교, 되돌리기에 사용된다.

```tsx
// 스크롤 방향 감지
function useScrollDirection() {
  const [direction, setDirection] = useState<'up' | 'down'>('up')
  const prevScrollY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setDirection(currentScrollY > prevScrollY.current ? 'down' : 'up')
      prevScrollY.current = currentScrollY  // 현재값이 다음 틱의 이전값이 됨
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return direction
}

// 이전 라우트 추적
const previousRoute = useRef(location.pathname)
useEffect(() => {
  // 이전 라우트와 현재 라우트 비교
  analytics.track('navigate', { from: previousRoute.current, to: location.pathname })
  previousRoute.current = location.pathname
}, [location.pathname])

// usePrevious 훅 — 추적자 역할의 일반화
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined)
  useEffect(() => { ref.current = value })
  return ref.current
}
```

**네이밍 패턴**: `prev___`, `previous___`, `last___`. `useRef`와 함께 자주 등장하며, "지금 값과 비교하기 위한 이전 값"이 핵심이다.

---

### 10. 조직자 (Organizer)

**원본 데이터를 정렬, 필터, 그룹핑 등으로 변환한 결과를 담는 변수.** 원본은 변경하지 않고 새로운 형태를 만든다.

```tsx
// 정렬
const sortedProducts = useMemo(
  () => [...products].sort((a, b) => a.price - b.price),
  [products],
)

// 그룹핑
const groupedByCategory = useMemo(
  () => Object.groupBy(products, (p) => p.category),
  [products],
)

// 필터링
const filteredUsers = useMemo(
  () => users.filter((u) => u.role === 'admin' && u.isActive),
  [users],
)

// 검색 결과 하이라이트
const highlightedResults = results.map((r) => ({
  ...r,
  title: r.title.replace(new RegExp(query, 'gi'), '<mark>$&</mark>'),
}))
```

**네이밍 패턴**: `sorted___`, `filtered___`, `grouped___`, `___ByCategory`. 변환 동사의 과거분사가 접두어로 붙어 "이미 변환된 결과"임을 나타낸다. `useMemo`와 함께 자주 등장한다.

---

### 11. 임시 (Temporary)

**계산 중간에 잠깐 사용하고 버려지는 변수.** 범위가 매우 짧고, 이름의 수명도 짧다.

```tsx
// 레이아웃 계산
const handleResize = () => {
  const rect = containerRef.current!.getBoundingClientRect()
  const availableWidth = rect.width - PADDING * 2
  setColumns(Math.floor(availableWidth / COLUMN_MIN_WIDTH))
}

// 구조분해 중간값
const [, , thirdItem] = someArray  // 첫 두 값은 임시 — 사용하지 않음

// 좌표 변환
const handleDrag = (e: MouseEvent) => {
  const dx = e.clientX - dragStart.x
  const dy = e.clientY - dragStart.y
  setPosition({ x: initialPosition.x + dx, y: initialPosition.y + dy })
}
```

**네이밍 패턴**: 짧은 이름 또는 연산 결과를 나타내는 이름 — `rect`, `dx`, `dy`. 스코프가 2-3줄 이내로 매우 짧으므로 간결한 이름이 오히려 적절하다. 스코프가 길어지면 임시가 아니라 다른 역할로 승격해야 한다.

---

### 12. 파생값 (Derived Value) — 프론트엔드 확장

**다른 상태로부터 계산되는 값으로, 독립적으로 변경되지 않는 변수.** 원본 상태가 바뀌면 자동으로 따라 바뀐다. 조직자와 달리 "변환"이 아니라 "계산"이 핵심이다.

```tsx
// 다른 상태에서 파생
const isEmpty = items.length === 0
const fullName = `${user.firstName} ${user.lastName}`
const discountedPrice = price * (1 - discountRate)

// useMemo로 비용이 큰 파생
const chartData = useMemo(
  () => rawData.map((d) => ({ x: d.timestamp, y: d.value, label: formatDate(d.timestamp) })),
  [rawData],
)

// CSS 변수 파생
const cssVars = {
  '--sidebar-width': `${sidebarWidth}px`,
  '--content-height': `${viewportHeight - headerHeight}px`,
} as React.CSSProperties
```

**조직자와의 구분**: 조직자는 같은 타입의 컬렉션을 재배열/필터링한다 (`Product[] → Product[]`). 파생값은 원본과 다른 형태의 새로운 값을 계산한다 (`number → string`, `User → string`, `RawData[] → ChartPoint[]`).

**네이밍 패턴**: 계산 결과 자체를 나타내는 이름 — `fullName`, `discountedPrice`, `chartData`. 접두어 없이 "이것이 무엇인가"를 직접 표현한다.

---

## 역할의 조합이 프론트엔드 패턴을 특징짓는다

몇 개의 역할이 묶이면 컴포넌트의 패턴을 즉시 파악할 수 있다:

| 역할 조합 | 패턴 | 예시 |
|-----------|------|------|
| 최근값 보유자 + 조직자 + 컨테이너 | 검색/필터 UI | `searchQuery` → `filteredProducts` → `products[]` |
| 스테퍼 + 플래그 | 멀티스텝 폼 | `step` + `isValid` + `canProceed` |
| 컨테이너 + 모집자 | 장바구니 / 선택 집계 | `cartItems[]` → `totalPrice` |
| 추적자 + 최근값 보유자 | 스크롤 방향 / 무한 스크롤 | `prevScrollY` + `currentScrollY` |
| 플래그 + 최근값 보유자 + 파생값 | 비동기 데이터 패칭 | `isLoading` + `data` + `isEmpty` |

### 통합 예시: 상품 검색 페이지

```tsx
function ProductSearchPage() {
  const PAGE_SIZE = 20                                        // 고정값
  const [searchQuery, setSearchQuery] = useState('')          // 최근값 보유자
  const [currentPage, setCurrentPage] = useState(1)           // 스테퍼
  const [isLoading, setIsLoading] = useState(false)           // 플래그
  const [products, setProducts] = useState<Product[]>([])     // 컨테이너
  const [selectedIds, setSelectedIds] = useState(new Set())   // 컨테이너

  const totalPrice = useMemo(                                 // 모집자
    () => products.filter((p) => selectedIds.has(p.id)).reduce((sum, p) => sum + p.price, 0),
    [products, selectedIds],
  )
  const sortedProducts = useMemo(                             // 조직자
    () => [...products].sort((a, b) => a.price - b.price),
    [products],
  )
  const isEmpty = products.length === 0 && !isLoading         // 파생값
  const prevQuery = useRef(searchQuery)                       // 추적자
  const cheapestProduct = sortedProducts[0] ?? null           // 목적값 보유자
}
```

---

## 실용적 가치

- 팀 내에서 변수에 대해 논의할 때 **공통 어휘**를 제공한다 ("이 변수는 목적값 보유자 역할이니까 `maxScore`가 적절합니다")
- 변수명에 역할명을 포함하면 코드 독자가 변수의 역할을 파악하는 **수고를 덜** 수 있다
- 연구에 의하면 이 프레임워크를 학습한 학생들이 소스 코드를 처리하는 **성과가 더 뛰어났다**
- 역할은 특정 프로그래밍 패러다임에 제한되지 않고 **모든 패러다임에 나타난다** (절차적, OOP, 함수형)

---

## 인지과학적 근거: 청킹과 스키마

### 청킹(Chunking)과 장기기억(LTM)

인지과학에서 **청킹(Chunking)** 은 개별 정보를 의미 있는 단위로 묶어 작업 기억(Working Memory)의 한계를 극복하는 메커니즘이다.

**핵심 원리**: 특정 주제에 대해 장기기억(LTM)에 더 많은 정보를 저장하고 있다면, 입력된 정보를 효율적으로 청크로 묶는 것이 수월해진다.

체스 연구의 사례가 이를 잘 보여준다:
- 전문 체스 선수들은 LTM에 체스의 다양한 말 배치 패턴을 저장하고 있다
- 그래서 체스판 전체를 "개별 말 16개"가 아니라 "공격 포메이션 1개 + 방어 구조 1개 + ..."로 청킹한다
- 결과적으로 동일한 체스판을 초보자보다 훨씬 잘 기억할 수 있다

**문자 vs 단어 실험**: 무작위 문자열(`XKQMWP`)보다 의미 있는 단어(`KNIGHT`)가 기억하기 쉬운 이유는, 단어의 의미를 LTM으로부터 인출할 수 있어 청킹이 자동으로 일어나기 때문이다.

### 변수명에의 적용

이 원리는 코드를 읽는 행위에 직접 적용된다:

| 상황 | 인지 과정 | 부하 |
|------|----------|------|
| `const x = get(q, f, s)` | 각 문자를 개별 정보로 처리. LTM에서 인출할 패턴 없음 | **높음** |
| `const filteredProducts = filterByCategory(products, category, sortOrder)` | `filtered`, `Products`, `Category` 등 LTM의 기존 어휘로 청킹 | **낮음** |

**좋은 변수명은 독자의 LTM을 활용하여 청킹을 돕는다:**

1. **익숙한 단어 사용**: LTM에 이미 저장된 영어 단어/도메인 용어로 구성 → 자동 청킹
2. **camelCase의 청킹 경계**: `activeUserList` → `active` + `User` + `List`로 시각적 분리 → 3청크
3. **일관된 패턴**: 같은 카테고리의 변수가 동일 패턴이면, 패턴 자체가 하나의 청크. `isLoading`, `isOpen`, `isEditing` → `is___` 패턴 1청크 + 상태명 1청크
4. **도메인 용어 활용**: 팀이 공유하는 도메인 용어가 LTM에 있으면, `cartItem`은 1청크로 처리됨

### 변수 역할 스키마가 작업 기억을 절약하는 메커니즘

```
스키마 없는 프로그래머:
  searchQuery, currentPage, isLoading, products, sortedProducts, totalPrice
  → 6개의 개별 변수로 인식 → 작업 기억에 6슬롯 차지

변수 역할 스키마를 가진 프로그래머:
  [최근값 보유자] searchQuery  ┐
  [조직자] sortedProducts      ├→ "검색/필터 UI 패턴" 1청크
  [컨테이너] products          ┘
  [스테퍼] currentPage           → 페이지네이션 1청크
  [플래그] isLoading             → 비동기 상태 1청크
  [모집자] totalPrice            → 집계 1청크
  → 4청크로 처리 → 작업 기억 여유
```

**"변수"나 "state"처럼 너무 넓은 청크**를 사용하면 변수 간 차이를 구분할 수 없다. **`numberOfFilteredActiveAdminUsers`처럼 너무 좁은 청크**를 사용하면 패턴을 일반화할 수 없다. 변수 역할은 이 **중간 수준의 청크**를 제공하여, 새로운 컴포넌트를 볼 때도 "이건 검색/필터 패턴이구나"라고 즉시 분류할 수 있게 한다.

변수명에 역할을 반영하는 것이 효과적인 인지과학적 근거:
- `selectedItem` → LTM에서 "목적값 보유자" 스키마 인출 → 사용자가 고른 값이라는 것을 즉시 파악
- `prevScrollY` → LTM에서 "추적자" 스키마 인출 → 현재값과 비교하기 위한 이전 값
- `isLoading` → LTM에서 "플래그" 스키마 인출 → boolean 상태이고 조건부 렌더링의 근거
- `totalPrice` → LTM에서 "모집자" 스키마 인출 → 누적 연산의 결과값

---

## 레퍼런스

- Sajaniemi, J. et al. (2007). "An Experiment on Using Roles of Variables in Teaching Introductory Programming"
- Hermans, F. "The Programmer's Brain" — 청킹, LTM, 코드 읽기와 텍스트 읽기의 관계
