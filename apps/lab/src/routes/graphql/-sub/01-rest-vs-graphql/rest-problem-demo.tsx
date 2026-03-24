import { useState } from 'react'

type RequestLog = {
  url: string
  method: string
  status: 'pending' | 'done'
  duration?: number
  dataSize?: number
  response?: MockResponse
}

type MockField = {
  key: string
  value: string
  used: boolean
}

type MockResponse = {
  fields: MockField[]
  label: string
}

const MOCK_ENDPOINTS: Array<{
  url: string
  label: string
  fields: MockField[]
}> = [
  {
    url: '/api/users/1',
    label: 'User',
    fields: [
      { key: 'id', value: '1', used: false },
      { key: 'name', value: '"Alice Kim"', used: true },
      { key: 'email', value: '"alice@example.com"', used: false },
      { key: 'avatar', value: '"https://..."', used: true },
      { key: 'phone', value: '"010-1234-5678"', used: false },
      { key: 'address', value: '"서울시 강남구"', used: false },
      { key: 'role', value: '"admin"', used: false },
      { key: 'createdAt', value: '"2024-01-01"', used: false },
      { key: 'updatedAt', value: '"2024-01-15"', used: false },
    ],
  },
  {
    url: '/api/users/1/posts',
    label: 'Posts',
    fields: [
      { key: 'posts[0].id', value: '1', used: false },
      { key: 'posts[0].title', value: '"Getting Started with GraphQL"', used: true },
      { key: 'posts[0].body', value: '"GraphQL is a query language..."', used: false },
      { key: 'posts[0].authorId', value: '1', used: false },
      { key: 'posts[0].createdAt', value: '"2024-01-15"', used: false },
      { key: 'posts[0].updatedAt', value: '"2024-01-16"', used: false },
      { key: 'posts[0].tags', value: '["graphql"]', used: false },
      { key: 'posts[0].slug', value: '"getting-started"', used: false },
      { key: 'posts[1].id', value: '2', used: false },
      { key: 'posts[1].title', value: '"Why Relay?"', used: true },
      { key: 'posts[1].body', value: '"Relay is a JavaScript..."', used: false },
      { key: 'posts[1].authorId', value: '1', used: false },
      { key: 'posts[1].createdAt', value: '"2024-01-20"', used: false },
      { key: 'posts[1].updatedAt', value: '"2024-01-21"', used: false },
      { key: 'posts[1].tags', value: '["relay"]', used: false },
      { key: 'posts[1].slug', value: '"why-relay"', used: false },
    ],
  },
  {
    url: '/api/posts/1/comments',
    label: 'Comments',
    fields: [
      { key: 'comments[0].id', value: '1', used: false },
      { key: 'comments[0].body', value: '"Great intro!"', used: true },
      { key: 'comments[0].authorId', value: '2', used: false },
      { key: 'comments[0].postId', value: '1', used: false },
      { key: 'comments[0].createdAt', value: '"2024-01-16"', used: false },
      { key: 'comments[0].updatedAt', value: '"2024-01-16"', used: false },
      { key: 'comments[1].id', value: '2', used: false },
      { key: 'comments[1].body', value: '"Very clear."', used: true },
      { key: 'comments[1].authorId', value: '3', used: false },
      { key: 'comments[1].postId', value: '1', used: false },
      { key: 'comments[1].createdAt', value: '"2024-01-17"', used: false },
      { key: 'comments[1].updatedAt', value: '"2024-01-17"', used: false },
    ],
  },
]

export function RestProblemDemo() {
  const [logs, setLogs] = useState<RequestLog[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)

  async function simulateRestCalls() {
    setLoading(true)
    setLogs([])
    setExpandedIdx(null)

    for (const endpoint of MOCK_ENDPOINTS) {
      setLogs((prev) => [...prev, { url: endpoint.url, method: 'GET', status: 'pending' }])

      const duration = 300 + Math.random() * 300
      await new Promise((r) => setTimeout(r, duration))

      setLogs((prev) =>
        prev.map((log) =>
          log.url === endpoint.url
            ? {
                ...log,
                status: 'done' as const,
                duration: Math.round(duration),
                dataSize: endpoint.fields.reduce((sum, f) => sum + f.key.length + f.value.length, 0),
                response: { fields: endpoint.fields, label: endpoint.label },
              }
            : log,
        ),
      )
    }

    setLoading(false)
  }

  const doneLogs = logs.filter((l) => l.status === 'done')
  const totalDuration = doneLogs.reduce((sum, l) => sum + (l.duration ?? 0), 0)
  const allFields = doneLogs.flatMap((l) => l.response?.fields ?? [])
  const totalFields = allFields.length
  const usedFields = allFields.filter((f) => f.used).length
  const wastedPct = totalFields > 0 ? Math.round(((totalFields - usedFields) / totalFields) * 100) : 0

  return (
    <div className="space-y-4">
      <button
        onClick={simulateRestCalls}
        disabled={loading}
        className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50"
      >
        {loading ? 'Fetching...' : 'Fetch with REST (3 calls)'}
      </button>

      {logs.length > 0 && (
        <div className="space-y-2">
          {/* Waterfall timeline */}
          <div className="rounded-md border border-gray-200 bg-white p-3">
            <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-gray-400">
              Waterfall Timeline
            </p>
            {logs.map((log, i) => {
              const offset = logs.slice(0, i).reduce((sum, l) => sum + (l.duration ?? 0), 0)
              const maxTime = totalDuration || 1
              return (
                <div key={log.url} className="mb-1 flex items-center gap-2">
                  <span className="w-40 truncate text-right font-mono text-[10px] text-gray-500">
                    {log.url}
                  </span>
                  <div className="relative h-4 flex-1 rounded bg-gray-50">
                    {log.status === 'done' ? (
                      <div
                        className="absolute h-full rounded bg-red-400/70 transition-all"
                        style={{
                          left: `${(offset / maxTime) * 100}%`,
                          width: `${((log.duration ?? 0) / maxTime) * 100}%`,
                        }}
                      >
                        <span className="absolute inset-0 flex items-center justify-center text-[9px] font-medium text-white">
                          {log.duration}ms
                        </span>
                      </div>
                    ) : (
                      <div
                        className="absolute h-full animate-pulse rounded bg-yellow-200"
                        style={{
                          left: `${(offset / maxTime) * 100}%`,
                          width: '20%',
                        }}
                      />
                    )}
                  </div>
                </div>
              )
            })}
            {!loading && doneLogs.length === 3 && (
              <p className="mt-1 text-right text-[10px] text-red-500">
                순차 실행 총 {totalDuration}ms (각 요청이 이전 응답에 의존)
              </p>
            )}
          </div>

          {/* Request logs */}
          {logs.map((log, i) => (
            <div key={log.url}>
              <button
                onClick={() => log.status === 'done' && setExpandedIdx(expandedIdx === i ? null : i)}
                className="flex w-full items-center gap-3 rounded border border-gray-100 bg-gray-50 px-3 py-2 font-mono text-xs transition-colors hover:bg-gray-100"
              >
                <span className={`font-semibold ${log.status === 'done' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {log.status === 'done' ? '200' : '···'}
                </span>
                <span className="text-gray-500">GET</span>
                <span className="flex-1 text-left text-gray-800">{log.url}</span>
                {log.status === 'done' && log.response && (
                  <>
                    <span className="text-gray-400">{log.duration}ms</span>
                    <span className="text-red-500">
                      {log.response.fields.filter((f) => f.used).length}/
                      {log.response.fields.length} fields used
                    </span>
                    <span className="text-gray-400">{expandedIdx === i ? '▲' : '▼'}</span>
                  </>
                )}
                {log.status === 'pending' && (
                  <span className="h-3 w-3 animate-spin rounded-full border border-gray-300 border-t-yellow-500" />
                )}
              </button>

              {/* Expanded field view — shows over-fetching */}
              {expandedIdx === i && log.response && (
                <div className="ml-4 mt-1 rounded-md border border-gray-200 bg-gray-900 p-3">
                  <p className="mb-1 text-[10px] text-gray-500">
                    Response fields — <span className="text-green-400">used</span> vs{' '}
                    <span className="text-red-400/60">wasted (over-fetched)</span>
                  </p>
                  <div className="font-mono text-xs">
                    <span className="text-gray-500">{'{'}</span>
                    {log.response.fields.map((field, fi) => (
                      <div
                        key={fi}
                        className={`pl-4 ${field.used ? 'text-green-400' : 'text-red-400/40 line-through decoration-red-500/30'}`}
                      >
                        {field.key}: {field.value}
                        {!field.used && (
                          <span className="ml-2 text-[10px] text-red-500/50 no-underline">
                            ← 안 씀
                          </span>
                        )}
                        {field.used && (
                          <span className="ml-2 text-[10px] text-green-500/70">✓ 사용</span>
                        )}
                      </div>
                    ))}
                    <span className="text-gray-500">{'}'}</span>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Summary */}
          {!loading && doneLogs.length === 3 && (
            <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
              <p className="font-semibold">Summary</p>
              <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1">
                <span>Network requests:</span>
                <span className="font-mono font-semibold">{logs.length}회 (순차 실행)</span>
                <span>Total latency:</span>
                <span className="font-mono font-semibold">{totalDuration}ms</span>
                <span>Fields received:</span>
                <span className="font-mono font-semibold">{totalFields}개</span>
                <span>Fields actually used:</span>
                <span className="font-mono font-semibold">
                  {usedFields}개 ({wastedPct}% 낭비)
                </span>
              </div>
              {/* Visual waste bar */}
              <div className="mt-2 flex h-3 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="bg-green-500 transition-all"
                  style={{ width: `${100 - wastedPct}%` }}
                />
                <div
                  className="bg-red-400 transition-all"
                  style={{ width: `${wastedPct}%` }}
                />
              </div>
              <div className="mt-1 flex justify-between text-[10px]">
                <span className="text-green-700">사용된 데이터 ({100 - wastedPct}%)</span>
                <span className="text-red-600">버려진 데이터 ({wastedPct}%)</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
