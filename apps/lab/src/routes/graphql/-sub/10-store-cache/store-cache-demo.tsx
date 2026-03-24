import { useState, Suspense } from 'react'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { getRelayEnvironment } from '../@shared/relay/environment'
import { RelayEnvironmentWrapper } from '../@shared/relay/RelayEnvironmentProvider'
import type { storeCacheDemoUsersQuery } from './__generated__/storeCacheDemoUsersQuery.graphql'

const UsersQuery = graphql`
  query storeCacheDemoUsersQuery {
    users(first: 5) {
      edges {
        node {
          id
          name
          email
        }
      }
    }
  }
`

function StoreInspector() {
  const data = useLazyLoadQuery<storeCacheDemoUsersQuery>(UsersQuery, {})
  const [storeSnapshot, setStoreSnapshot] = useState<Record<string, unknown> | null>(null)
  const [gcRun, setGcRun] = useState(false)

  function inspectStore() {
    const env = getRelayEnvironment()
    const source = env.getStore().getSource()
    const snapshot: Record<string, unknown> = {}

    // Get all record IDs and their data
    const ids = source.getRecordIDs()
    for (const id of ids) {
      const record = source.get(id)
      if (record) {
        snapshot[id] = record
      }
    }
    setStoreSnapshot(snapshot)
  }

  function runGC() {
    const env = getRelayEnvironment()
    // Notify the store to run garbage collection
    env.getStore().notify()
    setGcRun(true)
    setTimeout(() => setGcRun(false), 2000)
    inspectStore()
  }

  function invalidateStore() {
    const env = getRelayEnvironment()
    env.getStore().publish(
      // @ts-expect-error -- simplified for demo purposes
      { getSource: () => ({ getRecordIDs: () => [], get: () => null, has: () => false, getStatus: () => 'active', getType: () => null, getValue: () => null, getLinkedRecordID: () => null, getLinkedRecordIDs: () => null }) },
    )
    // Simple: just reinspect after a moment
    setTimeout(inspectStore, 100)
  }

  const users = data.users.edges.map((e) => e.node)
  const recordCount = storeSnapshot ? Object.keys(storeSnapshot).length : 0

  return (
    <div className="space-y-4">
      {/* Users loaded */}
      <div>
        <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-gray-400">
          Relay Store에 캐싱된 Users
        </p>
        <div className="space-y-1">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between rounded border border-gray-100 bg-white px-3 py-1.5 text-xs"
            >
              <span className="text-gray-700">{user.name}</span>
              <span className="font-mono text-[9px] text-gray-400">
                Store ID: User:{user.id}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={inspectStore}
          className="rounded bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600"
        >
          Inspect Store
        </button>
        <button
          onClick={runGC}
          className="rounded border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          {gcRun ? '✓ GC 실행됨' : 'Run GC'}
        </button>
      </div>

      {/* Store snapshot */}
      {storeSnapshot && (
        <div className="rounded-md border border-gray-200 bg-gray-900 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] text-gray-500">
              Relay Store — {recordCount} records (정규화됨)
            </span>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {Object.entries(storeSnapshot)
              .filter(([key]) => !key.startsWith('client:'))
              .slice(0, 15)
              .map(([key, value]) => (
                <div key={key} className="mb-1.5 border-b border-gray-800 pb-1.5 last:border-0">
                  <span className="text-[10px] font-bold text-blue-400">{key}</span>
                  <pre className="mt-0.5 text-[10px] text-gray-400">
                    {JSON.stringify(value, null, 2).slice(0, 200)}
                  </pre>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Explanation */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 text-xs leading-relaxed text-gray-700">
        <h4 className="mb-2 font-semibold text-gray-900">Relay Store 핵심 개념</h4>
        <div className="grid gap-2 md:grid-cols-2">
          <div className="rounded border border-gray-100 p-2">
            <p className="font-medium text-gray-800">Normalized Cache</p>
            <p className="text-[11px] text-gray-500">
              모든 엔티티가 <code className="bg-gray-100 px-0.5">Type:ID</code> 형태로 저장됩니다.
              같은 User가 여러 쿼리에 등장해도 하나의 레코드로 관리되어 일관성이 보장됩니다.
            </p>
          </div>
          <div className="rounded border border-gray-100 p-2">
            <p className="font-medium text-gray-800">Garbage Collection</p>
            <p className="text-[11px] text-gray-500">
              어떤 쿼리에서도 참조하지 않는 레코드는 GC 대상이 됩니다. Relay가 자동으로 메모리를
              관리하여 장시간 사용 시에도 메모리 누수를 방지합니다.
            </p>
          </div>
          <div className="rounded border border-gray-100 p-2">
            <p className="font-medium text-gray-800">Store Invalidation</p>
            <p className="text-[11px] text-gray-500">
              <code className="bg-gray-100 px-0.5">commitUpdate</code>로 특정 레코드를 무효화하면
              해당 데이터를 사용하는 모든 컴포넌트가 자동으로 refetch합니다.
            </p>
          </div>
          <div className="rounded border border-gray-100 p-2">
            <p className="font-medium text-gray-800">Optimistic Updates</p>
            <p className="text-[11px] text-gray-500">
              Mutation 시 Store에 임시 데이터를 먼저 기록하고, 서버 응답 후 실제 데이터로
              교체합니다. 실패 시 임시 데이터가 자동 롤백됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function StoreCacheDemo() {
  return (
    <RelayEnvironmentWrapper>
      <Suspense
        fallback={
          <div className="flex items-center gap-2 p-4 text-xs text-gray-400">
            <div className="h-3 w-3 animate-spin rounded-full border border-gray-300 border-t-blue-500" />
            Loading store data...
          </div>
        }
      >
        <StoreInspector />
      </Suspense>
    </RelayEnvironmentWrapper>
  )
}
