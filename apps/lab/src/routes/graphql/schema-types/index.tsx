import { createFileRoute, Link } from '@tanstack/react-router'
import { SchemaExplorerDemo } from '../-sub/03-schema-type-system/schema-explorer-demo'

export const Route = createFileRoute('/graphql/schema-types/')({
  component: SchemaTypesPage,
})

function SchemaTypesPage() {
  return (
    <div>
      <BackLink />
      <h1 className="mb-2 text-2xl font-bold text-gray-900">3. Schema & Type System</h1>
      <p className="mb-8 text-gray-600">
        GraphQL 스키마가 API 계약을 어떻게 정의하는가 — SDL, 타입 관계, 스키마 우선 개발
      </p>

      <div className="space-y-8">
        <div className="rounded-lg border border-purple-200 bg-purple-50/30 p-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="rounded bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-700">Explorer</span>
            <span className="text-sm font-medium text-gray-700">Schema Visualization</span>
          </div>
          <div className="mb-3 rounded-lg border border-purple-100 bg-white p-4">
            <SchemaExplorerDemo />
          </div>
          <p className="text-sm leading-relaxed text-gray-600">
            타입을 클릭하면 필드와 연결 관계를 확인할 수 있습니다. GraphQL 스키마는 API의
            계약(contract)입니다 — 클라이언트와 서버가 이 스키마를 기준으로 소통합니다.
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5 text-sm leading-relaxed text-gray-700">
          <h2 className="mb-3 font-semibold text-gray-900">Schema-First Development</h2>
          <p className="mb-3">
            GraphQL에서는 스키마를 먼저 설계하고, 클라이언트와 서버가 동시에 개발을 시작합니다.
            스키마가 계약 역할을 하므로 양쪽이 독립적으로 작업할 수 있습니다.
          </p>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded border border-gray-100 p-3">
              <p className="font-medium text-gray-800">SDL (Schema Definition Language)</p>
              <p className="text-xs text-gray-500">사람이 읽을 수 있는 스키마 정의 문법. type, interface, enum, input, union 등</p>
            </div>
            <div className="rounded border border-gray-100 p-3">
              <p className="font-medium text-gray-800">Introspection</p>
              <p className="text-xs text-gray-500">스키마 자체를 쿼리할 수 있는 메타 기능. GraphiQL, 코드 생성 도구의 기반</p>
            </div>
            <div className="rounded border border-gray-100 p-3">
              <p className="font-medium text-gray-800">Type Safety</p>
              <p className="text-xs text-gray-500">스키마가 요청/응답 형태를 보장. 잘못된 필드 요청은 validation 단계에서 거부</p>
            </div>
          </div>
        </div>
      </div>

      <NavFooter
        prev={{ to: '/graphql/query-mutation', label: '2. Query & Mutation' }}
        next={{ to: '/graphql/relay-environment', label: '4. Relay Environment' }}
      />
    </div>
  )
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
