import { users, posts, comments } from '../mock-data'
import type { MockPost, MockComment } from '../mock-data'

function encodeCursor(id: string): string {
  return btoa(`cursor:${id}`)
}

function decodeCursor(cursor: string): string {
  return atob(cursor).replace('cursor:', '')
}

function paginateArray<T extends { id: string }>(
  items: T[],
  first: number,
  after?: string | null,
): {
  edges: { node: T; cursor: string }[]
  pageInfo: {
    hasNextPage: boolean
    hasPreviousPage: boolean
    startCursor: string | null
    endCursor: string | null
  }
  totalCount: number
} {
  let startIndex = 0
  if (after) {
    const afterId = decodeCursor(after)
    const idx = items.findIndex((item) => item.id === afterId)
    if (idx >= 0) startIndex = idx + 1
  }

  const sliced = items.slice(startIndex, startIndex + first)
  const edges = sliced.map((node) => ({ node, cursor: encodeCursor(node.id) }))

  return {
    edges,
    pageInfo: {
      hasNextPage: startIndex + first < items.length,
      hasPreviousPage: startIndex > 0,
      startCursor: edges.length > 0 ? edges[0].cursor : null,
      endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
    },
    totalCount: items.length,
  }
}

// Mutable copies for mutations
let mutablePosts = [...posts]
let mutableComments = [...comments]
let nextPostId = posts.length + 1
let nextCommentId = comments.length + 1

export function resetMutableData() {
  mutablePosts = [...posts]
  mutableComments = [...comments]
  nextPostId = posts.length + 1
  nextCommentId = comments.length + 1
}

export const resolvers = {
  Node: {
    __resolveType(obj: { id: string }) {
      // Determine type based on which collection the object belongs to
      if (users.find((u) => u.id === obj.id)) return 'User'
      if (mutablePosts.find((p) => p.id === obj.id)) return 'Post'
      if (mutableComments.find((c) => c.id === obj.id)) return 'Comment'
      return null
    },
  },

  Query: {
    node: (_: unknown, { id }: { id: string }) => {
      return (
        users.find((u) => u.id === id) ??
        mutablePosts.find((p) => p.id === id) ??
        mutableComments.find((c) => c.id === id) ??
        null
      )
    },
    user: (_: unknown, { id }: { id: string }) => users.find((u) => u.id === id) ?? null,
    users: (_: unknown, { first = 10, after }: { first?: number; after?: string }) =>
      paginateArray(users, first, after),
    post: (_: unknown, { id }: { id: string }) => mutablePosts.find((p) => p.id === id) ?? null,
    posts: (_: unknown, { first = 10, after }: { first?: number; after?: string }) =>
      paginateArray(mutablePosts, first, after),
  },

  Mutation: {
    createPost: (
      _: unknown,
      { input }: { input: { title: string; body: string; authorId: string } },
    ) => {
      const newPost: MockPost = {
        id: String(nextPostId++),
        title: input.title,
        body: input.body,
        authorId: input.authorId,
        createdAt: new Date().toISOString(),
      }
      mutablePosts.unshift(newPost)
      return { post: newPost }
    },

    updatePost: (
      _: unknown,
      { input }: { input: { id: string; title?: string; body?: string } },
    ) => {
      const post = mutablePosts.find((p) => p.id === input.id)
      if (!post) throw new Error(`Post ${input.id} not found`)
      if (input.title !== undefined) post.title = input.title
      if (input.body !== undefined) post.body = input.body
      return { post }
    },

    deletePost: (_: unknown, { id }: { id: string }) => {
      const idx = mutablePosts.findIndex((p) => p.id === id)
      if (idx < 0) throw new Error(`Post ${id} not found`)
      mutablePosts.splice(idx, 1)
      mutableComments = mutableComments.filter((c) => c.postId !== id)
      return { deletedId: id }
    },

    addComment: (
      _: unknown,
      { input }: { input: { postId: string; body: string; authorId: string } },
    ) => {
      const newComment: MockComment = {
        id: String(nextCommentId++),
        body: input.body,
        authorId: input.authorId,
        postId: input.postId,
        createdAt: new Date().toISOString(),
      }
      mutableComments.push(newComment)
      return { comment: newComment }
    },
  },

  User: {
    posts: (user: MockPost & { id: string }) =>
      mutablePosts.filter((p) => p.authorId === user.id),
  },

  Post: {
    author: (post: MockPost) => users.find((u) => u.id === post.authorId),
    comments: (post: MockPost) => mutableComments.filter((c) => c.postId === post.id),
  },

  Comment: {
    author: (comment: MockComment) => users.find((u) => u.id === comment.authorId),
    post: (comment: MockComment) => mutablePosts.find((p) => p.id === comment.postId),
  },
}
