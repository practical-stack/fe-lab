import { useState, useEffect } from 'react'

type Section = {
  id: string
  label: string
  loadTime: number // ms
  data?: string
  status: 'pending' | 'loading' | 'loaded'
}

/**
 * Simulated @defer/@stream demo.
 * Shows how parts of a response can arrive incrementally.
 */
export function DeferStreamDemo() {
  const [mode, setMode] = useState<'blocking' | 'deferred'>('blocking')
  const [sections, setSections] = useState<Section[]>([])
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  const SECTIONS: Omit<Section, 'status'>[] = [
    { id: 'header', label: 'User Header', loadTime: 100, data: 'Alice Kim — alice@example.com' },
    { id: 'posts', label: 'Recent Posts (5)', loadTime: 300, data: 'Getting Started with GraphQL, Why Relay?, Understanding Fragments, Cursor-Based Pagination, Optimistic UI Updates' },
    { id: 'stats', label: 'User Statistics', loadTime: 800, data: '20 posts, 15 comments, 42 followers, Member since 2024' },
    { id: 'recommendations', label: 'Recommended Users', loadTime: 1500, data: 'Bob Park, Charlie Lee, Diana Choi — based on reading history' },
  ]

  async function runBlocking() {
    setRunning(true)
    setElapsed(0)
    setSections(SECTIONS.map((s) => ({ ...s, status: 'loading' })))

    const start = Date.now()
    const timer = setInterval(() => setElapsed(Date.now() - start), 50)

    // All sections load together — total time = max(all loadTimes)
    const maxTime = Math.max(...SECTIONS.map((s) => s.loadTime))
    await new Promise((r) => setTimeout(r, maxTime))

    setSections(SECTIONS.map((s) => ({ ...s, status: 'loaded' })))
    clearInterval(timer)
    setElapsed(maxTime)
    setRunning(false)
  }

  async function runDeferred() {
    setRunning(true)
    setElapsed(0)
    setSections(SECTIONS.map((s) => ({ ...s, status: 'pending' })))

    const start = Date.now()
    const timer = setInterval(() => setElapsed(Date.now() - start), 50)

    // Each section arrives as soon as it's ready
    for (const section of [...SECTIONS].sort((a, b) => a.loadTime - b.loadTime)) {
      const elapsed = Date.now() - start
      const remaining = section.loadTime - elapsed
      if (remaining > 0) await new Promise((r) => setTimeout(r, remaining))

      setSections((prev) =>
        prev.map((s) => (s.id === section.id ? { ...s, status: 'loaded' } : s)),
      )
    }

    clearInterval(timer)
    setElapsed(Math.max(...SECTIONS.map((s) => s.loadTime)))
    setRunning(false)
  }

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="flex items-center gap-3">
        <div className="flex rounded-md border border-gray-200">
          <button
            onClick={() => setMode('blocking')}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              mode === 'blocking' ? 'bg-red-500 text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Blocking (기존)
          </button>
          <button
            onClick={() => setMode('deferred')}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              mode === 'deferred' ? 'bg-green-500 text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            @defer (점진적)
          </button>
        </div>
        <button
          onClick={mode === 'blocking' ? runBlocking : runDeferred}
          disabled={running}
          className="rounded-md bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600 disabled:opacity-50"
        >
          {running ? `${elapsed}ms...` : 'Execute Query'}
        </button>
      </div>

      {/* Query visualization */}
      <div className="rounded-md border border-gray-200 bg-gray-900 p-3">
        <pre className="text-xs text-green-400">
          {mode === 'blocking'
            ? `query UserProfile($id: ID!) {
  user(id: $id) {
    name email              # header
    posts { title }         # posts
    stats { ... }           # stats (느림)
    recommendations { ... } # recommendations (매우 느림)
  }
}
# ← 모든 필드가 준비될 때까지 응답을 보류`
            : `query UserProfile($id: ID!) {
  user(id: $id) {
    name email              # 즉시 전송
    posts { title }         # 곧바로 전송
    ... @defer {
      stats { ... }         # 준비되면 청크로 전송
    }
    ... @defer {
      recommendations { ... } # 나중에 청크로 전송
    }
  }
}
# ← 빠른 필드부터 점진적으로 응답 스트리밍`}
        </pre>
      </div>

      {/* Sections rendering */}
      <div className="grid gap-2 md:grid-cols-2">
        {sections.map((section) => (
          <div
            key={section.id}
            className={`rounded-lg border p-3 transition-all duration-300 ${
              section.status === 'loaded'
                ? 'border-green-200 bg-white'
                : section.status === 'loading'
                  ? 'border-yellow-200 bg-yellow-50'
                  : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-700">{section.label}</span>
              <span
                className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                  section.status === 'loaded'
                    ? 'bg-green-100 text-green-700'
                    : section.status === 'loading'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-500'
                }`}
              >
                {section.status === 'loaded'
                  ? `${section.loadTime}ms`
                  : section.status === 'loading'
                    ? 'waiting...'
                    : 'pending'}
              </span>
            </div>
            {section.status === 'loaded' ? (
              <p className="mt-1 text-[11px] text-gray-600">{section.data}</p>
            ) : section.status === 'loading' ? (
              <div className="mt-1.5 flex gap-1">
                <div className="h-2 w-16 animate-pulse rounded bg-yellow-200" />
                <div className="h-2 w-10 animate-pulse rounded bg-yellow-200" />
              </div>
            ) : (
              <div className="mt-1.5 flex gap-1">
                <div className="h-2 w-16 rounded bg-gray-200" />
                <div className="h-2 w-10 rounded bg-gray-200" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Comparison summary */}
      {!running && sections.length > 0 && sections.every((s) => s.status === 'loaded') && (
        <div
          className={`rounded-md border px-4 py-3 text-xs ${
            mode === 'blocking'
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-green-200 bg-green-50 text-green-700'
          }`}
        >
          {mode === 'blocking' ? (
            <p>
              <strong>Blocking:</strong> 모든 데이터가 준비될 때까지 1500ms 동안 아무것도 표시되지
              않음. 가장 느린 필드가 전체 응답 시간을 결정합니다.
            </p>
          ) : (
            <p>
              <strong>@defer:</strong> Header가 100ms에 먼저 표시되고, Posts가 300ms에, Stats가
              800ms에, Recommendations가 1500ms에 도착합니다. 사용자는 100ms부터 콘텐츠를 볼 수
              있습니다.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
