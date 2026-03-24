import { useState } from 'react'
import { gqlFetch } from '../../-sub/@shared/graphql-client'

const SCENARIOS = [
  {
    label: 'Partial Success',
    description: '하나의 쿼리에서 일부는 성공, 일부는 실패하는 경우',
    query: `query {
  user(id: "1") {
    name
    email
  }
  nonExistent: user(id: "999") {
    name
  }
}`,
  },
  {
    label: 'Validation Error',
    description: '쿼리 문법이 잘못된 경우 — 존재하지 않는 필드 요청',
    query: `query {
  user(id: "1") {
    name
    nonExistentField
  }
}`,
  },
  {
    label: 'Success',
    description: '정상적인 쿼리 — 200 OK + 에러 없음',
    query: `query {
  user(id: "1") {
    name
    email
    posts {
      title
    }
  }
}`,
  },
]

export function ErrorHandlingDemo() {
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [response, setResponse] = useState<{
    httpStatus: number
    body: { data?: unknown; errors?: Array<{ message: string }> }
  } | null>(null)
  const [loading, setLoading] = useState(false)

  async function execute() {
    setLoading(true)
    setResponse(null)

    try {
      const result = await gqlFetch(SCENARIOS[selectedIdx].query)
      // GraphQL always returns 200
      setResponse({ httpStatus: 200, body: result })
    } catch (err) {
      setResponse({
        httpStatus: 200,
        body: { errors: [{ message: err instanceof Error ? err.message : 'Unknown error' }] },
      })
    } finally {
      setLoading(false)
    }
  }

  const scenario = SCENARIOS[selectedIdx]

  return (
    <div className="space-y-4">
      {/* Scenario selector */}
      <div className="flex flex-wrap gap-1.5">
        {SCENARIOS.map((s, i) => (
          <button
            key={i}
            onClick={() => { setSelectedIdx(i); setResponse(null) }}
            className={`rounded border px-2.5 py-1 text-xs font-medium transition-colors ${
              selectedIdx === i
                ? 'border-blue-300 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-500">{scenario.description}</p>

      <div className="grid gap-3 md:grid-cols-2">
        {/* Query */}
        <div>
          <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-gray-400">
            GraphQL Query
          </label>
          <div className="rounded-md border border-gray-200 bg-gray-900 p-3">
            <pre className="text-xs text-green-400">{scenario.query}</pre>
          </div>
          <button
            onClick={execute}
            disabled={loading}
            className="mt-2 w-full rounded-md bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Executing...' : 'Execute'}
          </button>
        </div>

        {/* Response */}
        <div>
          <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-gray-400">
            HTTP Response
          </label>
          {response ? (
            <div className="space-y-2">
              {/* HTTP status */}
              <div className="flex items-center gap-2 rounded border border-gray-200 bg-gray-50 px-3 py-1.5">
                <span className="text-xs font-bold text-green-600">HTTP {response.httpStatus}</span>
                <span className="text-[10px] text-gray-500">
                  ← 항상 200 (에러가 있어도!)
                </span>
              </div>

              {/* Body */}
              <div className="rounded-md border border-gray-200 bg-gray-900 p-3">
                {response.body.data !== undefined && (
                  <div>
                    <span className="text-[10px] text-gray-500">data:</span>
                    <pre className="text-xs text-green-400">
                      {JSON.stringify(response.body.data, null, 2)}
                    </pre>
                  </div>
                )}
                {response.body.errors && (
                  <div className={response.body.data !== undefined ? 'mt-2 border-t border-gray-700 pt-2' : ''}>
                    <span className="text-[10px] text-red-400">errors:</span>
                    <pre className="text-xs text-red-400">
                      {JSON.stringify(response.body.errors, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* Annotation */}
              {response.body.errors && response.body.data && (
                <div className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
                  <strong>Partial response:</strong> data와 errors가 동시에 존재합니다. REST에서는
                  200 또는 4xx/5xx 중 하나지만, GraphQL은 "부분 성공"이 가능합니다. 클라이언트는
                  errors 배열을 항상 체크해야 합니다.
                </div>
              )}
              {response.body.errors && !response.body.data && (
                <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700">
                  <strong>Full error:</strong> 쿼리 validation 실패 시 data는 null이고 errors만
                  반환됩니다. 하지만 HTTP 상태 코드는 여전히 200입니다.
                </div>
              )}
              {!response.body.errors && (
                <div className="rounded border border-green-200 bg-green-50 px-3 py-2 text-[11px] text-green-700">
                  <strong>Clean success:</strong> errors 필드가 없으면 모든 resolver가 성공한
                  것입니다.
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center rounded border border-gray-200 bg-gray-50 text-xs text-gray-400">
              Execute를 클릭하면 결과가 여기에 표시됩니다
            </div>
          )}
        </div>
      </div>

      {/* REST vs GraphQL comparison */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h4 className="mb-2 text-xs font-bold text-gray-700">REST vs GraphQL 에러 모델 비교</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-2 py-1.5 text-left text-gray-500">상황</th>
                <th className="px-2 py-1.5 text-left text-gray-500">REST</th>
                <th className="px-2 py-1.5 text-left text-gray-500">GraphQL</th>
              </tr>
            </thead>
            <tbody className="text-gray-600">
              <tr className="border-b border-gray-50">
                <td className="px-2 py-1.5">리소스 없음</td>
                <td className="px-2 py-1.5 font-mono text-red-600">404 Not Found</td>
                <td className="px-2 py-1.5 font-mono text-green-600">200 + data.user: null</td>
              </tr>
              <tr className="border-b border-gray-50">
                <td className="px-2 py-1.5">인증 실패</td>
                <td className="px-2 py-1.5 font-mono text-red-600">401 Unauthorized</td>
                <td className="px-2 py-1.5 font-mono text-green-600">200 + errors[0].extensions.code: "UNAUTHENTICATED"</td>
              </tr>
              <tr className="border-b border-gray-50">
                <td className="px-2 py-1.5">잘못된 요청</td>
                <td className="px-2 py-1.5 font-mono text-red-600">400 Bad Request</td>
                <td className="px-2 py-1.5 font-mono text-green-600">200 + errors (validation)</td>
              </tr>
              <tr>
                <td className="px-2 py-1.5">부분 실패</td>
                <td className="px-2 py-1.5 text-gray-400">불가능 (all or nothing)</td>
                <td className="px-2 py-1.5 font-mono text-green-600">200 + data (partial) + errors</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
