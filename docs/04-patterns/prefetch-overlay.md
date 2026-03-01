# Prefetch + Overlay 패턴

## 요구사항

> 버튼 클릭 시 바텀시트(오버레이)가 열리면서 서버 데이터를 보여줘야 한다.
> 그런데 두 가지 접근 모두 문제가 있다:

### Eager Fetch: 페이지에서 미리 fetch → 첫 화면이 느리다

페이지 마운트 시 `useQuery`로 바텀시트용 데이터를 즉시 호출하면, 데이터가 올 때까지 **페이지 자체에 Skeleton이 표시**된다.
약관과 무관한 메인 콘텐츠(헤더, 일러스트, 안내 문구)까지 가려지면서 첫 화면 렌더링이 ~800ms 지연된다.

```
페이지 마운트 → Skeleton (~800ms) → 버튼 표시 → Sheet 즉시
                 ↑ 약관과 무관한 UI까지 전부 가려짐
```

### Lazy Fetch: Sheet 내부에서 fetch → 열 때마다 로딩

페이지에는 로딩이 없지만, Sheet 내부에서 API를 호출하면 **열릴 때마다 Skeleton**이 보인다.
"시작하기 클릭 → 빈 Sheet → Skeleton → 데이터" 3단계를 거친다.

```
페이지 즉시 표시 → 버튼 클릭 → Sheet 열림 → Skeleton (~800ms) → 약관 목록
```

## 핵심 아이디어

페이지 마운트 시 `PrefetchQuery`로 바텀시트에 필요한 데이터를 **캐시에 미리 저장**해두고,
바텀시트 내부에서는 `SuspenseQuery`로 **캐시 HIT** → Skeleton 스킵 → 즉시 렌더링.

```
페이지 마운트 ──→ PrefetchQuery (UI 없음, 캐시 저장)
                     │
버튼 클릭 ───────→ overlay.open(BottomSheet)
                     │
바텀시트 내부 ───→ SuspenseQuery (캐시 HIT → 즉시 렌더링)
```

## 구현 포인트

### 1. queryOptions를 한 곳에 정의하여 Prefetch/Suspense 간 캐시 키 일치 보장

```typescript
// terms.helper.ts
export const termsQueryOptions = (caseType: string) =>
  queryOptions({
    queryKey: ['terms', caseType],
    queryFn: () => fetchTerms(caseType),
  })
```

### 2. Prefetch 래퍼: Fragment로 감싸서 기존 DOM 구조에 영향 없음

```typescript
export const TermsPrefetchQuery = ({ caseType, children }) => (
  <>
    <PrefetchQuery {...termsQueryOptions(caseType)} />
    {children}
  </>
)
```

### 3. Suspense 래퍼: 캐시 HIT 시 fallback 스킵, MISS 시 Skeleton 표시

```typescript
export const TermsSuspenseQuery = ({ caseType, fallback, children }) => (
  <Suspense fallback={fallback}>
    <SuspenseQuery {...termsQueryOptions(caseType)}>
      {({ data }) => children(data)}
    </SuspenseQuery>
  </Suspense>
)
```

### 4. 페이지에서 조합: Prefetch는 트리거 버튼 가까이에 배치

```typescript
<TermsPrefetchQuery caseType="TERMS_CASE_A">
  <FloatingButton onClick={() => overlay.open(TermsBottomSheet)} />
</TermsPrefetchQuery>
```

### 5. Chained Prefetch: 바텀시트 마운트 시 다음 페이지 데이터도 미리 캐싱

```typescript
const TermsBottomSheet = () => (
  <>
    <PrefetchQuery {...nextPageQueryOptions()} />  {/* 다음 화면 데이터 미리 캐싱 */}
    <BottomSheet>
      <TermsSuspenseQuery caseType="TERMS_CASE_A" fallback={<Skeleton />}>
        {(data) => <TermsList data={data} />}
      </TermsSuspenseQuery>
    </BottomSheet>
  </>
)
```

## 설계 원칙

| 원칙 | 설명 |
|------|------|
| Co-located Prefetch | Prefetch를 페이지 최상단이 아닌, 소비하는 곳(트리거 버튼) 바로 옆에 배치 |
| Fragment Wrapper | `<>...</>` 래핑으로 기존 DOM 구조/스타일에 영향 없음 |
| 방어적 Fallback | Prefetch 성공을 가정하지 않고, SuspenseQuery에 항상 Skeleton fallback 선언 |
| queryOptions 단일 정의 | Prefetch와 Suspense가 동일한 queryOptions를 스프레드하여 캐시 키 불일치 방지 |

## 기술 스택

- `@suspensive/react-query` — `PrefetchQuery`, `SuspenseQuery`
- `@tanstack/react-query` — `queryOptions`, `QueryClient` 캐시
- `overlay-kit` — `overlay.open()` 오버레이 관리

---

## 구현 예제

- **라이브 데모**: [`/prefetch-overlay`](http://localhost:4200/prefetch-overlay)
- **소스 코드**: [`apps/lab/src/routes/prefetch-overlay/`](../../apps/lab/src/routes/prefetch-overlay/)
  - `index.tsx` — 메인 페이지 (Problem/Solution 비교)
  - `solution-demo.tsx` — PrefetchQuery + SuspenseQuery 조합 예제
  - `problem-demo.tsx` — Prefetch 없이 바텀시트 열 때 로딩 발생하는 예제
  - `problem-eager-demo.tsx` — 페이지 마운트 시 즉시 fetch하는 (불필요한 로딩) 예제
  - `-sub/@shared/api/terms.helper.ts` — queryOptions 정의 및 Prefetch/Suspense 래퍼
  - `-sub/@shared/ui/terms/` — 약관 UI 컴포넌트 및 Skeleton
