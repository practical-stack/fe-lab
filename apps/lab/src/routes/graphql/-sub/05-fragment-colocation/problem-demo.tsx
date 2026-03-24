import { useState, useEffect } from 'react'
import { gqlFetch } from '../@shared/graphql-client'

type UserWithPosts = {
  user: {
    id: string
    name: string
    email: string
    avatar: string
    posts: Array<{
      id: string
      title: string
      body: string
      createdAt: string
      comments: Array<{
        id: string
        body: string
        author: { name: string }
      }>
    }>
  }
}

/**
 * Problem: One massive query at the top, props drilled through every component.
 * Every component receives more data than it needs.
 */
export function FragmentProblemDemo() {
  const [data, setData] = useState<UserWithPosts | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    gqlFetch<UserWithPosts>(
      `query {
        user(id: "1") {
          id name email avatar
          posts {
            id title body createdAt
            comments {
              id body
              author { name }
            }
          }
        }
      }`,
    ).then((res) => {
      setData(res.data)
      setLoading(false)
    })
  }, [])

  if (loading) return <Loading />
  if (!data?.user) return null

  return (
    <div className="space-y-3">
      <div className="rounded border border-red-100 bg-red-50/50 px-2 py-1 text-[10px] text-red-600">
        UserProfile가 모든 데이터를 가져와서 자식에게 prop drilling
      </div>

      {/* Root fetches everything, drills props down */}
      <UserProfileHeader
        name={data.user.name}
        email={data.user.email}
        avatar={data.user.avatar}
      />

      {data.user.posts.slice(0, 2).map((post) => (
        <PostItem
          key={post.id}
          title={post.title}
          body={post.body}
          createdAt={post.createdAt}
          comments={post.comments}
        />
      ))}

      <PropDrillingVisualization />
    </div>
  )
}

function UserProfileHeader({ name, email, avatar }: { name: string; email: string; avatar: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3">
      <img src={avatar} alt={name} className="h-8 w-8 rounded-full bg-gray-100" />
      <div>
        <p className="text-xs font-semibold text-gray-900">{name}</p>
        <p className="text-[10px] text-gray-500">{email}</p>
      </div>
      <span className="ml-auto rounded bg-red-100 px-1 py-0.5 text-[9px] text-red-600">
        props: name, email, avatar
      </span>
    </div>
  )
}

function PostItem({
  title,
  body,
  createdAt,
  comments,
}: {
  title: string
  body: string
  createdAt: string
  comments: Array<{ id: string; body: string; author: { name: string } }>
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-800">{title}</p>
          <p className="text-[10px] text-gray-400">{new Date(createdAt).toLocaleDateString()}</p>
        </div>
        <span className="rounded bg-red-100 px-1 py-0.5 text-[9px] text-red-600">
          props: title, body, createdAt, comments
        </span>
      </div>
      <p className="mt-1 text-[11px] text-gray-600">{body.slice(0, 80)}...</p>
      <div className="mt-2 space-y-1">
        {comments.slice(0, 2).map((c) => (
          <div key={c.id} className="rounded bg-gray-50 px-2 py-1 text-[10px] text-gray-500">
            <strong>{c.author.name}:</strong> {c.body}
          </div>
        ))}
      </div>
    </div>
  )
}

function PropDrillingVisualization() {
  return (
    <div className="rounded-md border border-red-200 bg-red-50 p-3 text-[11px] text-red-700">
      <p className="font-semibold">문제점</p>
      <ul className="mt-1 space-y-0.5">
        <li>• 루트 컴포넌트가 모든 자식의 데이터 요구사항을 알아야 함</li>
        <li>• 자식 컴포넌트에 필드를 추가하면 쿼리와 모든 중간 컴포넌트의 props를 수정해야 함</li>
        <li>• 어떤 컴포넌트가 어떤 데이터를 사용하는지 추적하기 어려움</li>
        <li>• 컴포넌트를 다른 곳에서 재사용하려면 같은 구조의 props를 제공해야 함</li>
      </ul>
    </div>
  )
}

function Loading() {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-4 text-xs text-gray-400">
      <div className="h-3 w-3 animate-spin rounded-full border border-gray-300 border-t-blue-500" />
      Loading...
    </div>
  )
}
