import { createFileRoute, Link } from '@tanstack/react-router'
import { Panel } from '~/@lib/ui/common/panel'
import { useGraphQLWorker } from '../-sub/@shared/use-graphql-worker'
import { RestProblemDemo } from '../-sub/01-rest-vs-graphql/rest-problem-demo'
import { GraphQLSolutionDemo } from '../-sub/01-rest-vs-graphql/graphql-solution-demo'

export const Route = createFileRoute('/graphql/rest-vs-graphql/')({
  component: RestVsGraphQLPage,
})

function RestVsGraphQLPage() {
  const ready = useGraphQLWorker()
  if (!ready) return <Loading />

  return (
    <div>
      <BackLink />
      <h1 className="mb-2 text-2xl font-bold text-gray-900">1. REST vs GraphQL</h1>
      <p className="mb-8 text-gray-600">
        Over-fetching, Under-fetching, Waterfall 문제를 GraphQL이 어떻게 해결하는가
      </p>

      <div className="space-y-8">
        {/* Concept explanation */}
        <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-5 text-sm leading-relaxed text-gray-700">
          <h2 className="font-semibold text-gray-900">REST API의 구조적 한계</h2>
          <p>
            REST는 <strong>리소스 단위</strong>로 엔드포인트를 설계합니다.{' '}
            <code className="rounded bg-gray-100 px-1 text-xs">/users/1</code>,{' '}
            <code className="rounded bg-gray-100 px-1 text-xs">/users/1/posts</code>,{' '}
            <code className="rounded bg-gray-100 px-1 text-xs">/posts/1/comments</code> — 각
            엔드포인트는 해당 리소스의 <em>모든</em> 필드를 반환합니다. 이 구조에서 세 가지 문제가
            발생합니다:
          </p>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-md border border-red-100 bg-red-50/50 p-3">
              <p className="mb-1 text-xs font-bold text-red-700">Over-fetching</p>
              <p className="text-xs text-red-900/70">
                화면에 유저의 <code className="text-[10px]">name</code>과{' '}
                <code className="text-[10px]">avatar</code>만 필요하지만, REST 응답에는{' '}
                <code className="text-[10px]">email</code>,{' '}
                <code className="text-[10px]">phone</code>,{' '}
                <code className="text-[10px]">address</code>,{' '}
                <code className="text-[10px]">role</code> 등 불필요한 필드가 모두 포함됩니다.
              </p>
            </div>
            <div className="rounded-md border border-red-100 bg-red-50/50 p-3">
              <p className="mb-1 text-xs font-bold text-red-700">Under-fetching</p>
              <p className="text-xs text-red-900/70">
                하나의 화면을 구성하는데 필요한 데이터가 여러 리소스에 분산되어 있어, 한 번의
                요청으로 충분하지 않습니다. 최소 3번의 API 호출이 필요합니다.
              </p>
            </div>
            <div className="rounded-md border border-red-100 bg-red-50/50 p-3">
              <p className="mb-1 text-xs font-bold text-red-700">Waterfall</p>
              <p className="text-xs text-red-900/70">
                연관 데이터를 가져오려면 이전 응답에 의존하는 경우가 많습니다. 총 대기시간은 각
                요청의 합이 됩니다.
              </p>
            </div>
          </div>
        </div>

        <Panel
          variant="problem"
          label="Problem"
          tag="REST API — 3 sequential requests"
          data={{
            description:
              '유저 프로필 화면 하나를 그리기 위해 3번의 REST 호출이 필요합니다. 각 응답에서 실제 사용하는 필드 비율을 확인해보세요.',
            demo: <RestProblemDemo />,
            code: REST_PROBLEM_CODE,
          }}
        />

        <Panel
          variant="solution"
          label="Solution"
          tag="GraphQL — 1 query, exact fields"
          data={{
            description:
              'GraphQL은 하나의 쿼리로 여러 리소스의 데이터를 필요한 필드만 정확히 요청합니다.',
            demo: <GraphQLSolutionDemo />,
            code: GRAPHQL_SOLUTION_CODE,
          }}
        />

        {/* Caveats link */}
        <Link
          to="/graphql/caveats"
          className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50/50 p-5 transition-shadow hover:shadow-md"
        >
          <div>
            <h4 className="font-semibold text-amber-900">Caveats — GraphQL이 만능은 아닙니다</h4>
            <p className="mt-1 text-xs text-amber-800/70">
              HTTP 캐싱, N+1 문제, 서버 복잡도, 에러 핸들링 등 트레이드오프를 인터랙티브 데모와 함께
              다룹니다.
            </p>
          </div>
          <span className="ml-4 text-lg text-amber-600">→</span>
        </Link>
      </div>

      <NavFooter prev={null} next={{ to: '/graphql/query-mutation', label: '2. Query & Mutation Basics' }} />
    </div>
  )
}

function Loading() {
  return (
    <div className="flex items-center gap-2 py-12 text-gray-500">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
      Initializing GraphQL mock server...
    </div>
  )
}

function BackLink() {
  return (
    <div className="mb-2">
      <Link to="/graphql" className="text-xs text-blue-600 hover:underline">← GraphQL</Link>
    </div>
  )
}

function NavFooter({ prev, next }: { prev: { to: string; label: string } | null; next: { to: string; label: string } | null }) {
  return (
    <div className="mt-12 flex items-center justify-between border-t border-gray-200 pt-6">
      {prev ? (
        <Link to={prev.to} className="text-sm text-blue-600 hover:underline">← {prev.label}</Link>
      ) : <span />}
      {next ? (
        <Link to={next.to} className="text-sm text-blue-600 hover:underline">{next.label} →</Link>
      ) : <span />}
    </div>
  )
}

const REST_PROBLEM_CODE = `// 3번의 REST 호출 — over-fetching + waterfall
const user = await fetch('/api/users/1')       // 9개 필드, 2개만 사용
const posts = await fetch('/api/users/1/posts') // 16개 필드, 2개만 사용
const comments = await fetch('/api/posts/1/comments') // 순차 대기
// 총 84% 데이터 낭비, 3번 요청`

const GRAPHQL_SOLUTION_CODE = `// 1번의 GraphQL 쿼리 — exact fields
const { data } = await gqlFetch(\`
  query UserProfile($id: ID!) {
    user(id: $id) {
      name avatar
      posts { title comments { body } }
    }
  }
\`, { id: "1" })
// 1 request, 0% waste, type-safe`
