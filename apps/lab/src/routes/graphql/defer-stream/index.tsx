import { createFileRoute, Link } from '@tanstack/react-router'
import { DeferStreamDemo } from '../-sub/09-defer-stream/defer-stream-demo'

export const Route = createFileRoute('/graphql/defer-stream/')({
  component: DeferStreamPage,
})

function DeferStreamPage() {
  return (
    <div>
      <BackLink />
      <h1 className="mb-2 text-2xl font-bold text-gray-900">9. @defer / @stream</h1>
      <p className="mb-8 text-gray-600">
        점진적 데이터 전달로 Time-to-First-Paint 최적화하기
      </p>

      <div className="space-y-8">
        <div className="rounded-lg border border-purple-200 bg-purple-50/30 p-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="rounded bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-700">Incremental</span>
            <span className="text-sm font-medium text-gray-700">Blocking vs Deferred Loading</span>
          </div>
          <div className="mb-3 rounded-lg border border-purple-100 bg-white p-4">
            <DeferStreamDemo />
          </div>
          <p className="text-sm leading-relaxed text-gray-600">
            <code className="text-xs">@defer</code>는 느린 필드를 별도 청크로 스트리밍하여 빠른
            필드부터 먼저 화면에 표시합니다. <code className="text-xs">@stream</code>은 리스트
            항목을 하나씩 전달합니다. 두 디렉티브 모두 GraphQL 스펙 draft 단계이며, 서버 지원이
            필요합니다.
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5 text-sm text-gray-700">
          <h2 className="mb-3 font-semibold text-gray-900">@defer vs @stream</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded border border-purple-100 bg-purple-50/50 p-3">
              <p className="font-medium text-purple-800">@defer</p>
              <p className="text-xs text-purple-700">Fragment 단위로 지연 로딩. 느린 필드 그룹을 별도 청크로 전달. 화면의 섹션별 점진적 렌더링에 적합</p>
              <pre className="mt-1 rounded bg-white px-2 py-1 font-mono text-[10px] text-gray-600">{'... @defer { expensiveField }'}</pre>
            </div>
            <div className="rounded border border-purple-100 bg-purple-50/50 p-3">
              <p className="font-medium text-purple-800">@stream</p>
              <p className="text-xs text-purple-700">리스트의 각 항목을 하나씩 전달. 긴 리스트의 첫 항목을 빠르게 표시할 때 적합</p>
              <pre className="mt-1 rounded bg-white px-2 py-1 font-mono text-[10px] text-gray-600">{'posts @stream(initialCount: 3) { title }'}</pre>
            </div>
          </div>
        </div>

        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          <strong>Note:</strong> @defer/@stream은 아직 GraphQL 스펙의 draft 단계입니다. Apollo
          Server, GraphQL Yoga, Relay 등에서 실험적으로 지원하지만, 프로덕션 사용 시 서버와
          클라이언트 양쪽의 지원 상태를 확인해야 합니다.
        </div>
      </div>

      <NavFooter
        prev={{ to: '/graphql/subscriptions', label: '8. Subscriptions' }}
        next={{ to: '/graphql/store-cache', label: '10. Store & Cache' }}
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
