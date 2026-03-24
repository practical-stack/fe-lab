import { useState } from 'react'
import { gqlFetch } from '../@shared/graphql-client'

type Comment = { id: string; body: string; author: string }

export function OptimisticProblemDemo() {
  const [comments, setComments] = useState<Comment[]>([
    { id: '1', body: 'Great introduction!', author: 'Bob Park' },
    { id: '2', body: 'This helped me understand the basics.', author: 'Charlie Lee' },
  ])
  const [input, setInput] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function addComment() {
    if (!input.trim()) return
    setSubmitting(true)

    // Slow mutation — UI freezes for 800ms with no feedback
    const { data } = await gqlFetch<{
      addComment: { comment: { id: string; body: string; author: { name: string } } }
    }>(
      `mutation($input: AddCommentInput!) {
        addComment(input: $input) {
          comment { id body author { name } }
        }
      }`,
      { input: { postId: '1', body: input, authorId: '1' } },
    )

    if (data?.addComment?.comment) {
      setComments((prev) => [
        ...prev,
        {
          id: data.addComment.comment.id,
          body: data.addComment.comment.body,
          author: data.addComment.comment.author.name,
        },
      ])
    }
    setInput('')
    setSubmitting(false)
  }

  return (
    <div className="space-y-3">
      <div className="rounded border border-red-100 bg-red-50/50 px-2 py-1 text-[10px] text-red-600">
        서버 응답까지 UI가 멈춤 — 입력 후 ~300ms 동안 피드백 없음
      </div>

      <div className="space-y-1.5">
        {comments.map((c) => (
          <div key={c.id} className="rounded border border-gray-100 bg-white px-3 py-2 text-xs">
            <strong className="text-gray-700">{c.author}:</strong>{' '}
            <span className="text-gray-600">{c.body}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addComment()}
          placeholder="댓글 입력..."
          className="flex-1 rounded border border-gray-200 px-3 py-1.5 text-xs focus:border-blue-400 focus:outline-none"
          disabled={submitting}
        />
        <button
          onClick={addComment}
          disabled={submitting || !input.trim()}
          className="rounded bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600 disabled:opacity-50"
        >
          {submitting ? (
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 animate-spin rounded-full border border-white/30 border-t-white" />
              전송 중...
            </span>
          ) : (
            '댓글 달기'
          )}
        </button>
      </div>
    </div>
  )
}
