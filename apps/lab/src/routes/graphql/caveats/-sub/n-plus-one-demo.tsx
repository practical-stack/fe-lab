import { useState } from 'react'

type QueryLog = {
  query: string
  table: string
  trigger: string
  batchGroup?: string
}

const N_PLUS_ONE_QUERIES: QueryLog[] = [
  { query: 'SELECT * FROM posts LIMIT 5', table: 'posts', trigger: 'Query.posts resolver' },
  { query: 'SELECT * FROM users WHERE id = 1', table: 'users', trigger: 'Post.author resolver (post #1)' },
  { query: 'SELECT * FROM users WHERE id = 1', table: 'users', trigger: 'Post.author resolver (post #2)' },
  { query: 'SELECT * FROM users WHERE id = 2', table: 'users', trigger: 'Post.author resolver (post #3)' },
  { query: 'SELECT * FROM users WHERE id = 2', table: 'users', trigger: 'Post.author resolver (post #4)' },
  { query: 'SELECT * FROM users WHERE id = 3', table: 'users', trigger: 'Post.author resolver (post #5)' },
]

const DATALOADER_QUERIES: QueryLog[] = [
  { query: 'SELECT * FROM posts LIMIT 5', table: 'posts', trigger: 'Query.posts resolver', batchGroup: 'A' },
  { query: 'SELECT * FROM users WHERE id IN (1, 2, 3)', table: 'users', trigger: 'DataLoader.load() — 5개 요청을 1개 배치 쿼리로 합침', batchGroup: 'B' },
]

export function NPlusOneDemo() {
  const [mode, setMode] = useState<'naive' | 'dataloader'>('naive')
  const [visibleCount, setVisibleCount] = useState(0)
  const [running, setRunning] = useState(false)

  const queries = mode === 'naive' ? N_PLUS_ONE_QUERIES : DATALOADER_QUERIES

  async function runSimulation() {
    setVisibleCount(0)
    setRunning(true)
    for (let i = 0; i < queries.length; i++) {
      await new Promise((r) => setTimeout(r, mode === 'naive' ? 400 : 600))
      setVisibleCount(i + 1)
    }
    setRunning(false)
  }

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="flex items-center gap-3">
        <div className="flex rounded-md border border-gray-200">
          <button
            onClick={() => { setMode('naive'); setVisibleCount(0) }}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              mode === 'naive' ? 'bg-red-500 text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            N+1 Problem
          </button>
          <button
            onClick={() => { setMode('dataloader'); setVisibleCount(0) }}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              mode === 'dataloader' ? 'bg-green-500 text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            DataLoader Solution
          </button>
        </div>
        <button
          onClick={runSimulation}
          disabled={running}
          className="rounded-md bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600 disabled:opacity-50"
        >
          {running ? 'Running...' : 'Run Query Simulation'}
        </button>
      </div>

      {/* GraphQL query being executed */}
      <div className="rounded-md border border-gray-200 bg-gray-900 p-3">
        <p className="mb-1 text-[10px] text-gray-500">Incoming GraphQL Query</p>
        <pre className="text-xs text-green-400">{`query {
  posts(first: 5) {
    title
    author {   # ← 각 post마다 author resolver가 실행됨
      name
    }
  }
}`}</pre>
      </div>

      {/* DB query log */}
      <div className="rounded-md border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2">
          <span className="text-xs font-medium text-gray-500">DB Query Log</span>
          <span className={`text-xs font-bold ${mode === 'naive' ? 'text-red-600' : 'text-green-600'}`}>
            {visibleCount > 0 ? `${Math.min(visibleCount, queries.length)}/${queries.length} queries` : '—'}
          </span>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {queries.slice(0, visibleCount).map((q, i) => (
            <div
              key={i}
              className={`border-b border-gray-50 px-3 py-2 last:border-0 ${
                i === visibleCount - 1 ? 'animate-pulse bg-yellow-50' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="rounded bg-gray-100 px-1 py-0.5 font-mono text-[10px] text-gray-500">
                  #{i + 1}
                </span>
                {q.batchGroup && (
                  <span className="rounded bg-green-100 px-1 py-0.5 text-[10px] font-bold text-green-700">
                    batch {q.batchGroup}
                  </span>
                )}
                <span className="text-[10px] text-gray-400">{q.table}</span>
              </div>
              <p className="mt-0.5 font-mono text-xs text-blue-700">{q.query}</p>
              <p className="mt-0.5 text-[10px] text-gray-500">← {q.trigger}</p>
            </div>
          ))}
          {visibleCount === 0 && (
            <p className="px-3 py-4 text-center text-xs text-gray-400">
              Run Simulation을 클릭하면 DB 쿼리 실행 과정을 볼 수 있습니다
            </p>
          )}
        </div>
      </div>

      {/* Summary */}
      {!running && visibleCount > 0 && (
        <div
          className={`rounded-md border px-4 py-3 text-xs ${
            mode === 'naive'
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-green-200 bg-green-50 text-green-700'
          }`}
        >
          {mode === 'naive' ? (
            <>
              <p className="font-semibold">N+1 Problem 발생!</p>
              <p className="mt-1">
                posts를 가져오는 쿼리 <strong>1회</strong> + 각 post의 author를 가져오는 쿼리{' '}
                <strong>N회</strong> = 총 <strong>{queries.length}회</strong> DB 쿼리.
                post가 100개면 101회 쿼리가 실행됩니다.
              </p>
              <p className="mt-1">
                더 심각한 건 <code className="rounded bg-red-100 px-1">user id = 1</code>에 대한
                쿼리가 중복 실행된다는 점입니다. 같은 author인데도 매번 DB에 요청합니다.
              </p>
            </>
          ) : (
            <>
              <p className="font-semibold">DataLoader로 해결!</p>
              <p className="mt-1">
                DataLoader가 같은 tick 내의 <code className="rounded bg-green-100 px-1">load(id)</code>{' '}
                호출을 모아서 하나의 <code className="rounded bg-green-100 px-1">WHERE id IN (...)</code>{' '}
                배치 쿼리로 합칩니다. 6회 → <strong>2회</strong>로 감소.
              </p>
              <p className="mt-1">
                중복 ID도 자동으로 dedupe됩니다. 5개 post의 author가 3명이면, 3개 ID만 조회합니다.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  )
}
