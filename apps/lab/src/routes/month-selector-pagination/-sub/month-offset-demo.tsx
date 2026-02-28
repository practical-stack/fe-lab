import { CodeBlock } from '~/@lib/ui/common/code-block'
import { useMonthOffsetPagination } from './month-offset-demo.helper'
import { TransactionTable } from './@shared/ui/transaction-table'
import { MonthNavigator } from './month-offset-demo.ui'
import { OffsetPaginationNav } from './@shared/ui/offset-pagination-nav'
import { DesignCallout } from './@shared/ui/design-callout'

export function MonthOffsetDemo() {
  const {
    items,
    totalCount,
    totalPages,
    currentPage,
    setCurrentPage,
    isStale,
    months,
    selectedMonth,
    selectedMonthIndex,
    isFirstMonth,
    isLastMonth,
    navigateMonth,
    selectMonth,
  } = useMonthOffsetPagination()

  return (
    <div className="space-y-6">
      <DesignCallout title="Design Decisions">
        <ul>
          <li>
            이중 상태: <code className="rounded bg-blue-100 px-1 text-xs">selectedMonthIndex</code> +{' '}
            <code className="rounded bg-blue-100 px-1 text-xs">currentPage</code>
          </li>
          <li>
            월 변경 시 <code className="rounded bg-blue-100 px-1 text-xs">setCurrentPage(1)</code> 동기 리셋
            — useEffect 대신 이벤트 핸들러에서 직접 처리
          </li>
          <li>
            queryKey에 <code className="rounded bg-blue-100 px-1 text-xs">startDate, endDate, page</code>{' '}
            모두 포함 → 월+페이지 조합별 캐시 분리
          </li>
          <li>MONTH_OPTIONS를 컴포넌트 외부 상수로 선언 → 리렌더링마다 재생성 방지</li>
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
          <div className="flex items-center justify-between">
            <MonthNavigator
              label={selectedMonth.label}
              months={months}
              selectedIndex={selectedMonthIndex}
              onPrev={() => navigateMonth('next')}
              onNext={() => navigateMonth('prev')}
              onFirst={() => selectMonth(0)}
              onLast={() => selectMonth(months.length - 1)}
              onSelect={selectMonth}
              isPrevDisabled={isFirstMonth}
              isNextDisabled={isLastMonth}
            />
            <span className="text-xs text-gray-400">
              {totalCount > 0 ? `총 ${totalCount}건` : ''}
            </span>
          </div>

          <TransactionTable items={items} isStale={isStale} />

          <OffsetPaginationNav
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
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

const RESPONSE_SHAPE = `// GET /api/transactions?startDate=2025-03-01&endDate=2025-03-31&page=1&size=5
{
  items: TransactionItem[],
  totalCount: 23,
  page: 1,
  size: 5
}`

const IMPLEMENTATION_CODE = `const MONTH_OPTIONS = generateMonthOptions() // 컴포넌트 외부 상수

function MonthOffsetDemo() {
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)

  const selectedMonth = MONTH_OPTIONS[selectedMonthIndex]

  // 월 변경 시 페이지 동기 리셋
  function navigateMonth(direction: 'prev' | 'next') {
    setSelectedMonthIndex(prev => {
      if (direction === 'next' && prev > 0) return prev - 1
      if (direction === 'prev' && prev < MONTH_OPTIONS.length - 1) return prev + 1
      return prev
    })
    setCurrentPage(1) // ← 핵심: 이벤트 핸들러에서 동기적으로 리셋
  }

  const { data, isPlaceholderData } = useQuery({
    ...monthOffsetQueryOptions(
      selectedMonth.startDate,
      selectedMonth.endDate,
      currentPage,
    ),
    placeholderData: keepPreviousData,
  })

  const totalPages = Math.ceil(data.totalCount / PAGE_SIZE)
}`
