import { Suspense } from 'react'
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay'
import { RelayEnvironmentWrapper } from '../@shared/relay/RelayEnvironmentProvider'
import type { solutionDemoOptimisticQuery } from './__generated__/solutionDemoOptimisticQuery.graphql'
import type { solutionDemoAddCommentMutation } from './__generated__/solutionDemoAddCommentMutation.graphql'

const CommentsQuery = graphql`
  query solutionDemoOptimisticQuery($postId: ID!) {
    post(id: $postId) {
      id
      comments {
        id
        body
        author {
          name
        }
      }
    }
  }
`

const AddCommentMutation = graphql`
  mutation solutionDemoAddCommentMutation($input: AddCommentInput!) {
    addComment(input: $input) {
      comment {
        id
        body
        author {
          name
        }
      }
    }
  }
`

function CommentList() {
  const data = useLazyLoadQuery<solutionDemoOptimisticQuery>(CommentsQuery, { postId: '1' })
  const [commit, isInFlight] = useMutation<solutionDemoAddCommentMutation>(AddCommentMutation)

  function addComment(body: string) {
    commit({
      variables: {
        input: { postId: '1', body, authorId: '1' },
      },
      // Optimistic response — UI 즉시 업데이트
      optimisticResponse: {
        addComment: {
          comment: {
            id: `temp-${Date.now()}`,
            body,
            author: { name: 'Alice Kim' },
          },
        },
      },
      // 서버 응답 후 실제 데이터로 교체
      updater: (store) => {
        const payload = store.getRootField('addComment')
        const newComment = payload?.getLinkedRecord('comment')
        const post = store.get(`Post:1`) ?? store.getRoot().getLinkedRecord('post', { id: '1' })
        if (post && newComment) {
          const existing = post.getLinkedRecords('comments') || []
          post.setLinkedRecords([...existing, newComment], 'comments')
        }
      },
    })
  }

  const comments = data.post?.comments ?? []

  return (
    <div className="space-y-3">
      <div className="rounded border border-green-100 bg-green-50/50 px-2 py-1 text-[10px] text-green-600">
        Optimistic response — 서버 응답 전에 UI 즉시 업데이트, 실패 시 자동 롤백
      </div>

      <div className="space-y-1.5">
        {comments.map((c) => (
          <div
            key={c.id}
            className={`rounded border px-3 py-2 text-xs ${
              c.id.startsWith('temp-')
                ? 'border-green-200 bg-green-50 opacity-70'
                : 'border-gray-100 bg-white'
            }`}
          >
            <strong className="text-gray-700">{c.author.name}:</strong>{' '}
            <span className="text-gray-600">{c.body}</span>
            {c.id.startsWith('temp-') && (
              <span className="ml-1 text-[9px] text-green-600">(optimistic)</span>
            )}
          </div>
        ))}
      </div>

      <CommentInput onSubmit={addComment} disabled={isInFlight} />
    </div>
  )
}

function CommentInput({
  onSubmit,
  disabled,
}: {
  onSubmit: (body: string) => void
  disabled: boolean
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const form = e.currentTarget
        const input = form.elements.namedItem('comment') as HTMLInputElement
        if (input.value.trim()) {
          onSubmit(input.value.trim())
          input.value = ''
        }
      }}
      className="flex gap-2"
    >
      <input
        name="comment"
        type="text"
        placeholder="댓글 입력..."
        className="flex-1 rounded border border-gray-200 px-3 py-1.5 text-xs focus:border-green-400 focus:outline-none"
        disabled={disabled}
      />
      <button
        type="submit"
        disabled={disabled}
        className="rounded bg-green-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-600 disabled:opacity-50"
      >
        댓글 달기
      </button>
    </form>
  )
}

export function OptimisticSolutionDemo() {
  return (
    <RelayEnvironmentWrapper>
      <Suspense
        fallback={
          <div className="flex items-center gap-2 p-4 text-xs text-gray-400">
            <div className="h-3 w-3 animate-spin rounded-full border border-gray-300 border-t-green-500" />
            Loading...
          </div>
        }
      >
        <CommentList />
      </Suspense>
    </RelayEnvironmentWrapper>
  )
}
