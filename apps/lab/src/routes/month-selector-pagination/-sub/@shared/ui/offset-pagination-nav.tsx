import { ChevronsLeft, ChevronsRight } from 'lucide-react'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@fe-lab/ui/components/pagination'

export function OffsetPaginationNav({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}) {
  const isFirst = currentPage === 1
  const isLast = currentPage === totalPages

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>, page: number) {
    e.preventDefault()
    onPageChange(page)
  }

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationLink
            href="#"
            size="default"
            onClick={(e) => handleClick(e, 1)}
            aria-label="첫 페이지"
            aria-disabled={isFirst}
            className={isFirst ? 'pointer-events-none opacity-50' : ''}
          >
            <ChevronsLeft className="size-4" />
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            text="이전"
            onClick={(e) => handleClick(e, Math.max(1, currentPage - 1))}
            aria-disabled={isFirst}
            className={isFirst ? 'pointer-events-none opacity-50' : ''}
          />
        </PaginationItem>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              href="#"
              isActive={page === currentPage}
              onClick={(e) => handleClick(e, page)}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            href="#"
            text="다음"
            onClick={(e) => handleClick(e, Math.min(totalPages, currentPage + 1))}
            aria-disabled={isLast}
            className={isLast ? 'pointer-events-none opacity-50' : ''}
          />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink
            href="#"
            size="default"
            onClick={(e) => handleClick(e, totalPages)}
            aria-label="마지막 페이지"
            aria-disabled={isLast}
            className={isLast ? 'pointer-events-none opacity-50' : ''}
          >
            <ChevronsRight className="size-4" />
          </PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
