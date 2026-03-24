import { Suspense } from 'react'
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay'
import { RelayEnvironmentWrapper } from '../@shared/relay/RelayEnvironmentProvider'
import type { solutionDemoQuery } from './__generated__/solutionDemoQuery.graphql'
import type { solutionDemoUserHeader_user$key } from './__generated__/solutionDemoUserHeader_user.graphql'
import type { solutionDemoPostItem_post$key } from './__generated__/solutionDemoPostItem_post.graphql'
import type { solutionDemoCommentItem_comment$key } from './__generated__/solutionDemoCommentItem_comment.graphql'

/**
 * Solution: Each component declares its own data requirements via fragments.
 * No prop drilling — Relay composes fragments automatically.
 */

// Each component declares ONLY what it needs
const UserHeaderFragment = graphql`
  fragment solutionDemoUserHeader_user on User {
    name
    email
    avatar
  }
`

const PostItemFragment = graphql`
  fragment solutionDemoPostItem_post on Post {
    title
    body
    createdAt
    comments {
      id
      ...solutionDemoCommentItem_comment
    }
  }
`

const CommentItemFragment = graphql`
  fragment solutionDemoCommentItem_comment on Comment {
    body
    author {
      name
    }
  }
`

// Root query composes all fragments — no manual field listing
const UserProfileQuery = graphql`
  query solutionDemoQuery($id: ID!) {
    user(id: $id) {
      id
      ...solutionDemoUserHeader_user
      posts {
        id
        ...solutionDemoPostItem_post
      }
    }
  }
`

function UserProfile() {
  const data = useLazyLoadQuery<solutionDemoQuery>(UserProfileQuery, { id: '1' })

  if (!data.user) return null

  return (
    <div className="space-y-3">
      <div className="rounded border border-green-100 bg-green-50/50 px-2 py-1 text-[10px] text-green-600">
        각 컴포넌트가 자신의 fragment로 데이터 요구사항을 선언
      </div>

      <UserHeader user={data.user} />

      {data.user.posts.slice(0, 2).map((post) => (
        <PostItem key={post.id} post={post} />
      ))}

      <FragmentBenefits />
    </div>
  )
}

function UserHeader({ user }: { user: solutionDemoUserHeader_user$key }) {
  const data = useFragment(UserHeaderFragment, user)

  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3">
      <img src={data.avatar ?? ''} alt={data.name} className="h-8 w-8 rounded-full bg-gray-100" />
      <div>
        <p className="text-xs font-semibold text-gray-900">{data.name}</p>
        <p className="text-[10px] text-gray-500">{data.email}</p>
      </div>
      <span className="ml-auto rounded bg-green-100 px-1 py-0.5 text-[9px] text-green-600">
        fragment: name, email, avatar
      </span>
    </div>
  )
}

function PostItem({ post }: { post: solutionDemoPostItem_post$key }) {
  const data = useFragment(PostItemFragment, post)

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-800">{data.title}</p>
          <p className="text-[10px] text-gray-400">
            {new Date(data.createdAt).toLocaleDateString()}
          </p>
        </div>
        <span className="rounded bg-green-100 px-1 py-0.5 text-[9px] text-green-600">
          fragment: title, body, createdAt
        </span>
      </div>
      <p className="mt-1 text-[11px] text-gray-600">{data.body.slice(0, 80)}...</p>
      <div className="mt-2 space-y-1">
        {data.comments.slice(0, 2).map((c) => (
          <CommentItem key={c.id} comment={c} />
        ))}
      </div>
    </div>
  )
}

function CommentItem({ comment }: { comment: solutionDemoCommentItem_comment$key }) {
  const data = useFragment(CommentItemFragment, comment)

  return (
    <div className="rounded bg-gray-50 px-2 py-1 text-[10px] text-gray-500">
      <strong>{data.author.name}:</strong> {data.body}
    </div>
  )
}

function FragmentBenefits() {
  return (
    <div className="rounded-md border border-green-200 bg-green-50 p-3 text-[11px] text-green-700">
      <p className="font-semibold">Fragment Colocation의 장점</p>
      <ul className="mt-1 space-y-0.5">
        <li>• 각 컴포넌트가 자신의 데이터 요구사항만 선언 — 관심사 분리</li>
        <li>• 필드 추가 시 해당 fragment만 수정 — 부모 컴포넌트 변경 불필요</li>
        <li>• Relay 컴파일러가 fragment를 자동으로 합성하여 하나의 쿼리로 전송</li>
        <li>• fragment 데이터가 변경된 컴포넌트만 리렌더링 — 세밀한 업데이트</li>
        <li>• 컴포넌트 + fragment를 함께 이동하면 어디서든 재사용 가능</li>
      </ul>
    </div>
  )
}

export function FragmentSolutionDemo() {
  return (
    <RelayEnvironmentWrapper>
      <Suspense
        fallback={
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-4 text-xs text-gray-400">
            <div className="h-3 w-3 animate-spin rounded-full border border-gray-300 border-t-green-500" />
            Loading via Relay fragments...
          </div>
        }
      >
        <UserProfile />
      </Suspense>
    </RelayEnvironmentWrapper>
  )
}
