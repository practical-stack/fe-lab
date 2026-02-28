import { CodeBlock } from "~/@lib/ui/common/code-block";
import { useOffsetPagination } from "./offset-demo.helper";
import { TransactionTable } from "./@shared/ui/transaction-table";
import { OffsetPaginationNav } from "./@shared/ui/offset-pagination-nav";
import { DesignCallout } from "./@shared/ui/design-callout";

export function OffsetDemo() {
  const { items, totalPages, currentPage, setCurrentPage, isStale } =
    useOffsetPagination();

  return (
    <div className="space-y-6">
      <DesignCallout title="Design Decisions">
        <ul>
          <li>
            서버가 totalCount를 반환 → 전체 페이지 수 계산 가능 → 페이지 번호 UI
          </li>
          <li>
            <code className="rounded bg-blue-100 px-1 text-xs">
              placeholderData: keepPreviousData
            </code>
            로 페이지 전환 시 이전 데이터 유지
          </li>
          <li>
            <code className="rounded bg-blue-100 px-1 text-xs">
              isPlaceholderData
            </code>
            로 반투명 전환 효과
          </li>
        </ul>
      </DesignCallout>

      <div>
        <h4 className="mb-2 text-xs font-semibold text-gray-500 uppercase">
          Server Response Shape
        </h4>
        <div className="rounded-lg border border-gray-200 bg-white">
          <CodeBlock code={RESPONSE_SHAPE} />
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-xs font-semibold text-gray-500 uppercase">
          Live Demo
        </h4>
        <div className="space-y-4">
          <TransactionTable items={items} isStale={isStale} />
          <OffsetPaginationNav
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      <div>
        <h4 className="mb-2 text-xs font-semibold text-gray-500 uppercase">
          Implementation
        </h4>
        <div className="rounded-lg border border-gray-200 bg-white">
          <CodeBlock code={IMPLEMENTATION_CODE} />
        </div>
      </div>
    </div>
  );
}

const RESPONSE_SHAPE = `// GET /api/transactions?page=1&size=5
{
  items: TransactionItem[],
  totalCount: 23,   // → Math.ceil(23/5) = 5 pages
  page: 1,
  size: 5
}`;

const IMPLEMENTATION_CODE = `const [currentPage, setCurrentPage] = useState(1)

const { data, isPlaceholderData } = useQuery({
  ...offsetQueryOptions(currentPage),
  placeholderData: keepPreviousData, // ← v5 API
})

const totalPages = Math.ceil(data.totalCount / PAGE_SIZE)

// 테이블에 isStale 전달 → opacity 전환
<TransactionTable
  items={data.items}
  isStale={isPlaceholderData}
/>

// Pagination 컴포넌트
<PaginationLink
  isActive={page === currentPage}
  onClick={(e) => {
    e.preventDefault()
    setCurrentPage(page)
  }}
>
  {page}
</PaginationLink>`;
