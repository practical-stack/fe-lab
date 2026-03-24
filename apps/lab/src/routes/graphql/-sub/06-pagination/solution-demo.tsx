import { Suspense, useTransition } from 'react'
import { graphql, useLazyLoadQuery, usePaginationFragment } from 'react-relay'
import { RelayEnvironmentWrapper } from '../@shared/relay/RelayEnvironmentProvider'
import type { solutionDemoPaginationQuery } from './__generated__/solutionDemoPaginationQuery.graphql'
import type { solutionDemoPostList_query$key } from './__generated__/solutionDemoPostList_query.graphql'

const PostListFragment = graphql`
  fragment solutionDemoPostList_query on Query
  @refetchable(queryName: "solutionDemoPostListPaginationQuery")
  @argumentDefinitions(
    first: { type: "Int", defaultValue: 5 }
    after: { type: "String" }
  ) {
    posts(first: $first, after: $after)
      @connection(key: "solutionDemoPostList_posts") {
      edges {
        node {
          id
          title
          author {
            name
          }
        }
      }
      totalCount
    }
  }
`

const RootQuery = graphql`
  query solutionDemoPaginationQuery {
    ...solutionDemoPostList_query
  }
`

function PostList({ queryRef }: { queryRef: solutionDemoPostList_query$key }) {
  const { data, loadNext, hasNext, isLoadingNext } = usePaginationFragment(
    PostListFragment,
    queryRef,
  )

  const [isPending, startTransition] = useTransition()

  const posts = data.posts.edges.map((edge) => edge.node)

  return (
    <div className="space-y-3">
      <div className="rounded border border-green-100 bg-green-50/50 px-2 py-1 text-[10px] text-green-600">
        Relay @connection + usePaginationFragment — 커서 기반, 누적 로딩
      </div>

      <div className="space-y-1.5">
        {posts.map((post) => (
          <div
            key={post.id}
            className="flex items-center justify-between rounded border border-gray-100 bg-white px-3 py-2"
          >
            <div>
              <p className="text-xs font-medium text-gray-800">{post.title}</p>
              <p className="text-[10px] text-gray-400">by {post.author.name}</p>
            </div>
            <span className="font-mono text-[9px] text-gray-300">#{post.id}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[10px] text-gray-400">
          {posts.length} / {data.posts.totalCount} posts loaded
        </span>

        {hasNext && (
          <button
            onClick={() => startTransition(() => loadNext(5))}
            disabled={isLoadingNext || isPending}
            className="rounded-md bg-green-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-600 disabled:opacity-50"
          >
            {isLoadingNext || isPending ? 'Loading...' : 'Load More'}
          </button>
        )}

        {!hasNext && (
          <span className="text-[10px] text-gray-400">All posts loaded</span>
        )}
      </div>

      <div className="rounded-md border border-green-200 bg-green-50 p-3 text-[11px] text-green-700">
        <p className="font-semibold">@connection + usePaginationFragment의 장점</p>
        <ul className="mt-1 space-y-0.5">
          <li>• 새 페이지 로드 시 기존 데이터에 누적(append) — 데이터가 사라지지 않음</li>
          <li>• 커서 기반이라 중간 삽입/삭제에도 항목 중복/누락 없음</li>
          <li>• Relay가 @connection 데이터를 정규화하여 자동 병합</li>
          <li>• loadNext/loadPrevious/refetch를 Relay가 제공 — 수동 상태 관리 불필요</li>
          <li>• hasNext로 더 불러올 데이터가 있는지 자동 판별</li>
        </ul>
      </div>
    </div>
  )
}

function PaginationContent() {
  const data = useLazyLoadQuery<solutionDemoPaginationQuery>(RootQuery, {})

  return <PostList queryRef={data} />
}

export function PaginationSolutionDemo() {
  return (
    <RelayEnvironmentWrapper>
      <Suspense
        fallback={
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-4 text-xs text-gray-400">
            <div className="h-3 w-3 animate-spin rounded-full border border-gray-300 border-t-green-500" />
            Loading via Relay pagination...
          </div>
        }
      >
        <PaginationContent />
      </Suspense>
    </RelayEnvironmentWrapper>
  )
}
