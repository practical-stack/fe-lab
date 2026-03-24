import { useState, useEffect } from 'react'
import { gqlFetch } from '../@shared/graphql-client'

type Post = { title: string; author: { name: string } }

/**
 * Problem: Manual offset pagination with full page replacement.
 * No incremental loading, no cursor stability.
 */
export function PaginationProblemDemo() {
  const [posts, setPosts] = useState<Post[]>([])
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const pageSize = 5

  useEffect(() => {
    setLoading(true)
    // Simulate offset pagination — GraphQL doesn't have native offset, so we use cursor but
    // demonstrate the "replace entire list" antipattern
    gqlFetch<{
      posts: {
        edges: Array<{ node: Post }>
        totalCount: number
      }
    }>(
      `query($first: Int) {
        posts(first: $first) {
          edges { node { title author { name } } }
          totalCount
        }
      }`,
      { first: pageSize * (page + 1) },
    ).then((res) => {
      // Only show current page's items
      const allPosts = res.data.posts.edges.map((e) => e.node)
      setPosts(allPosts.slice(page * pageSize, (page + 1) * pageSize))
      setTotal(res.data.posts.totalCount)
      setLoading(false)
    })
  }, [page])

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="space-y-3">
      <div className="rounded border border-red-100 bg-red-50/50 px-2 py-1 text-[10px] text-red-600">
        수동 오프셋 페이지네이션 — 페이지 전환 시 전체 리스트 교체
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center text-xs text-gray-400">
          <div className="h-3 w-3 animate-spin rounded-full border border-gray-300 border-t-blue-500" />
          <span className="ml-2">Loading page {page + 1}...</span>
        </div>
      ) : (
        <div className="space-y-1.5">
          {posts.map((post, i) => (
            <div key={i} className="flex items-center justify-between rounded border border-gray-100 bg-white px-3 py-2">
              <div>
                <p className="text-xs font-medium text-gray-800">{post.title}</p>
                <p className="text-[10px] text-gray-400">by {post.author.name}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Page buttons */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-gray-400">{total} posts total</span>
        <div className="flex gap-1">
          {Array.from({ length: Math.min(totalPages, 4) }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`rounded px-2 py-1 text-xs ${
                page === i
                  ? 'bg-blue-500 text-white'
                  : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-md border border-red-200 bg-red-50 p-3 text-[11px] text-red-700">
        <p className="font-semibold">문제점</p>
        <ul className="mt-1 space-y-0.5">
          <li>• 페이지 전환 시 기존 데이터가 사라지고 새 데이터로 완전 교체됨</li>
          <li>• 중간에 항목이 추가/삭제되면 offset이 밀려서 항목이 중복되거나 누락됨</li>
          <li>• "더 보기"(infinite scroll) 패턴 구현 시 수동 상태 관리가 복잡함</li>
          <li>• 각 페이지 데이터를 별도 관리해야 해서 캐시 무효화가 어려움</li>
        </ul>
      </div>
    </div>
  )
}
