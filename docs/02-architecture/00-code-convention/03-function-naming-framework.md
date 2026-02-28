---
title: "함수 역할(Roles of Functions) 프레임워크"
description: "프론트엔드에서 함수가 수행하는 역할을 분류합니다. 10가지 함수 역할, on___ props 규칙, 실무 코드 예시를 다룹니다."
type: reference
tags: [Architecture, TypeScript, BestPractice]
order: 3
related: [./02-variable-naming-framework.md, ./04-function-interface-pattern.md, ./01-naming-convention.md]
---

# 함수 역할(Roles of Functions) 프레임워크

## 배경

[변수 역할 프레임워크](./02-variable-naming-framework.md)가 "이 변수는 어떤 역할인가?"라는 중간 수준의 청크를 제공하듯, 함수에도 동일한 분류가 필요하다.

함수명의 첫 토큰(동사 prefix)은 프로그래머의 시선이 가장 먼저 고정되는 **beacon**이다. 이 동사가 함수의 역할을 즉시 드러내면, 독자는 함수 본문을 읽지 않고도 동작을 예측할 수 있다.

이 문서는 프론트엔드 TypeScript 코드에서 함수가 수행하는 역할을 분류하고, 각 역할에 적합한 네이밍 패턴과 실무 예시를 제공한다.

---

## 함수 역할 분류

---

### 1. 조회자 (Getter)

**데이터를 가져와서 반환하는 함수.** 부수효과 없이 값을 꺼내오는 것이 핵심이다. 동기/비동기에 따라 prefix가 달라진다.

```tsx
// 동기 조회 — get: 이미 있는 값을 계산/추출
function getActiveTabIndex(tabs: Tab[]): number {
  return tabs.findIndex((tab) => tab.isActive)
}

function getViewportSize(): { width: number; height: number } {
  return { width: window.innerWidth, height: window.innerHeight }
}

function getStoredTheme(): 'light' | 'dark' | null {
  return localStorage.getItem('theme') as 'light' | 'dark' | null
}

// 비동기 조회 — fetch: 네트워크 요청으로 데이터를 가져옴
async function fetchProductDetail(productId: string): Promise<Product> {
  const response = await api.get(`/products/${productId}`)
  return response.data
}

// TanStack Query에서의 사용
const { data: product, isLoading } = useQuery({
  queryKey: ['product', productId],
  queryFn: () => fetchProductDetail(productId),
})
```

**네이밍 패턴**:

| prefix | 언제 | 반환 | 예시 |
|--------|------|------|------|
| `get___` | 이미 존재하는 값을 동기적으로 계산/추출 | 즉시 값 | `getActiveTabIndex`, `getStoredTheme` |
| `fetch___` | 네트워크 요청으로 외부에서 가져옴 | `Promise` | `fetchProductDetail`, `fetchCategories` |
| `load___` | 파일/모듈/리소스를 비동기로 불러옴 | `Promise` | `loadImage`, `loadScript`, `loadLocale` |
| `find___` | 컬렉션에서 조건에 맞는 항목을 탐색 | 값 또는 `undefined` | `findUserById`, `findNearestStore` |

```tsx
// get vs fetch — 호출자에게 await 필요 여부를 즉시 알려준다
const theme = getStoredTheme()                   // 동기, localStorage에서 즉시 꺼냄
const product = await fetchProductDetail('123')  // 비동기, 서버에서 가져옴

// load — 리소스 로딩에 특화
const messages = await loadLocale('ko')          // i18n 번역 파일 로딩
const Component = await loadWidget('chart')      // dynamic import

// find — 컬렉션 탐색, 없으면 undefined
const admin = findUserByRole(users, 'admin')     // 배열에서 조건 탐색
```

**TanStack Query와의 관계**: `queryFn`에 전달되는 함수는 `fetch___`로 네이밍한다. `get___`은 `queryFn` 없이 동기적으로 값을 꺼내는 경우에 사용한다.

---

### 2. 변경자 (Setter/Updater)

**기존 값을 변경하는 함수.** 상태를 직접 교체하거나 일부를 갱신한다.

```tsx
// 직접 교체 — set: 이전 값을 무시하고 새 값으로 덮어씀
function setTheme(theme: 'light' | 'dark') {
  document.documentElement.dataset.theme = theme
  localStorage.setItem('theme', theme)
}

// React 상태의 set — useState가 반환하는 setter
const [selectedCategory, setSelectedCategory] = useState<string>('all')
const [isModalOpen, setIsModalOpen] = useState(false)

// 부분 갱신 — update: 이전 값을 기반으로 일부만 변경
function updateCartItemQuantity(itemId: string, quantity: number) {
  setCartItems((prev) =>
    prev.map((item) => (item.id === itemId ? { ...item, quantity } : item)),
  )
}

function updateFilterOption(key: string, value: string) {
  setFilters((prev) => ({ ...prev, [key]: value }))
}

// 토글 — toggle: set의 특수 형태 (두 상태 사이를 전환)
function toggleSidebar() {
  setIsSidebarOpen((prev) => !prev)
}

function toggleFavorite(productId: string) {
  setFavoriteIds((prev) => {
    const next = new Set(prev)
    next.has(productId) ? next.delete(productId) : next.add(productId)
    return next
  })
}
```

**네이밍 패턴**:

| prefix | 언제 | 이전 값 | 예시 |
|--------|------|---------|------|
| `set___` | 이전 값을 무시하고 새 값으로 전체 교체 | 무시 | `setTheme`, `setSelectedCategory` |
| `update___` | 이전 값을 기반으로 일부만 변경 | 참조 | `updateCartItemQuantity`, `updateFilterOption` |
| `toggle___` | 두 상태 사이를 전환 (set의 특수 형태) | 반전 | `toggleSidebar`, `toggleFavorite` |

```tsx
// set — 이전 값과 무관하게 덮어씀
setTheme('dark')                          // 이전 테마가 뭐였든 'dark'로 교체

// update — 이전 값을 기반으로 일부만 변경
updateCartItemQuantity(itemId, 3)         // 해당 아이템의 수량만 변경, 나머지 유지

// toggle — 현재 상태의 반대로 전환
toggleSidebar()                           // 열려있으면 닫고, 닫혀있으면 열기
```

---

### 3. 생성자 (Creator)

**새로운 인스턴스, 객체, 데이터를 만들어 반환하는 함수.** 기존 것을 변경하지 않고 새로운 것을 만든다.

```tsx
// 단순 생성 — create: 새로운 엔티티/인스턴스를 만든다
function createToast(message: string, type: ToastType = 'info'): Toast {
  return { id: crypto.randomUUID(), message, type, createdAt: Date.now() }
}

function createFilterChip(label: string, value: string): FilterChip {
  return { id: `${label}-${value}`, label, value, isActive: true }
}

// 구성/조립 — build: 여러 부품을 모아 하나의 구조를 만든다
function buildSearchParams(filters: FilterState): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.category) params.set('category', filters.category)
  if (filters.minPrice) params.set('min_price', String(filters.minPrice))
  if (filters.sortBy) params.set('sort', filters.sortBy)
  return params
}

function buildBreadcrumbs(pathname: string, routeMap: RouteMap): Breadcrumb[] {
  return pathname.split('/').filter(Boolean).map((segment, i, segments) => ({
    label: routeMap[segment]?.label ?? segment,
    href: '/' + segments.slice(0, i + 1).join('/'),
  }))
}

// React에서의 초기 상태 생성 (lazy initializer)
const [formState, setFormState] = useState(() =>
  createInitialFormState(existingProduct),
)
```

**네이밍 패턴**:

| prefix | 언제 | 입력 → 출력 | 예시 |
|--------|------|------------|------|
| `create___` | 새로운 엔티티/인스턴스를 처음부터 만듦 | 최소 인자 → 새 객체 | `createToast`, `createFilterChip` |
| `build___` | 여러 부품/데이터를 조합하여 하나의 구조를 조립 | 복수 데이터 → 조립된 구조 | `buildSearchParams`, `buildBreadcrumbs` |

```tsx
// create — "세상에 없던 것을 만든다", id 생성 등 포함
const toast = createToast('저장되었습니다')      // UUID, timestamp 등 자동 부여

// build — "기존 데이터를 조합해 하나로 조립한다"
const params = buildSearchParams(filters)       // filters 객체의 각 필드를 URLSearchParams로 조립
const crumbs = buildBreadcrumbs(pathname, routes) // pathname을 분해하고 routeMap과 결합
```

**`create` vs `build` 판단 기준**: 입력이 단순하고 내부에서 id/timestamp를 생성하면 `create`. 입력이 여러 소스이고 이를 하나의 구조로 조립하면 `build`.

---

### 4. 변환자 (Transformer)

**입력을 다른 형태로 변환하여 반환하는 함수.** 순수 함수인 경우가 많다.

```tsx
// 파싱 — parse: 비정형(문자열, unknown) → 정형(구조화된 타입)
function parseSearchParams(searchString: string): ProductFilter {
  const params = new URLSearchParams(searchString)
  return {
    category: params.get('category') ?? 'all',
    minPrice: Number(params.get('min_price')) || 0,
    sortBy: (params.get('sort') as SortOption) ?? 'newest',
  }
}

function parseApiError(error: unknown): AppError {
  if (error instanceof AxiosError) {
    return { code: error.response?.status ?? 500, message: error.message }
  }
  return { code: 500, message: 'Unknown error' }
}

// 포매팅 — format: 정형(숫자, Date) → 사용자에게 보여줄 문자열
function formatPrice(amount: number): string {
  return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount)
}

function formatRelativeTime(date: Date): string {
  const diff = Date.now() - date.getTime()
  if (diff < 60_000) return '방금 전'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}분 전`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}시간 전`
  return new Intl.DateTimeFormat('ko-KR').format(date)
}

// 매핑 — to/normalize: API 응답 → 컴포넌트가 사용하는 형태
function toProductCard(apiProduct: ApiProduct): ProductCardProps {
  return {
    id: apiProduct.product_id,
    title: apiProduct.product_name,
    priceLabel: formatPrice(apiProduct.price),
    thumbnailUrl: apiProduct.images[0]?.url ?? PLACEHOLDER_IMAGE,
    badgeText: apiProduct.stock === 0 ? '품절' : apiProduct.discount_rate > 0 ? '할인' : undefined,
  }
}

function normalizeCartItem(apiItem: ApiCartItem): CartItem {
  return {
    id: apiItem.cart_item_id,
    productId: apiItem.product_id,
    name: apiItem.product_name,
    price: apiItem.unit_price,
    quantity: apiItem.qty,
    imageUrl: apiItem.thumbnail_url,
  }
}
```

**네이밍 패턴**:

| prefix | 방향 | 예시 |
|--------|------|------|
| `parse___` | 비정형 → 정형 (문자열/unknown → 구조화된 타입) | `parseSearchParams`, `parseApiError` |
| `format___` | 정형 → 표시용 문자열 (숫자/Date → UI 텍스트) | `formatPrice`, `formatRelativeTime` |
| `to___` / `normalize___` | 타입 A → 타입 B (API 응답 → 컴포넌트 props) | `toProductCard`, `normalizeCartItem` |

`parse`와 `format`은 역방향 쌍이다: `parseSearchParams("?sort=newest")` ↔ `buildSearchParams(filters).toString()`. `to___`/`normalize___`는 API 레이어와 컴포넌트 레이어 사이의 변환에 집중한다.

```tsx
// parse — 비정형 문자열을 구조화된 타입으로 변환
const filter = parseSearchParams('?sort=newest')     // string → ProductFilter

// format — 정형 데이터를 사용자에게 보여줄 문자열로 변환 (parse의 역방향)
const label = formatPrice(29900)                     // number → "₩29,900"

// to___ — API 응답을 컴포넌트 props 형태로 1:1 매핑
const card = toProductCard(apiProduct)               // ApiProduct → ProductCardProps

// normalize — 외부 데이터의 필드명/구조를 내부 규격으로 정규화
const item = normalizeCartItem(apiItem)              // snake_case 필드 → camelCase 필드
```

**`to___` vs `normalize___` 판단 기준**: `to___`는 타입 A를 타입 B로 **형태를 바꾸는** 변환 (다른 props 구조로 재매핑). `normalize___`는 같은 개념을 **내부 규격에 맞추는** 정규화 (필드명 통일, snake_case → camelCase 등).

**TanStack Query `select`에서의 활용**: API 응답을 컴포넌트가 필요한 형태로 변환할 때, `select` 옵션에 변환자를 전달한다. 이때 변환자의 이름이 "이 쿼리가 어떤 형태의 데이터를 반환하는가"를 설명한다.

```tsx
// select에 변환자를 전달 — API 응답을 뷰에 맞게 변환
function selectProductCards(data: ApiProductListResponse): ProductCardProps[] {
  return data.items.map(toProductCard)
}

function selectCategoryOptions(data: ApiCategoryResponse): SelectOption[] {
  return data.categories.map((c) => ({ value: c.id, label: c.name }))
}

function selectTotalCount(data: ApiProductListResponse): number {
  return data.totalCount
}

// 사용
const { data: productCards } = useQuery({
  queryKey: ['products', filters],
  queryFn: () => fetchProducts(filters),
  select: selectProductCards,  // ← API 응답 → ProductCardProps[]
})

const { data: categoryOptions } = useQuery({
  queryKey: ['categories'],
  queryFn: fetchCategories,
  select: selectCategoryOptions,  // ← API 응답 → SelectOption[]
})
```

**`select___` 네이밍 규칙**: `select` + 반환할 데이터의 이름. `selectProductCards`는 "이 쿼리에서 ProductCard용 데이터를 뽑아낸다"는 의미. 같은 API 응답에서 다른 형태를 추출할 때 변환자를 분리하면 쿼리를 재사용할 수 있다.

---

### 5. 검증자 (Validator)

**입력이 유효한지 판단하는 함수.** boolean을 반환하거나 에러를 던진다.

```tsx
// boolean 반환 — is/has/can: 조건부 렌더링, disabled 판단의 근거
function isOutOfStock(product: Product): boolean {
  return product.stock === 0
}

function hasSelectedItems(selectedIds: Set<string>): boolean {
  return selectedIds.size > 0
}

function canAddToCart(product: Product, currentQuantity: number): boolean {
  return !isOutOfStock(product) && currentQuantity < product.maxQuantity
}

// 검증 결과 반환 — validate: 폼 검증에서 에러 목록을 반환
function validateShippingForm(values: ShippingFormValues): ValidationErrors {
  const errors: ValidationErrors = {}
  if (!values.recipientName) errors.recipientName = '수령인을 입력해주세요'
  if (!values.phone) errors.phone = '연락처를 입력해주세요'
  else if (!/^01[016-9]\d{7,8}$/.test(values.phone)) errors.phone = '올바른 휴대폰 번호가 아닙니다'
  if (!values.zipCode) errors.zipCode = '우편번호를 입력해주세요'
  if (!values.address) errors.address = '상세주소를 입력해주세요'
  return errors
}

// 단언 — assert/ensure: 실패 시 에러를 던져 이후 코드의 타입을 좁힘
function assertAuthenticated(session: Session | null): asserts session is Session {
  if (!session) throw new AuthError('로그인이 필요합니다')
}

function ensureElement(ref: RefObject<HTMLElement | null>): HTMLElement {
  if (!ref.current) throw new Error('ref가 연결되지 않았습니다')
  return ref.current
}
```

**네이밍 패턴**:

| prefix | 반환 | 실패 시 | 예시 |
|--------|------|---------|------|
| `is___` | `boolean` | `false` 반환 | `isOutOfStock` — 현재 상태 판단 |
| `has___` | `boolean` | `false` 반환 | `hasSelectedItems` — 존재 여부 확인 |
| `can___` | `boolean` | `false` 반환 | `canAddToCart` — 능력/자격 판단 |
| `validate___` | 에러 객체/배열 | 에러 목록 반환 | `validateShippingForm` — 복수 규칙 검증, 에러 메시지 수집 |
| `assert___` | `void` (asserts) | 에러 throw | `assertAuthenticated` — 실패 시 프로그램 흐름을 중단, 타입 좁힘 |
| `ensure___` | 보장된 값 | 에러 throw | `ensureElement` — 실패 시 throw, 성공 시 값 반환 |

```tsx
// is/has/can — 조건 분기용, 실패해도 에러 아님
if (isOutOfStock(product)) return <SoldOutBadge />
const disabled = !canAddToCart(product, quantity)

// validate — 폼 등에서 여러 규칙을 한번에 검증, 에러 목록을 모아서 반환
const errors = validateShippingForm(values)  // { recipientName: '수령인을 입력해주세요', ... }

// assert — 실패 시 throw, 성공 시 타입이 좁혀짐 (asserts 키워드)
assertAuthenticated(session)  // 이후 session은 null이 아님이 보장

// ensure — assert와 비슷하지만 값을 반환
const element = ensureElement(ref)  // 이후 element는 HTMLElement 확정
```

**`assert___` vs `ensure___` 판단 기준**: 둘 다 실패 시 throw하지만, `assert___`는 `void`를 반환하고 TypeScript의 `asserts` 키워드로 타입을 좁힌다. `ensure___`는 **보장된 값을 직접 반환**한다.

**boolean 함수의 반환값을 변수에 담을 때의 충돌 문제**:

`is___` / `has___` / `can___` 함수는 반환값을 변수에 담으면 함수명과 변수명이 동일한 형태가 되어 이름 충돌이 발생한다.

```tsx
// ❌ 충돌: 함수명과 변수명이 같은 패턴
const isOutOfStock = isOutOfStock(product)  // SyntaxError 또는 의도치 않은 재할당
const canAddToCart = canAddToCart(product, quantity)  // 같은 문제

// ❌ 어색한 회피: 변수명을 바꾸면 의미가 달라짐
const outOfStock = isOutOfStock(product)       // boolean인지 불분명
const addToCartPossible = canAddToCart(product) // 패턴이 깨짐
```

해결 방법은 두 가지다:

```tsx
// ✅ 방법 1: 인라인 사용 — 변수에 담지 않고 직접 사용
if (isOutOfStock(product)) {
  return <SoldOutBadge />
}

<Button disabled={!canAddToCart(product, quantity)}>장바구니 담기</Button>

// ✅ 방법 2: 주어를 변수명에 포함 — 함수명과 자연스럽게 분리
const isProductOutOfStock = isOutOfStock(selectedProduct)
const canUserCheckout = canCheckout(cart)
```

**가이드라인**: boolean 반환 함수는 가능한 한 **인라인으로 사용**(방법 1)한다. 변수에 담아야 할 때는 **주어를 붙여 구체화**(방법 2)한다.

---

### 6. 이벤트 핸들러 (Event Handler)

**사용자 인터랙션이나 시스템 이벤트에 응답하는 함수.** 프론트엔드에서 가장 빈번한 역할이다.

**핵심 원칙: `on___` 이벤트에 바인딩된 코드를 읽었을 때, "이 이벤트가 발생하면 어떤 액션이 일어나는가"를 즉시 예측할 수 있어야 한다.**

이를 달성하는 방법은 두 가지다:

#### 방법 1: 인라인으로 구체적 동작을 `on___`에 전달

이벤트 발생 시 무엇이 일어나는지가 JSX 선언부에서 바로 보인다.

```tsx
<button onClick={() => addToCart(product)}>장바구니 담기</button>
<button onClick={() => removeFromWishlist(product.id)}>위시리스트 삭제</button>
<input onChange={(e) => searchProducts(e.target.value)} />
<form onSubmit={(e) => {
  e.preventDefault()
  createOrder(new FormData(e.currentTarget))
}}>
```

인라인의 장점은 `on___={___}` 한 줄만 읽으면 이벤트→액션의 흐름이 완결된다는 것이다.

#### 방법 2: 함수로 추출할 때, 함수의 목적을 이름에 반영

인라인이 복잡해지면 함수를 추출한다. 이때 `handle` + 이벤트 타입이 아니라, **그 함수가 수행하는 동작의 목적**을 이름으로 사용한다.

```tsx
// ❌ handle + 이벤트 타입 — 정보량 0
//    "클릭하면 무언가가 일어난다" → 무엇이?
//    onClick에 할당되므로 "Click"은 이미 중복
onClick={handleClick}
onSubmit={handleSubmit}
onChange={handleChange}

// ✅ 동작의 목적이 이름 — 이벤트→액션이 즉시 예측 가능
//    "클릭하면 장바구니에 추가된다"
//    "제출하면 주문이 생성된다"
//    "변경하면 상품이 검색된다"
onClick={() => addToCart(product)}
onSubmit={createOrder}
onChange={searchProducts}
```

**정보이론적 근거**: `handle`은 "이벤트에 응답한다"는 의미인데, `onClick`에 할당되는 순간 이 정보는 이미 문맥에 존재한다. `handle`은 채널 용량만 차지할 뿐 새로운 정보를 전달하지 않는다. 반면 동작의 목적을 직접 사용하면, `on___(이벤트) = 동작(목적)`이라는 구조에서 **이벤트와 액션이 한 줄에 결합**되어 예측 가능성이 극대화된다.

#### 실무 예시

```tsx
function ProductPage({ product }: { product: Product }) {
  // 각 함수명이 곧 "무슨 일이 일어나는가"의 답
  function addToCart() {
    setCartItems((prev) => [...prev, { ...product, quantity: 1 }])
    showToast(`${product.name}이(가) 장바구니에 추가되었습니다`)
    trackAddToCart(product, 1)
  }

  function toggleFavorite() {
    setFavoriteIds((prev) => {
      const next = new Set(prev)
      next.has(product.id) ? next.delete(product.id) : next.add(product.id)
      return next
    })
  }

  function shareProduct() {
    copyShareLink(product.id)
  }

  // JSX에서 읽히는 흐름:
  // "클릭하면 장바구니에 추가된다", "클릭하면 즐겨찾기가 토글된다"
  return (
    <>
      <button onClick={addToCart}>장바구니 담기</button>
      <button onClick={toggleFavorite}>♡</button>
      <button onClick={shareProduct}>공유</button>
    </>
  )
}
```

#### `on___` props 인터페이스

`on___`은 컴포넌트의 props 인터페이스에서 **이벤트 발생 시점을 선언**한다. 이벤트를 정의하는 것이므로 `on___`은 유지한다.

```tsx
interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product) => void   // "장바구니 추가" 이벤트 발생 시
  onShare: (productId: string) => void      // "공유" 이벤트 발생 시
}

// 사용하는 측 — 동작 함수를 on___ 에 바인딩
<ProductCard
  product={product}
  onAddToCart={addToCart}
  onShare={() => shareProduct(product.id)}
/>
```

#### 이벤트 객체를 다루는 경우

이벤트 객체(`e`)를 직접 처리해야 할 때도 동일한 원칙을 적용한다: 인라인으로 이벤트 객체를 처리하거나, 추출한 함수에 목적을 반영한다.

```tsx
// 인라인 — 이벤트 객체에서 필요한 값을 추출한 후 동작 함수에 전달
<input onChange={(e) => searchProducts(e.target.value)} />
<form onSubmit={(e) => {
  e.preventDefault()
  createOrder(new FormData(e.currentTarget))
}}>

// 함수 추출 — 이벤트 처리가 복잡할 때, 목적을 이름에 반영
function interceptKeyboardShortcuts(e: KeyboardEvent) {
  if (e.key === 'Escape') closeModal()
  if (e.key === 'Enter' && e.metaKey) submitForm()
}

function fallbackToPlaceholder(e: SyntheticEvent<HTMLImageElement>) {
  e.currentTarget.src = PLACEHOLDER_IMAGE
}

<div onKeyDown={interceptKeyboardShortcuts} />
<img onError={fallbackToPlaceholder} />
```

---

### 7. 구독/관찰자 (Observer)

**외부 이벤트 소스를 구독하고, 발생 시 콜백을 실행하는 함수.** 이벤트 핸들러와 달리 "구독의 생명주기 관리"가 포함된다.

```tsx
// DOM 요소 관찰 — observe: 무한 스크롤, 레이지 로딩
function observeIntersection(
  element: HTMLElement,
  callback: (isIntersecting: boolean) => void,
  options?: IntersectionObserverInit,
): () => void {
  const observer = new IntersectionObserver(
    ([entry]) => callback(entry.isIntersecting),
    options,
  )
  observer.observe(element)
  return () => observer.disconnect()  // cleanup 반환
}

// 사용: useEffect 내에서 구독 → 언마운트 시 해제
useEffect(() => {
  if (!sentinelRef.current) return
  const unobserve = observeIntersection(sentinelRef.current, (isVisible) => {
    if (isVisible && hasNextPage) fetchNextPage()
  })
  return unobserve
}, [hasNextPage])

// 브라우저 이벤트 구독 — subscribe: 미디어 쿼리, 온라인 상태
function subscribeToMediaQuery(
  query: string,
  callback: (matches: boolean) => void,
): () => void {
  const mql = window.matchMedia(query)
  const handler = (e: MediaQueryListEvent) => callback(e.matches)
  mql.addEventListener('change', handler)
  callback(mql.matches)  // 초기값 전달
  return () => mql.removeEventListener('change', handler)
}

// 훅으로 래핑한 구독
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    return subscribeToMediaQuery(query, setMatches)
  }, [query])

  return matches
}

const isMobile = useMediaQuery('(max-width: 768px)')
```

**네이밍 패턴**:

| prefix | 언제 | 대상 | 예시 |
|--------|------|------|------|
| `observe___` | DOM 요소를 지속적으로 관찰 | IntersectionObserver, ResizeObserver, MutationObserver | `observeIntersection`, `observeResize` |
| `subscribeTo___` | 이벤트 스트림/상태 변화를 구독 | matchMedia, WebSocket, auth 상태, 외부 store | `subscribeToMediaQuery`, `subscribeToAuthState` |

```tsx
// observe — DOM API의 Observer 패턴과 직접 대응
const unobserve = observeIntersection(el, callback)   // IntersectionObserver 래핑
const unobserve = observeResize(el, callback)          // ResizeObserver 래핑

// subscribeTo — 브라우저/외부 이벤트 스트림 구독
const unsubscribe = subscribeToMediaQuery('(max-width: 768px)', callback)
const unsubscribe = subscribeToAuthState(callback)
```

**이벤트 핸들러와의 핵심 차이**: `observe`/`subscribeTo`는 **cleanup 함수를 반환**하여 구독 해제를 보장한다. 이벤트 핸들러는 단발성 응답이지만, 구독/관찰자는 생명주기를 가진다.

---

### 8. 초기화자 (Initializer)

**시스템, 모듈, 컴포넌트의 초기 상태를 설정하는 함수.** 앱 생명주기에서 한 번만 실행되는 경우가 많다.

```tsx
// 앱 초기화 — 진입점에서 한 번 실행
async function initializeApp() {
  const theme = getStoredTheme() ?? 'light'
  setTheme(theme)
  await setupAnalytics()
  registerServiceWorker()
}

// 라우터/프로바이더 설정
function setupMSW() {
  if (import.meta.env.DEV) {
    const { worker } = await import('./mocks/browser')
    await worker.start({ onUnhandledRequest: 'bypass' })
  }
}

// React lazy initializer — useState의 초기값을 계산
function createInitialFormState(product?: Product): ProductFormState {
  if (!product) return { name: '', price: 0, category: '', images: [] }
  return {
    name: product.name,
    price: product.price,
    category: product.category,
    images: product.images.map((img) => ({ url: img.url, isExisting: true })),
  }
}
const [formState, setFormState] = useState(() => createInitialFormState(product))

// 리셋 — 상태를 초기값으로 되돌림
function resetProductFilters() {
  setFilters(DEFAULT_FILTERS)
  setCurrentPage(1)
  setSortOrder('newest')
  setSearchQuery('')
}
```

**네이밍 패턴**:

| prefix | 언제 | 실행 시점 | 예시 |
|--------|------|----------|------|
| `initialize___` / `init___` | 앱/모듈의 핵심 시스템을 첫 설정 | 앱 진입점, 한 번만 | `initializeApp`, `initializeAnalytics` |
| `setup___` | 환경/도구/인프라를 구성 | 앱 부팅, 테스트 전 | `setupMSW`, `setupAnalytics` |
| `reset___` | 상태를 초기값으로 되돌림 | 사용자 액션 | `resetProductFilters`, `resetForm` |
| `createInitial___` | useState의 lazy initializer용 초기값을 계산 | 컴포넌트 마운트 | `createInitialFormState` |

```tsx
// initialize — 앱의 핵심 기능을 "처음 켜는" 행위
await initializeApp()                // 테마, 분석, SW 등 앱 전체 초기화

// setup — 특정 도구/환경을 "구성하는" 행위
await setupMSW()                     // MSW 워커 설정 (initialize보다 범위가 좁음)

// reset — 사용자가 "처음 상태로 돌아가기"를 요청
resetProductFilters()                // 필터, 정렬, 검색어 모두 기본값으로

// createInitial — useState(() => createInitial___(args)) 패턴
const [form, setForm] = useState(() => createInitialFormState(product))
```

**`initialize` vs `setup` 판단 기준**: `initialize`는 앱/모듈의 **핵심 시스템 전체를 첫 설정**하는 상위 개념. `setup`은 특정 도구나 환경을 **구성하는** 하위 행위. `initializeApp` 내부에서 `setupAnalytics`, `setupMSW` 등을 호출하는 관계.

---

### 9. 합성자 (Composer)

**여러 함수나 동작을 조합하여 새로운 함수/동작을 만드는 함수.** 고차 함수(Higher-Order Function)가 대부분이다.

```tsx
// 커리 — create/make + 명사: 설정을 받아 특화된 함수를 반환
function createFetcher(baseUrl: string) {
  return async function fetchEndpoint<T>(path: string): Promise<T> {
    const response = await fetch(`${baseUrl}${path}`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return response.json()
  }
}
const apiFetch = createFetcher(import.meta.env.VITE_API_URL)
const product = await apiFetch<Product>('/products/123')

// 이벤트 핸들러 팩토리 — 반복되는 핸들러 패턴을 커리로 추출
function createSortHandler(setSortBy: (key: string) => void) {
  return (columnKey: string) => () => setSortBy(columnKey)
}
const sortBy = createSortHandler(setSortBy)

<th onClick={sortBy('price')}>가격</th>
<th onClick={sortBy('name')}>상품명</th>
<th onClick={sortBy('date')}>등록일</th>

// 스타일 팩토리 — 테마/변형을 받아 스타일 함수를 반환
function createVariantClass(base: string) {
  return (variant: 'primary' | 'secondary' | 'danger') =>
    `${base} ${base}--${variant}`
}
const buttonClass = createVariantClass('btn')
// buttonClass('primary') → 'btn btn--primary'

// with___ — 기존 함수에 공통 동작을 래핑
function withLoading<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  setIsLoading: (v: boolean) => void,
): T {
  return (async (...args: Parameters<T>) => {
    setIsLoading(true)
    try { return await fn(...args) }
    finally { setIsLoading(false) }
  }) as T
}

const submitWithLoading = withLoading(submitOrder, setIsSubmitting)

// debounce — 검색 입력 등에서 불필요한 호출을 줄임
const debouncedSearch = useMemo(
  () => debounce((query: string) => fetchSearchResults(query), 300),
  [],
)
```

**네이밍 패턴**:

| 패턴 | 언제 | 반환 | 예시 |
|------|------|------|------|
| `create___` (커리) | 설정을 받아 특화된 함수를 만듦 | 함수 | `createFetcher`, `createSortHandler` |
| `with___` | 기존 함수에 공통 동작을 감쌈 | 래핑된 함수 | `withLoading`, `withAuth` |
| 유틸리티 이름 | 널리 알려진 FP 패턴 | 함수 | `debounce`, `throttle`, `memoize` |

```tsx
// create___ (커리) — "설정을 주면 그에 맞는 함수를 만들어 줄게"
const apiFetch = createFetcher(baseUrl)       // baseUrl이 고정된 fetch 함수 반환
const sortByPrice = createSortHandler(setSortBy)  // setter가 고정된 핸들러 반환

// with___ — "이 함수를 감싸서 추가 동작을 붙여줄게"
const submitWithLoading = withLoading(submitOrder, setIsSubmitting)
// → submitOrder 실행 전후로 setIsSubmitting(true/false) 자동 호출

// 유틸리티 — 이미 업계 표준으로 통용되는 이름
const debouncedSearch = debounce(fetchSearchResults, 300)
```

**`create___` (커리) vs `create___` (생성자) 구분**: 같은 `create___` prefix지만 **반환값이 함수이면 합성자(커리)**, **데이터이면 생성자**. `createFetcher` → 함수 반환(합성자), `createToast` → 객체 반환(생성자). 문맥상 혼동이 없으면 별도 구분 없이 `create___`를 사용한다.

**`create___` vs `with___` 판단 기준**: `create___`는 설정을 받아 **새로운 함수를 처음부터 만든다**. `with___`는 **이미 존재하는 함수를 받아서 감싼다**. `createFetcher(baseUrl)` — baseUrl로 새 함수 생성. `withLoading(submitOrder)` — 기존 submitOrder를 래핑.

---

### 10. 부수효과 실행자 (Side-Effect Runner)

**외부 시스템과 상호작용하여 부수효과를 발생시키는 함수.** 분석 이벤트 전송, 로깅, 클립보드 조작, 알림 표시 등.

```tsx
// 분석 이벤트 전송 — track
function trackAddToCart(product: Product, quantity: number) {
  analytics.track('add_to_cart', {
    productId: product.id,
    productName: product.name,
    price: product.price,
    quantity,
  })
}

function trackPageView(pathname: string) {
  analytics.page({ path: pathname, title: document.title, referrer: document.referrer })
}

// UI 피드백 표시 — show
function showToast(message: string, type: ToastType = 'info') {
  toastStore.add({ id: crypto.randomUUID(), message, type, duration: 3000 })
}

function showConfirmDialog(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    dialogStore.open({ message, onConfirm: () => resolve(true), onCancel: () => resolve(false) })
  })
}

// 클립보드 조작 — copy
async function copyShareLink(productId: string) {
  const url = `${window.location.origin}/products/${productId}`
  await navigator.clipboard.writeText(url)
  showToast('링크가 복사되었습니다')
}

// DOM 조작 — scroll, focus
function scrollToTop(behavior: ScrollBehavior = 'smooth') {
  window.scrollTo({ top: 0, behavior })
}

function focusFirstError(formRef: RefObject<HTMLFormElement | null>) {
  const firstError = formRef.current?.querySelector('[aria-invalid="true"]')
  if (firstError instanceof HTMLElement) firstError.focus()
}

// 에러 리포트 — log/report
function logError(error: Error, context?: Record<string, unknown>) {
  console.error(error)
  Sentry.captureException(error, { extra: context })
}
```

**네이밍 패턴**: 동사가 부수효과를 직접 묘사한다. 반환값보다 **수행하는 행위**가 핵심이다.

| prefix | 부수효과 | 대상 | 예시 |
|--------|----------|------|------|
| `track___` | 분석 이벤트 전송 | 외부 분석 서비스 (GA, Mixpanel) | `trackAddToCart`, `trackPageView` |
| `show___` | UI 피드백 표시 | 토스트, 다이얼로그, 알림 | `showToast`, `showConfirmDialog` |
| `copy___` | 클립보드 쓰기 | Clipboard API | `copyShareLink`, `copyOrderNumber` |
| `scroll___` | 스크롤 위치 이동 | Window, Element | `scrollToTop`, `scrollToSection` |
| `focus___` | DOM 포커스 이동 | HTMLElement | `focusFirstError`, `focusSearchInput` |
| `log___` | 에러/디버그 로그 기록 | console, Sentry | `logError`, `logApiResponse` |
| `report___` | 구조화된 리포트 전송 | 에러 추적 서비스 | `reportCrash`, `reportPerformance` |

```tsx
// track — 사용자 행동 분석 (비즈니스 이벤트)
trackAddToCart(product, quantity)          // GA에 add_to_cart 이벤트 전송

// show — 사용자에게 피드백 표시
showToast('저장되었습니다')                 // 토스트 알림 띄움

// copy — 클립보드에 쓰기
await copyShareLink(product.id)           // URL을 클립보드에 복사

// scroll / focus — DOM 위치 제어
scrollToTop()                             // 페이지 최상단으로 스크롤
focusFirstError(formRef)                  // 첫 번째 에러 필드에 포커스

// log vs report — log는 로컬 디버깅 중심, report는 외부 서비스 전송 중심
logError(error)                           // console.error + Sentry 기록
reportPerformance(metrics)               // 성능 지표를 모니터링 서비스에 전송
```

---

## 역할의 조합이 프론트엔드 패턴을 특징짓는다

함수 역할의 조합으로 코드 영역의 패턴을 즉시 파악할 수 있다:

| 역할 조합 | 패턴 | 예시 |
|-----------|------|------|
| 조회자 + 변환자 | API 레이어 | `fetchUser` → `normalizeUser` |
| 이벤트 핸들러 + 검증자 + 변경자 | 폼 제출 | `createOrder` → `validateForm` → `updateProfile` |
| 이벤트 핸들러 + 부수효과 실행자 | 사용자 추적 | `addToCart` → `trackAddToCart` |
| 조회자 + 초기화자 | 앱 부팅 | `fetchConfig` → `initializeApp` |
| 합성자 + 조회자 | 인증된 API 호출 | `withAuth(fetchUserProfile)` |
| 구독자 + 이벤트 핸들러 | 실시간 업데이트 | `subscribeToChanges` → `applyUpdate` |

### 통합 예시: 상품 상세 페이지

```tsx
// --- API / 조회자 ---
async function fetchProductDetail(productId: string): Promise<ApiProduct> { ... }

// --- 변환자 ---
function selectProductView(data: ApiProduct): ProductView {
  return {
    ...data,
    priceLabel: formatPrice(data.price),
    discountLabel: data.discountRate > 0 ? `-${data.discountRate}%` : undefined,
    thumbnails: data.images.map((img) => img.thumbnailUrl),
  }
}

// --- 검증자 ---
function canAddToCart(product: ProductView, quantity: number): boolean {
  return product.stock > 0 && quantity <= product.maxQuantity
}

// --- TanStack Query + select ---
const { data: product, isLoading } = useQuery({
  queryKey: ['product', productId],
  queryFn: () => fetchProductDetail(productId),
  select: selectProductView,
})

// --- 이벤트 핸들러 ---
function addToCart() {
  if (!product || !canAddToCart(product, quantity)) return
  addCartItem(product.id, quantity)           // 변경자
  showToast('장바구니에 추가되었습니다')        // 부수효과 실행자
  trackAddToCart(product, quantity)            // 부수효과 실행자
}

function shareProduct() {
  copyShareLink(product.id)                   // 부수효과 실행자
}

// --- 렌더링 ---
<Button onClick={addToCart} disabled={!canAddToCart(product, quantity)}>
  장바구니 담기
</Button>
<Button variant="ghost" onClick={shareProduct}>공유</Button>
```

---

## 변수 역할과의 관계

함수의 역할은 그 함수가 다루는 변수의 역할과 밀접하게 연결된다:

| 함수 역할 | 관련 변수 역할 | 패턴 |
|-----------|---------------|------|
| 조회자 (fetch) | 최근값 보유자 (data) + 플래그 (isLoading) | `const { data, isLoading } = useQuery(fetchUser)` |
| 변경자 (set/update) | 최근값 보유자 (state) | `setState(newValue)` |
| 변환자 (sort/filter) | 조직자 (sortedItems) | `const sorted = sortItems(items)` |
| 이벤트 핸들러 (동작명) | 컨테이너 (items) + 모집자 (total) | `addItem` → `items[]` 변경 → `total` 재계산 |
| 검증자 (validate) | 플래그 (isValid) | `const isValid = validateForm(values)` |
| 구독자 (observe) | 추적자 (prevValue) + 최근값 보유자 (currentValue) | `observe(el, (current) => { compare(prev, current) })` |

---

## 레퍼런스

- [변수 역할 프레임워크](./02-variable-naming-framework.md) — 변수 역할 분류와 인지과학적 근거
- [함수 인터페이스 패턴](./04-function-interface-pattern.md) — (primary, options?) 시그니처와 default 값 원칙
- [변수명 요구사항](./01-naming-convention.md) — R-M2 함수 동사 prefix 규칙
