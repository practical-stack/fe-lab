import { useInfiniteQuery } from '@tanstack/react-query'
import { Button } from '@fe-lab/ui/components/button'
import { Loader2 } from 'lucide-react'
import { CodeBlock } from '~/@lib/ui/common/code-block'
import { cursorInfiniteQueryOptions } from './@shared/api/cursor-api'
import { TransactionTable } from './@shared/ui/transaction-table'
import { DesignCallout } from './@shared/ui/design-callout'

export function CursorDemo() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery(
    cursorInfiniteQueryOptions(),
  )

  const allItems = data?.pages.flatMap((page) => page.items) ?? []

  return (
    <div className="space-y-6">
      <DesignCallout title="Design Decisions">
        <ul>
          <li>서버가 nextCursor + hasNext 반환 → 전체 수량 모름 → 페이지 번호 불가</li>
          <li>
            <code className="rounded bg-blue-100 px-1 text-xs">useInfiniteQuery</code> +{' '}
            <code className="rounded bg-blue-100 px-1 text-xs">getNextPageParam</code>으로 커서 관리
          </li>
          <li>
            <code className="rounded bg-blue-100 px-1 text-xs">data.pages.flatMap()</code>으로 누적 데이터
            평탄화
          </li>
          <li>"더 보기" 버튼 패턴 — 무한 스크롤 대비 사용자 제어 가능</li>
        </ul>
      </DesignCallout>

      <div>
        <h4 className="mb-2 text-xs font-semibold text-gray-500 uppercase">Server Response Shape</h4>
        <div className="rounded-lg border border-gray-200 bg-white">
          <CodeBlock code={RESPONSE_SHAPE} />
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-xs font-semibold text-gray-500 uppercase">Live Demo</h4>
        <div className="space-y-4">
          <TransactionTable items={allItems} />
          <div className="flex flex-col items-center gap-2">
            {hasNextPage && (
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    로딩 중...
                  </>
                ) : (
                  '더 보기'
                )}
              </Button>
            )}
            <p className="text-xs text-gray-400">
              {allItems.length}건 로드됨
              {!hasNextPage && allItems.length > 0 && ' · 모든 데이터를 불러왔습니다'}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h4 className="mb-2 text-xs font-semibold text-gray-500 uppercase">Implementation</h4>
        <div className="rounded-lg border border-gray-200 bg-white">
          <CodeBlock code={IMPLEMENTATION_CODE} />
        </div>
      </div>
    </div>
  )
}

const RESPONSE_SHAPE = `// GET /api/transactions?cursor=null&limit=5
{
  items: TransactionItem[],
  nextCursor: "5",     // 다음 요청에 전달할 커서
  hasNext: true        // 더 있는지 여부
}

// GET /api/transactions?cursor=5&limit=5
{
  items: TransactionItem[],
  nextCursor: "10",
  hasNext: true
}`

const IMPLEMENTATION_CODE = `const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = useInfiniteQuery({
  queryKey: ['transactions', 'cursor'],
  queryFn: ({ pageParam }) => fetchCursorPage(pageParam),
  initialPageParam: null,
  getNextPageParam: (lastPage) => lastPage.nextCursor,
})

// 모든 페이지의 items를 하나로 평탄화
const allItems = data.pages.flatMap((page) => page.items)

// "더 보기" 버튼
<Button
  onClick={() => fetchNextPage()}
  disabled={isFetchingNextPage}
>
  {isFetchingNextPage ? '로딩 중...' : '더 보기'}
</Button>`
