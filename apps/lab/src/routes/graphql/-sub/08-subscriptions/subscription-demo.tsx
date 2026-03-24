import { useState, useEffect, useRef } from 'react'

type LiveComment = {
  id: string
  body: string
  author: string
  timestamp: string
  isNew?: boolean
}

const SIMULATED_COMMENTS: Omit<LiveComment, 'id' | 'timestamp'>[] = [
  { body: 'Just joined the discussion!', author: 'Diana Choi' },
  { body: 'This is really helpful, thanks!', author: 'Eric Jung' },
  { body: 'Can you explain fragments more?', author: 'Bob Park' },
  { body: 'Great example of optimistic UI!', author: 'Charlie Lee' },
  { body: 'Relay is more powerful than I thought.', author: 'Alice Kim' },
]

/**
 * Simulated subscription demo — shows real-time comment feed concept.
 * Uses setInterval to simulate incoming subscription events since
 * MSW doesn't support actual WebSocket subscriptions.
 */
export function SubscriptionDemo() {
  const [comments, setComments] = useState<LiveComment[]>([])
  const [connected, setConnected] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const indexRef = useRef(0)

  function startSubscription() {
    setConnected(true)
    indexRef.current = 0

    intervalRef.current = setInterval(() => {
      if (indexRef.current >= SIMULATED_COMMENTS.length) {
        stopSubscription()
        return
      }

      const simulated = SIMULATED_COMMENTS[indexRef.current]
      const newComment: LiveComment = {
        id: `sub-${Date.now()}`,
        body: simulated.body,
        author: simulated.author,
        timestamp: new Date().toLocaleTimeString(),
        isNew: true,
      }

      setComments((prev) => {
        // Remove isNew from previous comments
        const updated = prev.map((c) => ({ ...c, isNew: false }))
        return [...updated, newComment]
      })

      indexRef.current++
    }, 2000)
  }

  function stopSubscription() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setConnected(false)
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  return (
    <div className="space-y-4">
      {/* Connection status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${connected ? 'animate-pulse bg-green-500' : 'bg-gray-300'}`}
          />
          <span className="text-xs text-gray-600">
            {connected ? 'Subscription active — listening for new comments' : 'Disconnected'}
          </span>
        </div>
        <button
          onClick={connected ? stopSubscription : startSubscription}
          className={`rounded-md px-3 py-1.5 text-xs font-medium text-white ${
            connected ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {connected ? 'Unsubscribe' : 'Subscribe to Comments'}
        </button>
      </div>

      {/* Live feed */}
      <div className="max-h-64 space-y-1.5 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-3">
        {comments.length === 0 && (
          <p className="py-4 text-center text-xs text-gray-400">
            Subscribe를 클릭하면 실시간 댓글이 나타납니다
          </p>
        )}
        {comments.map((c) => (
          <div
            key={c.id}
            className={`rounded border px-3 py-2 text-xs transition-all duration-500 ${
              c.isNew
                ? 'border-blue-200 bg-blue-50 shadow-sm'
                : 'border-gray-100 bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <strong className="text-gray-700">{c.author}</strong>
              <span className="text-[9px] text-gray-400">{c.timestamp}</span>
            </div>
            <p className="mt-0.5 text-gray-600">{c.body}</p>
          </div>
        ))}
      </div>

      {/* Code example */}
      <div className="rounded-md border border-gray-200 bg-gray-900 p-3">
        <pre className="text-xs text-green-400">{`// Relay Subscription API
const subscription = graphql\`
  subscription CommentAddedSubscription($postId: ID!) {
    commentAdded(postId: $postId) {
      id
      body
      author { name }
    }
  }
\`

// 컴포넌트에서:
requestSubscription(environment, {
  subscription,
  variables: { postId: "1" },
  onNext: (response) => {
    // Relay Store에 자동으로 추가됨
    console.log('New comment:', response.commentAdded)
  },
  updater: (store) => {
    // Store에 새 댓글을 수동으로 연결할 수도 있음
    const newComment = store.getRootField('commentAdded')
    const post = store.get('Post:1')
    const comments = post.getLinkedRecords('comments')
    post.setLinkedRecords([...comments, newComment], 'comments')
  },
})`}</pre>
      </div>

      <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
        <strong>Note:</strong> 이 데모는 setInterval로 subscription을 시뮬레이션합니다. 실제
        환경에서는 <code className="rounded bg-amber-100 px-1">graphql-ws</code> 라이브러리로
        WebSocket 연결을 관리합니다. Relay의{' '}
        <code className="rounded bg-amber-100 px-1">requestSubscription</code>이 연결 수명주기와
        Store 업데이트를 처리합니다.
      </div>
    </div>
  )
}
