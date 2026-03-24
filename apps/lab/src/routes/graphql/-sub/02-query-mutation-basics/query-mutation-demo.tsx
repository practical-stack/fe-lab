import { useState } from 'react'
import { gqlFetch } from '../@shared/graphql-client'

const EXAMPLE_QUERIES = [
  {
    label: 'Query: 유저 목록',
    query: `query Users {
  users(first: 3) {
    edges {
      node {
        id
        name
        email
      }
    }
    totalCount
  }
}`,
  },
  {
    label: 'Query: 유저 + 게시글 (중첩)',
    query: `query UserWithPosts($id: ID!) {
  user(id: $id) {
    name
    posts {
      title
      comments {
        body
        author { name }
      }
    }
  }
}`,
    variables: '{ "id": "1" }',
  },
  {
    label: 'Mutation: 게시글 작성',
    query: `mutation CreatePost($input: CreatePostInput!) {
  createPost(input: $input) {
    post {
      id
      title
      body
      author { name }
      createdAt
    }
  }
}`,
    variables: '{ "input": { "title": "My New Post", "body": "Hello GraphQL!", "authorId": "1" } }',
  },
  {
    label: 'Query: 게시글 + 페이지네이션',
    query: `query Posts($first: Int, $after: String) {
  posts(first: $first, after: $after) {
    edges {
      node {
        title
        author { name }
      }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
    }
    totalCount
  }
}`,
    variables: '{ "first": 5 }',
  },
]

export function QueryMutationDemo() {
  const [query, setQuery] = useState(EXAMPLE_QUERIES[0].query)
  const [variables, setVariables] = useState('')
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function execute() {
    setLoading(true)
    setError(null)
    setResult('')

    try {
      let vars: Record<string, unknown> | undefined
      if (variables.trim()) {
        vars = JSON.parse(variables)
      }

      const res = await gqlFetch(query, vars)

      if (res.errors?.length) {
        setError(res.errors.map((e) => e.message).join('\n'))
      }
      if (res.data) {
        setResult(JSON.stringify(res.data, null, 2))
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  function loadExample(idx: number) {
    const example = EXAMPLE_QUERIES[idx]
    setQuery(example.query)
    setVariables(example.variables ?? '')
    setResult('')
    setError(null)
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {EXAMPLE_QUERIES.map((ex, i) => (
          <button
            key={i}
            onClick={() => loadExample(i)}
            className="rounded border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-700 transition-colors hover:border-blue-300 hover:bg-blue-50"
          >
            {ex.label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-500">Query / Mutation</label>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={12}
            spellCheck={false}
            className="w-full rounded-md border border-gray-200 bg-gray-900 p-3 font-mono text-xs text-green-400 focus:border-blue-400 focus:outline-none"
          />

          <label className="block text-xs font-medium text-gray-500">Variables (JSON)</label>
          <textarea
            value={variables}
            onChange={(e) => setVariables(e.target.value)}
            rows={3}
            spellCheck={false}
            placeholder="{}"
            className="w-full rounded-md border border-gray-200 bg-gray-900 p-3 font-mono text-xs text-yellow-400 focus:border-blue-400 focus:outline-none"
          />

          <button
            onClick={execute}
            disabled={loading || !query.trim()}
            className="w-full rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Executing...' : 'Execute ▶'}
          </button>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-500">Result</label>
          <div className="h-full min-h-[200px] rounded-md border border-gray-200 bg-gray-900 p-3">
            {error && <pre className="whitespace-pre-wrap text-xs text-red-400">{error}</pre>}
            {result && <pre className="whitespace-pre-wrap text-xs text-green-400">{result}</pre>}
            {!result && !error && (
              <p className="text-xs text-gray-500">Execute a query to see results...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
