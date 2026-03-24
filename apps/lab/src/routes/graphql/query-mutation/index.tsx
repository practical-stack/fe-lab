import { createFileRoute, Link } from '@tanstack/react-router'
import { useGraphQLWorker } from '../-sub/@shared/use-graphql-worker'
import { QueryMutationDemo } from '../-sub/02-query-mutation-basics/query-mutation-demo'

export const Route = createFileRoute('/graphql/query-mutation/')({
  component: QueryMutationPage,
})

function QueryMutationPage() {
  const ready = useGraphQLWorker()
  if (!ready) return <Loading />

  return (
    <div>
      <BackLink />
      <h1 className="mb-2 text-2xl font-bold text-gray-900">2. Query & Mutation Basics</h1>
      <p className="mb-8 text-gray-600">
        GraphQL 쿼리와 뮤테이션의 기본 문법 — variables, aliases, fragments
      </p>

      <div className="space-y-8">
        <div className="rounded-lg border border-blue-200 bg-blue-50/30 p-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">Interactive</span>
            <span className="text-sm font-medium text-gray-700">GraphQL Playground</span>
          </div>
          <div className="mb-3 rounded-lg border border-blue-100 bg-white p-4">
            <QueryMutationDemo />
          </div>
          <p className="text-sm leading-relaxed text-gray-600">
            직접 GraphQL 쿼리를 작성하고 실행해보세요. MSW가 브라우저에서 GraphQL 서버를
            시뮬레이션합니다. 쿼리, 뮤테이션, 변수(variables) 사용법을 실험할 수 있습니다.
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5 text-sm leading-relaxed text-gray-700">
          <h2 className="mb-3 font-semibold text-gray-900">핵심 개념</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded border border-gray-100 p-3">
              <p className="font-medium text-gray-800">Query</p>
              <p className="text-xs text-gray-500">데이터 조회. REST의 GET에 해당. 필드를 선택하여 원하는 형태로 요청</p>
            </div>
            <div className="rounded border border-gray-100 p-3">
              <p className="font-medium text-gray-800">Mutation</p>
              <p className="text-xs text-gray-500">데이터 변경(생성/수정/삭제). REST의 POST/PUT/DELETE에 해당</p>
            </div>
            <div className="rounded border border-gray-100 p-3">
              <p className="font-medium text-gray-800">Variables</p>
              <p className="text-xs text-gray-500">쿼리의 동적 인자를 별도 JSON으로 전달. SQL의 prepared statement와 유사</p>
            </div>
            <div className="rounded border border-gray-100 p-3">
              <p className="font-medium text-gray-800">Aliases</p>
              <p className="text-xs text-gray-500">같은 필드를 다른 인자로 여러 번 요청할 때 이름 충돌 방지</p>
            </div>
          </div>
        </div>
      </div>

      <NavFooter
        prev={{ to: '/graphql/rest-vs-graphql', label: '1. REST vs GraphQL' }}
        next={{ to: '/graphql/schema-types', label: '3. Schema & Type System' }}
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
