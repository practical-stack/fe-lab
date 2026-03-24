import { createFileRoute, Link } from '@tanstack/react-router'
import { SubscriptionDemo } from '../-sub/08-subscriptions/subscription-demo'

export const Route = createFileRoute('/graphql/subscriptions/')({
  component: SubscriptionsPage,
})

function SubscriptionsPage() {
  return (
    <div>
      <BackLink />
      <h1 className="mb-2 text-2xl font-bold text-gray-900">8. Subscriptions</h1>
      <p className="mb-8 text-gray-600">
        GraphQL Subscriptions로 실시간 데이터 업데이트 받기
      </p>

      <div className="space-y-8">
        <div className="rounded-lg border border-blue-200 bg-blue-50/30 p-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">Real-time</span>
            <span className="text-sm font-medium text-gray-700">Live Comment Feed</span>
          </div>
          <div className="mb-3 rounded-lg border border-blue-100 bg-white p-4">
            <SubscriptionDemo />
          </div>
          <p className="text-sm leading-relaxed text-gray-600">
            GraphQL Subscription은 WebSocket 연결을 통해 서버에서 클라이언트로 실시간 이벤트를
            푸시합니다. Relay의 <code className="text-xs">requestSubscription</code>이 연결
            수명주기와 Store 업데이트를 자동으로 관리합니다.
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5 text-sm text-gray-700">
          <h2 className="mb-3 font-semibold text-gray-900">Subscription vs Polling vs SSE</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-3 py-2 text-left text-gray-500">방식</th>
                  <th className="px-3 py-2 text-left text-gray-500">실시간성</th>
                  <th className="px-3 py-2 text-left text-gray-500">서버 부하</th>
                  <th className="px-3 py-2 text-left text-gray-500">적합한 경우</th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                <tr className="border-b border-gray-50">
                  <td className="px-3 py-2 font-medium">Polling</td>
                  <td className="px-3 py-2">낮음 (interval 의존)</td>
                  <td className="px-3 py-2">높음 (불필요한 요청)</td>
                  <td className="px-3 py-2">단순, 빈도 낮은 업데이트</td>
                </tr>
                <tr className="border-b border-gray-50">
                  <td className="px-3 py-2 font-medium">SSE</td>
                  <td className="px-3 py-2">높음</td>
                  <td className="px-3 py-2">중간</td>
                  <td className="px-3 py-2">서버→클라이언트 단방향</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-medium">Subscription (WS)</td>
                  <td className="px-3 py-2">높음</td>
                  <td className="px-3 py-2">중간</td>
                  <td className="px-3 py-2">양방향, 타입 안전, 복잡한 필터링</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <NavFooter
        prev={{ to: '/graphql/optimistic-updates', label: '7. Optimistic Updates' }}
        next={{ to: '/graphql/defer-stream', label: '9. @defer/@stream' }}
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
