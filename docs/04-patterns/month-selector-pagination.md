# 월 선택 + 페이지네이션 패턴

## 요구사항

> 월별 내역 조회(송금, 결제, 거래 등) 화면에서 **월 네비게이션**과 **페이지네이션** 두 축의 네비게이션이 필요하다.
> 월이 바뀌면 페이지가 1로 리셋되어야 하고, 페이지 전환 시 빈 화면이 아닌 이전 데이터를 유지하며 자연스러운 전환 UX를 제공하고 싶다.

## 핵심 아이디어

두 개의 독립 상태(`selectedMonthIndex`, `currentPage`)를 관리하되,
**월 변경 시 페이지를 1로 리셋하는 연동 로직**을 하나의 함수에서 동기적으로 처리한다.
`keepPreviousData: true`로 전환 시 이전 데이터를 반투명으로 유지하여 맥락 보존.

```
상태 구조:
  selectedMonthIndex ──→ MONTH_OPTIONS[index]에서 startDate/endDate 결정
  currentPage ────────→ 해당 월 내에서의 페이지 번호

연동:
  월 변경 시 → currentPage를 1로 리셋
  페이지 변경 시 → selectedMonthIndex 유지

API:
  useQuery({
    queryKey: [key, startDate, endDate, currentPage],
    keepPreviousData: true,
  })
```

## 구현 포인트

### 1. 월 목록 생성 — 컴포넌트 외부 상수로 1회만 생성

```typescript
const MONTH_OPTIONS = generateMonthOptions() // 모듈 로드 시 1회

function generateMonthOptions(today = new Date()): MonthOption[] {
  // 현재 월부터 12개월 전까지 배열 생성
  // 인덱스 0 = 최신 월, 마지막 = 가장 오래된 월
}
```

### 2. 이중 상태 + 월-페이지 연동

```typescript
const [selectedMonthIndex, setSelectedMonthIndex] = useState(0)
const [currentPage, setCurrentPage] = useState(1)

const navigateMonth = (direction: 'prev' | 'next') => {
  setSelectedMonthIndex(prev => /* 방향에 따라 인덱스 이동 */)
  setCurrentPage(1) // 핵심: 월 변경 시 항상 페이지 리셋
}
```

### 3. queryKey에 모든 필터 조건 포함 + keepPreviousData

```typescript
const { data, isPreviousData } = useQuery({
  queryKey: ['items', startDate, endDate, currentPage],
  queryFn: () => listItems({ startDate, endDate, pageNum: currentPage - 1 }),
  keepPreviousData: true,
})
```

### 4. isPreviousData로 전환 UX

```tsx
<div style={{ opacity: isPreviousData ? 0.6 : 1 }}>
  <DataTable records={records} />
</div>
```

### 5. 반응형 페이지네이션 (Desktop 전체 / Mobile 슬라이딩 윈도우)

```typescript
// Desktop: 전체 페이지 번호 표시
// Mobile: 현재 페이지 기준 최대 3개만 표시 (슬라이딩 윈도우)
const mobileVisiblePages = useMemo(() => {
  let start = Math.max(1, currentPage - 1)
  start = Math.min(start, totalPages - 2)
  return Array.from({ length: 3 }, (_, i) => start + i)
}, [currentPage, totalPages])
```

## 설계 원칙

| 원칙 | 설명 |
|------|------|
| 월-페이지 동기 리셋 | `navigateMonth` 한 함수에서 `setMonthIndex` + `setCurrentPage(1)`을 동기적으로 처리. useEffect 연동 금지 |
| queryKey 완전 포함 | `startDate`, `endDate`, `currentPage` 모두 queryKey에 포함하여 월+페이지별 캐시 분리 |
| keepPreviousData | 전환 시 빈 화면 대신 이전 데이터를 반투명으로 유지하여 맥락 보존 |
| UI 1-based / API 0-based | 변환 포인트는 queryFn 내부 한 곳으로 제한 |
| 외부 상수 | `MONTH_OPTIONS`를 컴포넌트 외부에서 1회 생성하여 불필요한 재계산 방지 |

## 기술 스택

- `@tanstack/react-query` — `useQuery`, `keepPreviousData`, `isPreviousData`
- `date-fns` — `startOfMonth`, `endOfMonth`, `subMonths`, `format`

---

## 구현 예제

- **라이브 데모**: [`/month-selector-pagination`](http://localhost:4200/month-selector-pagination)
- **소스 코드**: [`apps/lab/src/routes/month-selector-pagination/`](../../apps/lab/src/routes/month-selector-pagination/)
  - `index.tsx` — 메인 페이지 (Offset / Cursor / 월+Offset 탭)
  - `month-offset-demo.tsx` — 월 선택 + 페이지네이션 조합 데모
  - `offset-demo.tsx` — 기본 Offset 페이지네이션 데모
  - `cursor-demo.tsx` — Cursor 기반 페이지네이션 데모
  - `-sub/@shared/api/` — 페이지네이션 타입별 API 헬퍼 및 목 데이터
  - `-sub/@shared/ui/` — 트랜잭션 테이블, 페이지네이션 내비 UI
  - `-sub/month-offset-demo.helper/` — 월+Offset 커스텀 훅 및 월 옵션 로직
