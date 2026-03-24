import { createFileRoute, Link } from '@tanstack/react-router'
import { useGraphQLWorker } from '../-sub/@shared/use-graphql-worker'
import { StoreCacheDemo } from '../-sub/10-store-cache/store-cache-demo'

export const Route = createFileRoute('/graphql/store-cache/')({
  component: StoreCachePage,
})

function StoreCachePage() {
  const ready = useGraphQLWorker()
  if (!ready) return <Loading />

  return (
    <div>
      <BackLink />
      <h1 className="mb-2 text-2xl font-bold text-gray-900">10. Relay Store & Cache Management</h1>
      <p className="mb-8 text-gray-600">
        정규화 캐시, Garbage Collection, Store Invalidation 이해하기
      </p>

      <div className="space-y-8">
        <div className="rounded-lg border border-indigo-200 bg-indigo-50/30 p-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="rounded bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">Store</span>
            <span className="text-sm font-medium text-gray-700">Relay Store Inspector</span>
          </div>
          <div className="mb-3 rounded-lg border border-indigo-100 bg-white p-4">
            <StoreCacheDemo />
          </div>
          <p className="text-sm leading-relaxed text-gray-600">
            Relay Store는 모든 GraphQL 응답을 <code className="text-xs">Type:ID</code> 형태로
            정규화하여 저장합니다. 같은 엔티티가 여러 쿼리에 등장해도 하나의 레코드로 관리되어
            일관성이 보장됩니다.
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5 text-sm text-gray-700">
          <h2 className="mb-3 font-semibold text-gray-900">Apollo vs Relay 캐시 비교</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-3 py-2 text-left text-gray-500">특성</th>
                  <th className="px-3 py-2 text-left text-gray-500">Apollo InMemoryCache</th>
                  <th className="px-3 py-2 text-left text-gray-500">Relay Store</th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                <tr className="border-b border-gray-50">
                  <td className="px-3 py-2 font-medium">정규화</td>
                  <td className="px-3 py-2">선택적 (typePolicies로 설정)</td>
                  <td className="px-3 py-2">필수 (Node interface 기반)</td>
                </tr>
                <tr className="border-b border-gray-50">
                  <td className="px-3 py-2 font-medium">GC</td>
                  <td className="px-3 py-2">수동 (gc() 호출)</td>
                  <td className="px-3 py-2">자동 (쿼리 참조 기반)</td>
                </tr>
                <tr className="border-b border-gray-50">
                  <td className="px-3 py-2 font-medium">타입 안전성</td>
                  <td className="px-3 py-2">런타임</td>
                  <td className="px-3 py-2">컴파일 타임 (코드젠)</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-medium">업데이트 세분화</td>
                  <td className="px-3 py-2">쿼리 레벨</td>
                  <td className="px-3 py-2">Fragment 레벨 (더 세밀)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="mt-12 flex items-center justify-between border-t border-gray-200 pt-6">
        <Link to="/graphql/defer-stream" className="text-sm text-blue-600 hover:underline">← 9. @defer/@stream</Link>
        <Link to="/graphql" className="text-sm text-blue-600 hover:underline">GraphQL 메인으로 →</Link>
      </div>
    </div>
  )
}

function Loading() {
  return <div className="flex items-center gap-2 py-12 text-gray-500"><div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />Initializing...</div>
}
function BackLink() {
  return <div className="mb-2"><Link to="/graphql" className="text-xs text-blue-600 hover:underline">← GraphQL</Link></div>
}
