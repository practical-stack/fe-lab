import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/graphql/')({
  component: GraphQLPage,
})

const PHASES = [
  {
    title: 'Phase 1: GraphQL Fundamentals',
    items: [
      {
        to: '/graphql/rest-vs-graphql',
        number: 1,
        title: 'REST vs GraphQL',
        description: 'Over-fetching, Under-fetching, Waterfall 문제를 GraphQL이 어떻게 해결하는가',
        tags: ['over-fetching', 'under-fetching', 'waterfall'],
      },
      {
        to: '/graphql/query-mutation',
        number: 2,
        title: 'Query & Mutation Basics',
        description: 'GraphQL 쿼리와 뮤테이션의 기본 문법 — variables, aliases, fragments',
        tags: ['query', 'mutation', 'variables'],
      },
      {
        to: '/graphql/schema-types',
        number: 3,
        title: 'Schema & Type System',
        description: 'SDL, 타입 관계, 스키마 우선 개발 — API 계약으로서의 스키마',
        tags: ['SDL', 'types', 'introspection'],
      },
    ],
  },
  {
    title: 'Phase 2: Relay Introduction',
    items: [
      {
        to: '/graphql/relay-environment',
        number: 4,
        title: 'Relay Environment Setup',
        description: 'Network Layer, Store, RelayEnvironmentProvider — Relay의 기본 구성',
        tags: ['Environment', 'Store', 'useLazyLoadQuery'],
      },
      {
        to: '/graphql/fragment-colocation',
        number: 5,
        title: 'Fragment Colocation',
        description: 'Prop drilling → Relay fragments. 컴포넌트별 데이터 요구사항 선언',
        tags: ['useFragment', 'colocation', 'composition'],
      },
      {
        to: '/graphql/pagination',
        number: 6,
        title: 'Pagination (Connection Spec)',
        description: '수동 오프셋 → @connection + usePaginationFragment. 커서 기반 누적 로딩',
        tags: ['@connection', 'cursor', 'loadNext'],
      },
    ],
  },
  {
    title: 'Phase 3: Relay Deep Dive',
    items: [
      {
        to: '/graphql/optimistic-updates',
        number: 7,
        title: 'Optimistic Updates',
        description: '서버 응답 전 UI 즉시 반영, 실패 시 자동 롤백',
        tags: ['optimisticResponse', 'useMutation', 'rollback'],
      },
      {
        to: '/graphql/subscriptions',
        number: 8,
        title: 'Subscriptions',
        description: 'WebSocket 기반 실시간 데이터 — requestSubscription API',
        tags: ['real-time', 'WebSocket', 'live-feed'],
      },
      {
        to: '/graphql/defer-stream',
        number: 9,
        title: '@defer / @stream',
        description: '점진적 데이터 전달로 Time-to-First-Paint 최적화',
        tags: ['@defer', '@stream', 'incremental'],
      },
      {
        to: '/graphql/store-cache',
        number: 10,
        title: 'Relay Store & Cache',
        description: '정규화 캐시, Garbage Collection, Store Invalidation',
        tags: ['normalized', 'GC', 'invalidation'],
      },
    ],
  },
] as const

function GraphQLPage() {
  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-gray-900">GraphQL</h1>
      <p className="mb-8 text-gray-600">
        GraphQL 기초부터 Relay 딥다이브까지 — REST의 한계를 GraphQL이 어떻게 해결하는지, 그리고
        Relay가 GraphQL의 잠재력을 어떻게 극대화하는지 단계별로 학습합니다.
      </p>

      {/* Quick links */}
      <div className="mb-10 flex flex-wrap gap-3">
        <Link
          to="/graphql/layers"
          className="flex items-center gap-2 rounded-lg border border-violet-200 bg-violet-50/50 px-4 py-3 transition-shadow hover:shadow-md"
        >
          <span className="text-sm font-semibold text-violet-900">Architecture Layers</span>
          <span className="text-xs text-violet-600">→</span>
        </Link>
        <Link
          to="/graphql/caveats"
          className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50/50 px-4 py-3 transition-shadow hover:shadow-md"
        >
          <span className="text-sm font-semibold text-amber-900">Caveats</span>
          <span className="text-xs text-amber-600">→</span>
        </Link>
      </div>

      {/* Phase sections */}
      <div className="space-y-10">
        {PHASES.map((phase) => (
          <div key={phase.title}>
            <h2 className="mb-4 border-b border-gray-200 pb-2 text-lg font-bold text-gray-800">
              {phase.title}
            </h2>
            <div className="grid gap-3">
              {phase.items.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="group flex items-start gap-4 rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-blue-300 hover:shadow-md"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-sm font-bold text-blue-600 group-hover:bg-blue-100">
                    {item.number}
                  </span>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600">
                      {item.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-gray-500">{item.description}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="shrink-0 text-gray-300 group-hover:text-blue-400">→</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
