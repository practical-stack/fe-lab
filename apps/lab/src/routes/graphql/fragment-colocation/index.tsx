import { createFileRoute, Link } from '@tanstack/react-router'
import { Panel } from '~/@lib/ui/common/panel'
import { useGraphQLWorker } from '../-sub/@shared/use-graphql-worker'
import { FragmentProblemDemo } from '../-sub/05-fragment-colocation/problem-demo'
import { FragmentSolutionDemo } from '../-sub/05-fragment-colocation/solution-demo'

export const Route = createFileRoute('/graphql/fragment-colocation/')({
  component: FragmentColocationPage,
})

function FragmentColocationPage() {
  const ready = useGraphQLWorker()
  if (!ready) return <Loading />

  return (
    <div>
      <BackLink />
      <h1 className="mb-2 text-2xl font-bold text-gray-900">5. Fragment Colocation</h1>
      <p className="mb-8 text-gray-600">
        Prop drilling 문제를 Relay Fragment로 해결하기 — 컴포넌트별 데이터 요구사항 선언
      </p>

      <div className="space-y-6">
        <Panel variant="problem" label="Problem" tag="Prop Drilling" data={{
          description: '루트 컴포넌트가 모든 데이터를 가져와서 자식에게 props로 전달합니다. 자식에 필드를 추가하면 쿼리와 모든 중간 컴포넌트를 수정해야 합니다.',
          demo: <FragmentProblemDemo />,
          code: PROBLEM_CODE,
        }} />
        <Panel variant="solution" label="Solution" tag="Relay Fragments" data={{
          description: '각 컴포넌트가 자신의 fragment로 데이터 요구사항을 선언합니다. Relay 컴파일러가 fragment를 자동으로 합성하여 최적화된 쿼리를 만듭니다.',
          demo: <FragmentSolutionDemo />,
          code: SOLUTION_CODE,
        }} />
      </div>

      <NavFooter
        prev={{ to: '/graphql/relay-environment', label: '4. Relay Environment' }}
        next={{ to: '/graphql/pagination', label: '6. Pagination' }}
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

const PROBLEM_CODE = `// ❌ 루트에서 모든 데이터를 가져와 props로 전달
const QUERY = \`query {
  user(id: "1") {
    id name email avatar
    posts { id title body createdAt
      comments { id body author { name } }
    }
  }
}\`
// 자식에 필드 추가 → 쿼리 + 중간 props 전부 수정 (shotgun surgery)`

const SOLUTION_CODE = `// ✅ 각 컴포넌트가 자신의 fragment를 선언
const UserHeaderFragment = graphql\`
  fragment UserHeader_user on User { name email avatar }
\`
const PostItemFragment = graphql\`
  fragment PostItem_post on Post {
    title body createdAt
    comments { ...CommentItem_comment }
  }
\`
// 루트 쿼리 — fragment를 spread할 뿐
const Query = graphql\`
  query UserProfile($id: ID!) {
    user(id: $id) { ...UserHeader_user posts { ...PostItem_post } }
  }
\`
// 자식에 필드 추가 → 해당 fragment만 수정!`
