import { useState } from 'react'

type QueryExample = {
  label: string
  query: string
  depth: number
  fields: number
  complexity: number
  risk: 'low' | 'medium' | 'high' | 'blocked'
}

const QUERIES: QueryExample[] = [
  {
    label: '단순 쿼리',
    query: `query {
  user(id: "1") {
    name
    email
  }
}`,
    depth: 1,
    fields: 2,
    complexity: 2,
    risk: 'low',
  },
  {
    label: '중첩 쿼리',
    query: `query {
  users(first: 10) {
    edges {
      node {
        name
        posts {
          title
          author { name }
        }
      }
    }
  }
}`,
    depth: 5,
    fields: 4,
    complexity: 40,
    risk: 'medium',
  },
  {
    label: '깊은 중첩 (악의적)',
    query: `query {
  users(first: 100) {
    edges {
      node {
        posts {
          comments {
            author {
              posts {
                comments {
                  author {
                    posts { title }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}`,
    depth: 10,
    fields: 4,
    complexity: 100_000_000,
    risk: 'blocked',
  },
  {
    label: '넓은 쿼리 (field explosion)',
    query: `query {
  user1: user(id: "1") { name email avatar posts { title } }
  user2: user(id: "2") { name email avatar posts { title } }
  user3: user(id: "3") { name email avatar posts { title } }
  user4: user(id: "4") { name email avatar posts { title } }
  user5: user(id: "5") { name email avatar posts { title } }
  # ... aliases를 이용해 무한 반복 가능
}`,
    depth: 2,
    fields: 25,
    complexity: 50,
    risk: 'high',
  },
]

const RISK_STYLES = {
  low: { bg: 'bg-green-100', text: 'text-green-700', label: 'PASS' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'WARN' },
  high: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'THROTTLE' },
  blocked: { bg: 'bg-red-100', text: 'text-red-700', label: 'BLOCKED' },
}

export function ServerComplexityDemo() {
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [analyzed, setAnalyzed] = useState(false)

  const q = QUERIES[selectedIdx]
  const risk = RISK_STYLES[q.risk]

  return (
    <div className="space-y-4">
      {/* Query selector */}
      <div className="flex flex-wrap gap-1.5">
        {QUERIES.map((query, i) => (
          <button
            key={i}
            onClick={() => { setSelectedIdx(i); setAnalyzed(false) }}
            className={`rounded border px-2.5 py-1 text-xs font-medium transition-colors ${
              selectedIdx === i
                ? 'border-blue-300 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}
          >
            {query.label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {/* Query */}
        <div>
          <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-gray-400">
            Incoming Query
          </label>
          <div className="rounded-md border border-gray-200 bg-gray-900 p-3">
            <pre className="text-xs text-green-400">{q.query}</pre>
          </div>
          <button
            onClick={() => setAnalyzed(true)}
            className="mt-2 w-full rounded-md bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600"
          >
            Analyze Complexity
          </button>
        </div>

        {/* Analysis result */}
        <div>
          <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-gray-400">
            Complexity Analysis
          </label>
          {analyzed ? (
            <div className="space-y-2">
              <div className={`rounded-md border px-3 py-2 ${q.risk === 'blocked' ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Verdict</span>
                  <span className={`rounded px-2 py-0.5 text-xs font-bold ${risk.bg} ${risk.text}`}>
                    {risk.label}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 rounded-md border border-gray-200 bg-white p-3">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Query Depth</span>
                  <span className="font-mono font-semibold text-gray-800">
                    {q.depth} <span className="font-normal text-gray-400">/ max 7</span>
                  </span>
                </div>
                <div className="h-2 rounded-full bg-gray-100">
                  <div
                    className={`h-full rounded-full transition-all ${q.depth > 7 ? 'bg-red-500' : q.depth > 4 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min((q.depth / 10) * 100, 100)}%` }}
                  />
                </div>

                <div className="mt-2 flex justify-between text-xs">
                  <span className="text-gray-500">Field Count</span>
                  <span className="font-mono font-semibold text-gray-800">{q.fields}</span>
                </div>

                <div className="mt-2 flex justify-between text-xs">
                  <span className="text-gray-500">Estimated Cost</span>
                  <span className={`font-mono font-semibold ${q.complexity > 1000 ? 'text-red-600' : q.complexity > 30 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {q.complexity.toLocaleString()}
                    <span className="font-normal text-gray-400"> / max 1,000</span>
                  </span>
                </div>
                <div className="h-2 rounded-full bg-gray-100">
                  <div
                    className={`h-full rounded-full transition-all ${q.complexity > 1000 ? 'bg-red-500' : q.complexity > 30 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min((q.complexity / 1000) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {q.risk === 'blocked' && (
                <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700">
                  <strong>BLOCKED:</strong> 이 쿼리는 depth 10, 예상 비용 1억으로 서버 리소스를
                  고갈시킬 수 있습니다. 프로덕션에서는 반드시 거부해야 합니다.
                </div>
              )}
              {q.risk === 'high' && (
                <div className="rounded border border-orange-200 bg-orange-50 px-3 py-2 text-[11px] text-orange-700">
                  <strong>THROTTLE:</strong> aliases를 이용한 field explosion 공격입니다.
                  depth는 낮지만 총 필드 수가 많아 비용이 높습니다.
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center rounded border border-gray-200 bg-gray-50 text-xs text-gray-400">
              Analyze를 클릭하면 쿼리 복잡도가 분석됩니다
            </div>
          )}
        </div>
      </div>

      {/* Protection strategies */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 text-xs leading-relaxed text-gray-700">
        <h4 className="mb-2 font-semibold text-gray-900">서버 보호 전략</h4>
        <div className="grid gap-2 md:grid-cols-2">
          <div className="rounded border border-gray-100 p-2">
            <p className="font-medium text-gray-800">Depth Limiting</p>
            <p className="text-[11px] text-gray-500">쿼리 중첩 깊이를 제한 (보통 7-10). 깊은 circular 탐색 방지</p>
          </div>
          <div className="rounded border border-gray-100 p-2">
            <p className="font-medium text-gray-800">Cost Analysis</p>
            <p className="text-[11px] text-gray-500">필드마다 비용 가중치를 설정, 총합이 limit 초과 시 거부</p>
          </div>
          <div className="rounded border border-gray-100 p-2">
            <p className="font-medium text-gray-800">Rate Limiting</p>
            <p className="text-[11px] text-gray-500">클라이언트별 초당/분당 쿼리 수 제한. 복잡한 쿼리는 더 높은 비용 부과</p>
          </div>
          <div className="rounded border border-gray-100 p-2">
            <p className="font-medium text-gray-800">Persisted Queries</p>
            <p className="text-[11px] text-gray-500">사전 등록된 쿼리만 허용. 임의 쿼리 완전 차단 (가장 강력)</p>
          </div>
        </div>
      </div>
    </div>
  )
}
