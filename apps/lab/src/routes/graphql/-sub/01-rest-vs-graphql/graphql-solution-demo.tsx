import { useState } from 'react'
import { gqlFetch } from '../@shared/graphql-client'

const QUERY = `
  query UserProfile($id: ID!) {
    user(id: $id) {
      name
      avatar
      posts {
        title
        comments {
          body
        }
      }
    }
  }
`

type UserProfileData = {
  user: {
    name: string
    avatar: string
    posts: Array<{
      title: string
      comments: Array<{ body: string }>
    }>
  }
}

export function GraphQLSolutionDemo() {
  const [result, setResult] = useState<UserProfileData | null>(null)
  const [loading, setLoading] = useState(false)
  const [timing, setTiming] = useState<{ duration: number; dataSize: number } | null>(null)

  async function executeQuery() {
    setLoading(true)
    setResult(null)
    setTiming(null)

    const start = performance.now()
    const { data } = await gqlFetch<UserProfileData>(QUERY, { id: '1' })
    const duration = Math.round(performance.now() - start)
    const dataSize = JSON.stringify(data).length

    setResult(data)
    setTiming({ duration, dataSize })
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <button
        onClick={executeQuery}
        disabled={loading}
        className="rounded-md bg-green-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600 disabled:opacity-50"
      >
        {loading ? 'Fetching...' : 'Fetch with GraphQL (1 query)'}
      </button>

      {loading && (
        <div className="flex items-center gap-3 rounded border border-gray-100 bg-gray-50 px-3 py-2 font-mono text-xs">
          <span className="font-semibold text-yellow-600">···</span>
          <span className="text-gray-500">POST</span>
          <span className="flex-1 text-gray-800">/graphql</span>
          <span className="h-3 w-3 animate-spin rounded-full border border-gray-300 border-t-green-500" />
        </div>
      )}

      {result && timing && (
        <>
          <div className="flex items-center gap-3 rounded border border-gray-100 bg-gray-50 px-3 py-2 font-mono text-xs">
            <span className="font-semibold text-green-600">200</span>
            <span className="text-gray-500">POST</span>
            <span className="flex-1 text-gray-800">/graphql</span>
            <span className="text-gray-400">{timing.duration}ms</span>
            <span className="text-gray-400">{timing.dataSize}B</span>
            <span className="text-green-600">exact fields only</span>
          </div>

          <div className="rounded-md border border-gray-200 bg-gray-900 p-3">
            <pre className="overflow-x-auto text-xs text-green-400">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>

          <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700">
            <strong>Summary:</strong> 1 request · {timing.duration}ms · {timing.dataSize}B
            transferred · 0% wasted data
          </div>
        </>
      )}
    </div>
  )
}
