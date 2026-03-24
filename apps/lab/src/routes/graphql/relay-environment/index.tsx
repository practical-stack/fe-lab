import { createFileRoute, Link } from '@tanstack/react-router'
import { useGraphQLWorker } from '../-sub/@shared/use-graphql-worker'
import { RelaySetupDemo } from '../-sub/04-relay-environment/relay-setup-demo'

export const Route = createFileRoute('/graphql/relay-environment/')({
  component: RelayEnvironmentPage,
})

function RelayEnvironmentPage() {
  const ready = useGraphQLWorker()
  if (!ready) return <Loading />

  return (
    <div>
      <BackLink />
      <h1 className="mb-2 text-2xl font-bold text-gray-900">4. Relay Environment Setup</h1>
      <p className="mb-8 text-gray-600">
        Relay Environment 구성 — Network Layer, Store, RelayEnvironmentProvider
      </p>

      <div className="space-y-8">
        <div className="rounded-lg border border-blue-200 bg-blue-50/30 p-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">Relay</span>
            <span className="text-sm font-medium text-gray-700">Environment + useLazyLoadQuery</span>
          </div>
          <div className="mb-3 rounded-lg border border-blue-100 bg-white p-4">
            <RelaySetupDemo />
          </div>
          <p className="text-sm leading-relaxed text-gray-600">
            Relay Environment은 Network(서버 통신)와 Store(정규화 캐시)로 구성됩니다.{' '}
            <code className="text-xs">useLazyLoadQuery</code>는 컴포넌트 렌더링 시 쿼리를 실행하고,
            Suspense로 로딩 상태를 처리합니다. 같은 ID를 다시 선택하면 Store 캐시에서 즉시 반환됩니다.
          </p>
        </div>

        <div className="rounded-md border border-gray-200 bg-gray-900 p-4">
          <p className="mb-2 text-[10px] text-gray-500">Relay Environment 설정 코드</p>
          <pre className="overflow-x-auto text-xs text-green-400">{`import { Environment, Network, RecordSource, Store } from 'relay-runtime'

const fetchFn = async (request, variables) => {
  const response = await fetch('/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: request.text, variables }),
  })
  return response.json()
}

const environment = new Environment({
  network: Network.create(fetchFn),     // 서버 통신 담당
  store: new Store(new RecordSource()), // 정규화 캐시 담당
})

// 컴포넌트에서:
// const data = useLazyLoadQuery(query, variables)
// → Suspense로 로딩 처리, Store에 자동 캐싱`}</pre>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5 text-sm text-gray-700">
          <h2 className="mb-3 font-semibold text-gray-900">Relay Environment의 구성 요소</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded border border-gray-100 p-3">
              <p className="font-medium text-gray-800">Network</p>
              <p className="text-xs text-gray-500">GraphQL 서버와의 통신을 담당. fetch 함수를 커스터마이즈하여 인증 헤더, 에러 처리 등을 추가</p>
            </div>
            <div className="rounded border border-gray-100 p-3">
              <p className="font-medium text-gray-800">Store (RecordSource)</p>
              <p className="text-xs text-gray-500">모든 GraphQL 응답을 Type:ID 형태로 정규화하여 저장. 엔티티 간 일관성 자동 유지</p>
            </div>
            <div className="rounded border border-gray-100 p-3">
              <p className="font-medium text-gray-800">RelayEnvironmentProvider</p>
              <p className="text-xs text-gray-500">React Context로 environment를 하위 컴포넌트에 제공. React Query의 QueryClientProvider와 유사</p>
            </div>
            <div className="rounded border border-gray-100 p-3">
              <p className="font-medium text-gray-800">Relay Compiler</p>
              <p className="text-xs text-gray-500">빌드 타임에 쿼리를 분석, 최적화, 타입 생성. 런타임 오버헤드 최소화</p>
            </div>
          </div>
        </div>
      </div>

      <NavFooter
        prev={{ to: '/graphql/schema-types', label: '3. Schema & Type System' }}
        next={{ to: '/graphql/fragment-colocation', label: '5. Fragment Colocation' }}
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
