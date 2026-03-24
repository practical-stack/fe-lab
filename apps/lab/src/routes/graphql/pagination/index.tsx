import { createFileRoute, Link } from '@tanstack/react-router'
import { Panel } from '~/@lib/ui/common/panel'
import { useGraphQLWorker } from '../-sub/@shared/use-graphql-worker'
import { PaginationProblemDemo } from '../-sub/06-pagination/problem-demo'
import { PaginationSolutionDemo } from '../-sub/06-pagination/solution-demo'

export const Route = createFileRoute('/graphql/pagination/')({
  component: PaginationPage,
})

function PaginationPage() {
  const ready = useGraphQLWorker()
  if (!ready) return <Loading />

  return (
    <div>
      <BackLink />
      <h1 className="mb-2 text-2xl font-bold text-gray-900">6. Pagination (Connection Spec)</h1>
      <p className="mb-8 text-gray-600">
        수동 오프셋 페이지네이션 vs Relay의 커서 기반 @connection + usePaginationFragment
      </p>

      <div className="space-y-6">
        <Panel variant="problem" label="Problem" tag="Manual Offset Pagination" data={{
          description: '페이지 전환 시 기존 데이터를 교체하고, 오프셋 기반이라 중간 삽입/삭제 시 항목이 중복되거나 누락됩니다.',
          demo: <PaginationProblemDemo />,
          code: PROBLEM_CODE,
        }} />
        <Panel variant="solution" label="Solution" tag="@connection + usePaginationFragment" data={{
          description: 'Relay의 usePaginationFragment가 커서 기반 페이지네이션을 자동으로 관리합니다. 새 페이지는 기존 데이터에 누적됩니다.',
          demo: <PaginationSolutionDemo />,
          code: SOLUTION_CODE,
        }} />
      </div>

      <NavFooter
        prev={{ to: '/graphql/fragment-colocation', label: '5. Fragment Colocation' }}
        next={{ to: '/graphql/optimistic-updates', label: '7. Optimistic Updates' }}
      />
    </div>
  )
}

function Loading() {
  return <div className="flex items-center gap-2 py-12 text-gray-500"><div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />Initializing...</div>
}
function BackLink() {
  return <div className="mb-2"><Link to="/graphql" className="text-xs text-blue-600 hover:underline">← GraphQL</Link></div>
}
function NavFooter({ prev, next }: { prev: { to: string; label: string } | null; next: { to: string; label: string } | null }) {
  return (
    <div className="mt-12 flex items-center justify-between border-t border-gray-200 pt-6">
      {prev ? <Link to={prev.to} className="text-sm text-blue-600 hover:underline">← {prev.label}</Link> : <span />}
      {next ? <Link to={next.to} className="text-sm text-blue-600 hover:underline">{next.label} →</Link> : <span />}
    </div>
  )
}

const PROBLEM_CODE = `// ❌ 수동 오프셋 페이지네이션
useEffect(() => {
  fetch(\`/api/posts?offset=\${page * 5}&limit=5\`)
    .then(res => res.json())
    .then(data => setPosts(data.posts)) // 기존 데이터 교체!
}, [page])
// 문제: 깜빡임, offset 밀림, 복잡한 상태 관리`

const SOLUTION_CODE = `// ✅ Relay @connection + usePaginationFragment
const fragment = graphql\`
  fragment PostList on Query
  @refetchable(queryName: "PostListPagination")
  @argumentDefinitions(first: {type:"Int",defaultValue:5}, after: {type:"String"}) {
    posts(first: $first, after: $after)
      @connection(key: "PostList_posts") {
      edges { node { id title author { name } } }
    }
  }
\`
const { data, loadNext, hasNext } = usePaginationFragment(fragment, ref)
// loadNext(5) → 누적 append, 커서 기반으로 중복/누락 없음`
