import { createFileRoute, Link } from '@tanstack/react-router'
import { Panel } from '~/@lib/ui/common/panel'
import { useGraphQLWorker } from '../-sub/@shared/use-graphql-worker'
import { OptimisticProblemDemo } from '../-sub/07-optimistic-updates/problem-demo'
import { OptimisticSolutionDemo } from '../-sub/07-optimistic-updates/solution-demo'

export const Route = createFileRoute('/graphql/optimistic-updates/')({
  component: OptimisticUpdatesPage,
})

function OptimisticUpdatesPage() {
  const ready = useGraphQLWorker()
  if (!ready) return <Loading />

  return (
    <div>
      <BackLink />
      <h1 className="mb-2 text-2xl font-bold text-gray-900">7. Optimistic Updates</h1>
      <p className="mb-8 text-gray-600">
        뮤테이션 시 서버 응답을 기다리지 않고 UI를 즉시 업데이트하기
      </p>

      <div className="space-y-6">
        <Panel variant="problem" label="Problem" tag="서버 응답 대기" data={{
          description: '댓글을 작성하면 서버 응답(~300ms)까지 UI가 멈춥니다. 사용자에게 즉각적인 피드백이 없습니다.',
          demo: <OptimisticProblemDemo />,
          code: PROBLEM_CODE,
        }} />
        <Panel variant="solution" label="Solution" tag="Relay Optimistic Response" data={{
          description: 'Relay의 optimisticResponse로 가짜 데이터를 Store에 먼저 기록합니다. UI가 즉시 업데이트되고, 실패 시 자동 롤백.',
          demo: <OptimisticSolutionDemo />,
          code: SOLUTION_CODE,
        }} />
      </div>

      <NavFooter
        prev={{ to: '/graphql/pagination', label: '6. Pagination' }}
        next={{ to: '/graphql/subscriptions', label: '8. Subscriptions' }}
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

const PROBLEM_CODE = `// ❌ 서버 응답까지 UI가 멈춤
async function addComment(body) {
  setSubmitting(true)
  const { data } = await gqlFetch(mutation, { input })
  setComments(prev => [...prev, data.addComment.comment])
  setSubmitting(false)
}
// 클릭 → 300ms 멈춤 → 결과 표시`

const SOLUTION_CODE = `// ✅ Relay Optimistic Response — 즉시 UI 반영
commit({
  variables: { input },
  optimisticResponse: {
    addComment: {
      comment: { id: \`temp-\${Date.now()}\`, body, author: { name: "Me" } }
    }
  },
  // 서버 응답 후 실제 데이터로 교체, 실패 시 자동 롤백
})
// 클릭 → 즉시 표시 → 서버 확인`
