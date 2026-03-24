import { useState } from 'react'

type CacheEntry = {
  url: string
  method: string
  cacheStatus: 'HIT' | 'MISS' | 'N/A'
  explanation: string
}

export function HttpCachingDemo() {
  const [restLogs, setRestLogs] = useState<CacheEntry[]>([])
  const [gqlLogs, setGqlLogs] = useState<CacheEntry[]>([])
  const [step, setStep] = useState(0) // 0: initial, 1: first fetch, 2: second fetch

  async function simulateFirstFetch() {
    setStep(1)
    setRestLogs([
      { url: 'GET /api/users/1', method: 'GET', cacheStatus: 'MISS', explanation: '첫 요청 — 캐시 비어있음. 서버에서 가져오고 Cache-Control: max-age=60 으로 캐싱' },
      { url: 'GET /api/users/1/posts', method: 'GET', cacheStatus: 'MISS', explanation: '첫 요청 — 서버에서 가져오고 URL 기반으로 브라우저/CDN에 캐싱됨' },
    ])
    setGqlLogs([
      { url: 'POST /graphql', method: 'POST', cacheStatus: 'N/A', explanation: '첫 요청 — POST 요청이므로 HTTP 캐시 자체가 작동하지 않음. 요청 바디(query)가 매번 다를 수 있어 URL만으로 캐시 키를 만들 수 없음' },
    ])
  }

  async function simulateSecondFetch() {
    setStep(2)
    setRestLogs([
      { url: 'GET /api/users/1', method: 'GET', cacheStatus: 'HIT', explanation: '같은 URL 재요청 → 브라우저 캐시에서 즉시 반환. 네트워크 요청 0' },
      { url: 'GET /api/users/1/posts', method: 'GET', cacheStatus: 'HIT', explanation: 'CDN 캐시 HIT. 오리진 서버까지 가지 않고 엣지에서 반환' },
    ])
    setGqlLogs([
      { url: 'POST /graphql', method: 'POST', cacheStatus: 'N/A', explanation: '같은 쿼리를 다시 보내도 POST 요청은 HTTP 캐시를 타지 않음. 매번 서버까지 도달함. 클라이언트 사이드 normalized cache(Apollo/Relay)가 별도로 필요' },
    ])
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={simulateFirstFetch}
          disabled={step >= 1}
          className="rounded-md bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600 disabled:opacity-40"
        >
          1. 첫 번째 요청
        </button>
        <button
          onClick={simulateSecondFetch}
          disabled={step < 1 || step >= 2}
          className="rounded-md bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600 disabled:opacity-40"
        >
          2. 같은 데이터 재요청
        </button>
        <button
          onClick={() => { setStep(0); setRestLogs([]); setGqlLogs([]) }}
          className="rounded-md border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
        >
          Reset
        </button>
      </div>

      {step > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* REST side */}
          <div className="rounded-lg border border-green-200 bg-green-50/30 p-4">
            <h4 className="mb-2 text-xs font-bold text-green-800">REST — HTTP Cache 활용 가능</h4>
            <div className="space-y-2">
              {restLogs.map((log, i) => (
                <div key={i} className="rounded border border-green-100 bg-white p-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-gray-500">{log.url}</span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                        log.cacheStatus === 'HIT'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {log.cacheStatus}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-gray-600">{log.explanation}</p>
                </div>
              ))}
            </div>
            {step === 2 && (
              <div className="mt-2 rounded bg-green-100 px-2 py-1.5 text-[11px] font-medium text-green-800">
                두 번째 요청: 네트워크 0회, 캐시에서 즉시 반환
              </div>
            )}
          </div>

          {/* GraphQL side */}
          <div className="rounded-lg border border-red-200 bg-red-50/30 p-4">
            <h4 className="mb-2 text-xs font-bold text-red-800">GraphQL — HTTP Cache 사용 불가</h4>
            <div className="space-y-2">
              {gqlLogs.map((log, i) => (
                <div key={i} className="rounded border border-red-100 bg-white p-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-gray-500">{log.url}</span>
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-500">
                      {log.cacheStatus}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-gray-600">{log.explanation}</p>
                </div>
              ))}
            </div>
            {step === 2 && (
              <div className="mt-2 rounded bg-red-100 px-2 py-1.5 text-[11px] font-medium text-red-800">
                두 번째 요청: 여전히 서버까지 도달 (HTTP 캐시 미작동)
              </div>
            )}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-xs leading-relaxed text-gray-700">
          <h4 className="mb-1 font-semibold text-gray-900">해결 방법</h4>
          <ul className="space-y-1.5">
            <li>
              <strong>Persisted Queries:</strong> 쿼리를 해시로 등록하고 GET 요청으로 전환하면 CDN
              캐싱이 가능해집니다. 하지만 쿼리 등록/관리 인프라가 추가로 필요합니다.
            </li>
            <li>
              <strong>Normalized Client Cache:</strong> Apollo Client의 InMemoryCache나 Relay
              Store처럼, 응답을 엔티티 단위로 정규화하여 클라이언트에 캐싱합니다. 같은 엔티티를
              참조하는 다른 쿼리에도 자동으로 반영됩니다.
            </li>
            <li>
              <strong>CDN at GraphQL layer:</strong> Stellate, GraphCDN 같은 GraphQL-aware CDN이
              쿼리 단위로 캐싱을 제공합니다.
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}
