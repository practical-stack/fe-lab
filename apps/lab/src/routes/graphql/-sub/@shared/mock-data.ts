export type MockUser = {
  id: string
  name: string
  email: string
  avatar: string
}

export type MockPost = {
  id: string
  title: string
  body: string
  authorId: string
  createdAt: string
}

export type MockComment = {
  id: string
  body: string
  authorId: string
  postId: string
  createdAt: string
}

export const users: MockUser[] = [
  { id: '1', name: 'Alice Kim', email: 'alice@example.com', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Alice' },
  { id: '2', name: 'Bob Park', email: 'bob@example.com', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Bob' },
  { id: '3', name: 'Charlie Lee', email: 'charlie@example.com', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Charlie' },
  { id: '4', name: 'Diana Choi', email: 'diana@example.com', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Diana' },
  { id: '5', name: 'Eric Jung', email: 'eric@example.com', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Eric' },
]

export const posts: MockPost[] = [
  { id: '1', title: 'Getting Started with GraphQL', body: 'GraphQL is a query language for APIs that gives clients the power to ask for exactly what they need.', authorId: '1', createdAt: '2024-01-15T09:00:00Z' },
  { id: '2', title: 'Why Relay?', body: 'Relay is a JavaScript framework for building data-driven React applications with GraphQL.', authorId: '1', createdAt: '2024-01-20T10:30:00Z' },
  { id: '3', title: 'Understanding Fragments', body: 'Fragments let you construct sets of fields and reuse them across multiple queries.', authorId: '2', createdAt: '2024-02-01T14:00:00Z' },
  { id: '4', title: 'Cursor-Based Pagination', body: 'Cursor-based pagination provides a stable way to paginate through large datasets without missing items.', authorId: '2', createdAt: '2024-02-10T11:00:00Z' },
  { id: '5', title: 'Optimistic UI Updates', body: 'Optimistic updates improve perceived performance by updating the UI before the server responds.', authorId: '3', createdAt: '2024-02-15T16:00:00Z' },
  { id: '6', title: 'GraphQL Schema Design', body: 'A well-designed schema is the foundation of any successful GraphQL API.', authorId: '3', createdAt: '2024-03-01T09:30:00Z' },
  { id: '7', title: 'Type Safety with GraphQL', body: 'GraphQL provides built-in type safety that eliminates many common API integration bugs.', authorId: '4', createdAt: '2024-03-05T13:00:00Z' },
  { id: '8', title: 'Real-Time with Subscriptions', body: 'Subscriptions enable real-time features by maintaining a persistent connection to the server.', authorId: '4', createdAt: '2024-03-10T15:30:00Z' },
  { id: '9', title: 'Error Handling in GraphQL', body: 'GraphQL has a unique error model where partial data can be returned alongside errors.', authorId: '5', createdAt: '2024-03-15T10:00:00Z' },
  { id: '10', title: 'Caching Strategies', body: 'Effective caching is crucial for GraphQL performance. Normalized caches provide the best consistency.', authorId: '5', createdAt: '2024-03-20T12:00:00Z' },
  { id: '11', title: 'Mutations Best Practices', body: 'Well-structured mutations with input types and payload types make your API predictable.', authorId: '1', createdAt: '2024-04-01T09:00:00Z' },
  { id: '12', title: 'N+1 Problem in GraphQL', body: 'DataLoader is the standard solution for batching and caching database queries in GraphQL resolvers.', authorId: '2', createdAt: '2024-04-05T11:30:00Z' },
  { id: '13', title: 'GraphQL vs REST Trade-offs', body: 'Both approaches have their strengths. Understanding when to use each is key to good architecture.', authorId: '3', createdAt: '2024-04-10T14:00:00Z' },
  { id: '14', title: 'Relay Compiler Deep Dive', body: 'The Relay compiler performs static analysis on your queries to optimize runtime performance.', authorId: '4', createdAt: '2024-04-15T16:30:00Z' },
  { id: '15', title: 'Connection Specification', body: 'The Relay connection spec standardizes pagination in GraphQL with edges, nodes, and pageInfo.', authorId: '5', createdAt: '2024-04-20T10:00:00Z' },
  { id: '16', title: 'Fragment Composition', body: 'Composing fragments allows each component to declare its own data dependencies independently.', authorId: '1', createdAt: '2024-05-01T09:00:00Z' },
  { id: '17', title: 'Deferred Queries with @defer', body: '@defer allows parts of a query to be streamed incrementally, improving time to first paint.', authorId: '2', createdAt: '2024-05-05T12:00:00Z' },
  { id: '18', title: 'GraphQL Directives', body: 'Directives provide a way to add metadata to your queries and schema for advanced behaviors.', authorId: '3', createdAt: '2024-05-10T15:00:00Z' },
  { id: '19', title: 'Store Management in Relay', body: 'The Relay store normalizes data and provides garbage collection for optimal memory usage.', authorId: '4', createdAt: '2024-05-15T11:00:00Z' },
  { id: '20', title: 'Testing GraphQL Applications', body: 'Testing GraphQL apps involves schema validation, resolver testing, and integration testing with mock providers.', authorId: '5', createdAt: '2024-05-20T14:30:00Z' },
]

export const comments: MockComment[] = [
  { id: '1', body: 'Great introduction! Very clear.', authorId: '2', postId: '1', createdAt: '2024-01-16T10:00:00Z' },
  { id: '2', body: 'This helped me understand the basics.', authorId: '3', postId: '1', createdAt: '2024-01-17T11:00:00Z' },
  { id: '3', body: 'Relay looks powerful but complex.', authorId: '4', postId: '2', createdAt: '2024-01-21T09:00:00Z' },
  { id: '4', body: 'Worth the learning curve!', authorId: '5', postId: '2', createdAt: '2024-01-22T14:00:00Z' },
  { id: '5', body: 'Fragments changed how I think about data.', authorId: '1', postId: '3', createdAt: '2024-02-02T10:30:00Z' },
  { id: '6', body: 'Cursor pagination is so much better.', authorId: '3', postId: '4', createdAt: '2024-02-11T12:00:00Z' },
  { id: '7', body: 'Optimistic UI makes apps feel instant.', authorId: '1', postId: '5', createdAt: '2024-02-16T09:00:00Z' },
  { id: '8', body: 'Schema design is underrated.', authorId: '2', postId: '6', createdAt: '2024-03-02T11:00:00Z' },
  { id: '9', body: 'Type safety saves debugging time.', authorId: '5', postId: '7', createdAt: '2024-03-06T15:00:00Z' },
  { id: '10', body: 'Subscriptions are perfect for chat apps.', authorId: '1', postId: '8', createdAt: '2024-03-11T10:00:00Z' },
  { id: '11', body: 'Error handling in GraphQL is unique.', authorId: '2', postId: '9', createdAt: '2024-03-16T12:30:00Z' },
  { id: '12', body: 'Normalized caching is a game changer.', authorId: '3', postId: '10', createdAt: '2024-03-21T09:00:00Z' },
  { id: '13', body: 'Input types keep mutations clean.', authorId: '4', postId: '11', createdAt: '2024-04-02T14:00:00Z' },
  { id: '14', body: 'DataLoader is essential.', authorId: '5', postId: '12', createdAt: '2024-04-06T10:00:00Z' },
  { id: '15', body: 'Good comparison of both approaches.', authorId: '1', postId: '13', createdAt: '2024-04-11T11:30:00Z' },
]
