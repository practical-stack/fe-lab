import { createFileRoute, Link } from '@tanstack/react-router'
import { Panel } from '~/@lib/ui/common/panel'
import { useGraphQLWorker } from './-sub/@shared/use-graphql-worker'
import { RestProblemDemo } from './-sub/01-rest-vs-graphql/rest-problem-demo'
import { GraphQLSolutionDemo } from './-sub/01-rest-vs-graphql/graphql-solution-demo'
import { QueryMutationDemo } from './-sub/02-query-mutation-basics/query-mutation-demo'
import { SchemaExplorerDemo } from './-sub/03-schema-type-system/schema-explorer-demo'
import { RelaySetupDemo } from './-sub/04-relay-environment/relay-setup-demo'
import { FragmentProblemDemo } from './-sub/05-fragment-colocation/problem-demo'
import { FragmentSolutionDemo } from './-sub/05-fragment-colocation/solution-demo'
import { PaginationProblemDemo } from './-sub/06-pagination/problem-demo'
import { PaginationSolutionDemo } from './-sub/06-pagination/solution-demo'
import { OptimisticProblemDemo } from './-sub/07-optimistic-updates/problem-demo'
import { OptimisticSolutionDemo } from './-sub/07-optimistic-updates/solution-demo'
import { SubscriptionDemo } from './-sub/08-subscriptions/subscription-demo'
import { DeferStreamDemo } from './-sub/09-defer-stream/defer-stream-demo'
import { StoreCacheDemo } from './-sub/10-store-cache/store-cache-demo'

export const Route = createFileRoute('/graphql/')({
  component: GraphQLPage,
})

function GraphQLPage() {
  const ready = useGraphQLWorker()

  if (!ready) {
    return (
      <div className="flex items-center gap-2 py-12 text-gray-500">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
        Initializing GraphQL mock server...
      </div>
    )
  }

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-gray-900">GraphQL</h1>
      <p className="mb-8 text-gray-600">
        GraphQL 기초부터 Relay 딥다이브까지 — REST의 한계를 GraphQL이 어떻게 해결하는지, 그리고
        Relay가 GraphQL의 잠재력을 어떻게 극대화하는지 단계별로 학습합니다.
      </p>

      {/* Architecture overview link */}
      <Link
        to="/graphql/layers"
        className="mb-10 flex items-center justify-between rounded-lg border border-violet-200 bg-violet-50/50 p-5 transition-shadow hover:shadow-md"
      >
        <div>
          <h3 className="font-semibold text-violet-900">Architecture Layers — GraphQL 시스템의 6개 계층</h3>
          <p className="mt-1 text-xs text-violet-800/70">
            Client → Transport → Parsing → Validation → Execution → Data Source. 하나의 쿼리가
            데이터가 되기까지 통과하는 전체 아키텍처를 인터랙티브하게 살펴봅니다.
          </p>
        </div>
        <span className="ml-4 text-lg text-violet-600">→</span>
      </Link>

      <div className="space-y-16">
        {/* Phase 1: GraphQL Fundamentals */}
        <div>
          <h2 className="mb-6 border-b border-gray-200 pb-2 text-xl font-bold text-gray-800">
            Phase 1: GraphQL Fundamentals
          </h2>

          <div className="space-y-12">
            <section>
              <h3 className="mb-1 text-lg font-semibold text-gray-900">1. REST vs GraphQL</h3>
              <p className="mb-4 text-sm text-gray-500">
                Over-fetching, Under-fetching, Waterfall 문제를 GraphQL이 어떻게 해결하는가
              </p>

              {/* Concept explanation */}
              <div className="mb-6 space-y-3 rounded-lg border border-gray-200 bg-white p-5 text-sm leading-relaxed text-gray-700">
                <h4 className="font-semibold text-gray-900">REST API의 구조적 한계</h4>
                <p>
                  REST는 <strong>리소스 단위</strong>로 엔드포인트를 설계합니다.{' '}
                  <code className="rounded bg-gray-100 px-1 text-xs">/users/1</code>,{' '}
                  <code className="rounded bg-gray-100 px-1 text-xs">/users/1/posts</code>,{' '}
                  <code className="rounded bg-gray-100 px-1 text-xs">/posts/1/comments</code> — 각
                  엔드포인트는 해당 리소스의 <em>모든</em> 필드를 반환합니다. 이 구조에서 세 가지
                  문제가 발생합니다:
                </p>

                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-md border border-red-100 bg-red-50/50 p-3">
                    <p className="mb-1 text-xs font-bold text-red-700">Over-fetching</p>
                    <p className="text-xs text-red-900/70">
                      화면에 유저의 <code className="text-[10px]">name</code>과{' '}
                      <code className="text-[10px]">avatar</code>만 필요하지만, REST 응답에는{' '}
                      <code className="text-[10px]">email</code>,{' '}
                      <code className="text-[10px]">phone</code>,{' '}
                      <code className="text-[10px]">address</code>,{' '}
                      <code className="text-[10px]">role</code> 등 불필요한 필드가 모두 포함됩니다.
                      모바일 환경에서 이 낭비는 체감 성능에 직접 영향을 줍니다.
                    </p>
                  </div>
                  <div className="rounded-md border border-red-100 bg-red-50/50 p-3">
                    <p className="mb-1 text-xs font-bold text-red-700">Under-fetching</p>
                    <p className="text-xs text-red-900/70">
                      하나의 화면을 구성하는데 필요한 데이터가 여러 리소스에 분산되어 있어, 한 번의
                      요청으로 충분하지 않습니다. 유저 프로필 + 게시글 목록 + 댓글을 보려면 최소
                      3번의 API 호출이 필요합니다.
                    </p>
                  </div>
                  <div className="rounded-md border border-red-100 bg-red-50/50 p-3">
                    <p className="mb-1 text-xs font-bold text-red-700">Waterfall</p>
                    <p className="text-xs text-red-900/70">
                      연관 데이터를 가져오려면 이전 응답에 의존하는 경우가 많습니다. "유저의 게시글의
                      댓글"을 가져오려면 유저 → 게시글 → 댓글 순서로 직렬 요청이 발생하고, 총
                      대기시간은 각 요청의 합이 됩니다.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Panel
                  variant="problem"
                  label="Problem"
                  tag="REST API — 3 sequential requests"
                  data={{
                    description:
                      '유저 프로필 화면 하나를 그리기 위해 3번의 REST 호출이 필요합니다. 각 응답에서 실제 사용하는 필드 비율을 확인해보세요 — 대부분의 데이터가 버려집니다. 게다가 요청이 순차적으로 발생하여(waterfall) 총 대기시간이 각 요청 시간의 합이 됩니다.',
                    demo: <RestProblemDemo />,
                    code: REST_PROBLEM_CODE,
                  }}
                />
                <Panel
                  variant="solution"
                  label="Solution"
                  tag="GraphQL — 1 query, exact fields"
                  data={{
                    description:
                      'GraphQL은 하나의 쿼리로 여러 리소스의 데이터를 필요한 필드만 정확히 요청합니다. 네트워크 요청 1번, 불필요한 데이터 전송 0, 순차 요청 waterfall 없음. 스키마의 타입 시스템이 요청과 응답의 형태를 컴파일 타임에 보장합니다.',
                    demo: <GraphQLSolutionDemo />,
                    code: GRAPHQL_SOLUTION_CODE,
                  }}
                />
              </div>

              {/* Caveats link */}
              <Link
                to="/graphql/caveats"
                className="mt-4 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50/50 p-5 transition-shadow hover:shadow-md"
              >
                <div>
                  <h4 className="font-semibold text-amber-900">
                    Caveats — GraphQL이 만능은 아닙니다
                  </h4>
                  <p className="mt-1 text-xs text-amber-800/70">
                    HTTP 캐싱, N+1 문제, 서버 복잡도, 에러 핸들링, 파일 업로드 등 GraphQL 도입 전에
                    반드시 알아야 할 트레이드오프를 인터랙티브 데모와 함께 다룹니다.
                  </p>
                </div>
                <span className="ml-4 text-lg text-amber-600">→</span>
              </Link>
            </section>

            <section>
              <h3 className="mb-1 text-lg font-semibold text-gray-900">
                2. Query & Mutation Basics
              </h3>
              <p className="mb-4 text-sm text-gray-500">
                GraphQL 쿼리와 뮤테이션의 기본 문법 — variables, aliases, fragments
              </p>
              <div className="rounded-lg border border-blue-200 bg-blue-50/30 p-5">
                <div className="mb-3 flex items-center gap-2">
                  <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                    Interactive
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    GraphQL Playground
                  </span>
                </div>
                <div className="mb-3 rounded-lg border border-blue-100 bg-white p-4">
                  <QueryMutationDemo />
                </div>
                <p className="text-sm leading-relaxed text-gray-600">
                  직접 GraphQL 쿼리를 작성하고 실행해보세요. MSW가 브라우저에서 GraphQL 서버를
                  시뮬레이션합니다. 쿼리, 뮤테이션, 변수(variables) 사용법을 실험할 수 있습니다.
                </p>
              </div>
            </section>

            <section>
              <h3 className="mb-1 text-lg font-semibold text-gray-900">
                3. Schema & Type System
              </h3>
              <p className="mb-4 text-sm text-gray-500">
                GraphQL 스키마가 API 계약을 어떻게 정의하는가 — SDL, 타입 관계, 스키마 우선 개발
              </p>
              <div className="rounded-lg border border-purple-200 bg-purple-50/30 p-5">
                <div className="mb-3 flex items-center gap-2">
                  <span className="rounded bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-700">
                    Explorer
                  </span>
                  <span className="text-sm font-medium text-gray-700">Schema Visualization</span>
                </div>
                <div className="mb-3 rounded-lg border border-purple-100 bg-white p-4">
                  <SchemaExplorerDemo />
                </div>
                <p className="text-sm leading-relaxed text-gray-600">
                  타입을 클릭하면 필드와 연결 관계를 확인할 수 있습니다. GraphQL 스키마는 API의
                  계약(contract)입니다 — 클라이언트와 서버가 이 스키마를 기준으로 소통합니다.
                </p>
              </div>
            </section>
          </div>
        </div>

        {/* Phase 2: Relay Introduction */}
        <div>
          <h2 className="mb-6 border-b border-gray-200 pb-2 text-xl font-bold text-gray-800">
            Phase 2: Relay Introduction
          </h2>

          <div className="space-y-12">
            {/* 4. Relay Environment Setup */}
            <section>
              <h3 className="mb-1 text-lg font-semibold text-gray-900">
                4. Relay Environment Setup
              </h3>
              <p className="mb-4 text-sm text-gray-500">
                Relay Environment 구성 — Network Layer, Store, RelayEnvironmentProvider
              </p>
              <div className="rounded-lg border border-blue-200 bg-blue-50/30 p-5">
                <div className="mb-3 flex items-center gap-2">
                  <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                    Relay
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    Environment + useLazyLoadQuery
                  </span>
                </div>
                <div className="mb-3 rounded-lg border border-blue-100 bg-white p-4">
                  <RelaySetupDemo />
                </div>
                <p className="text-sm leading-relaxed text-gray-600">
                  Relay Environment은 Network(서버 통신)와 Store(정규화 캐시)로 구성됩니다.{' '}
                  <code className="text-xs">useLazyLoadQuery</code>는 컴포넌트 렌더링 시 쿼리를
                  실행하고, Suspense로 로딩 상태를 처리합니다. 같은 ID를 다시 선택하면 Store
                  캐시에서 즉시 반환됩니다.
                </p>
              </div>

              <div className="mt-3 rounded-md border border-gray-200 bg-gray-900 p-3">
                <pre className="overflow-x-auto text-xs text-green-400">{RELAY_ENVIRONMENT_CODE}</pre>
              </div>
            </section>

            {/* 5. Fragment Colocation */}
            <section>
              <h3 className="mb-1 text-lg font-semibold text-gray-900">
                5. Fragment Colocation
              </h3>
              <p className="mb-4 text-sm text-gray-500">
                Prop drilling 문제를 Relay Fragment로 해결하기 — 컴포넌트별 데이터 요구사항 선언
              </p>
              <div className="space-y-4">
                <Panel
                  variant="problem"
                  label="Problem"
                  tag="Prop Drilling"
                  data={{
                    description:
                      '루트 컴포넌트가 모든 데이터를 가져와서 자식에게 props로 전달합니다. 자식 컴포넌트에 필드를 추가하면 쿼리와 모든 중간 컴포넌트의 props를 수정해야 합니다.',
                    demo: <FragmentProblemDemo />,
                    code: FRAGMENT_PROBLEM_CODE,
                  }}
                />
                <Panel
                  variant="solution"
                  label="Solution"
                  tag="Relay Fragments"
                  data={{
                    description:
                      '각 컴포넌트가 자신의 fragment로 데이터 요구사항을 선언합니다. Relay 컴파일러가 fragment를 자동으로 합성하여 하나의 최적화된 쿼리로 만들어줍니다. 부모 컴포넌트는 fragment ref만 전달합니다.',
                    demo: <FragmentSolutionDemo />,
                    code: FRAGMENT_SOLUTION_CODE,
                  }}
                />
              </div>
            </section>

            {/* 6. Pagination */}
            <section>
              <h3 className="mb-1 text-lg font-semibold text-gray-900">
                6. Pagination (Connection Spec)
              </h3>
              <p className="mb-4 text-sm text-gray-500">
                수동 오프셋 페이지네이션 vs Relay의 커서 기반 @connection + usePaginationFragment
              </p>
              <div className="space-y-4">
                <Panel
                  variant="problem"
                  label="Problem"
                  tag="Manual Offset Pagination"
                  data={{
                    description:
                      '페이지 전환 시 기존 데이터를 교체하고, 오프셋 기반이라 중간 삽입/삭제 시 항목이 중복되거나 누락됩니다. 상태 관리도 수동으로 해야 합니다.',
                    demo: <PaginationProblemDemo />,
                    code: PAGINATION_PROBLEM_CODE,
                  }}
                />
                <Panel
                  variant="solution"
                  label="Solution"
                  tag="@connection + usePaginationFragment"
                  data={{
                    description:
                      'Relay의 usePaginationFragment가 커서 기반 페이지네이션을 자동으로 관리합니다. 새 페이지는 기존 데이터에 누적되고, hasNext/loadNext를 제공하며, @connection으로 정규화된 캐시를 유지합니다.',
                    demo: <PaginationSolutionDemo />,
                    code: PAGINATION_SOLUTION_CODE,
                  }}
                />
              </div>
            </section>
          </div>
        </div>

        {/* Phase 3: Relay Deep Dive */}
        <div>
          <h2 className="mb-6 border-b border-gray-200 pb-2 text-xl font-bold text-gray-800">
            Phase 3: Relay Deep Dive
          </h2>

          <div className="space-y-12">
            {/* 7. Optimistic Updates */}
            <section>
              <h3 className="mb-1 text-lg font-semibold text-gray-900">7. Optimistic Updates</h3>
              <p className="mb-4 text-sm text-gray-500">
                뮤테이션 시 서버 응답을 기다리지 않고 UI를 즉시 업데이트하기
              </p>
              <div className="space-y-4">
                <Panel
                  variant="problem"
                  label="Problem"
                  tag="서버 응답 대기"
                  data={{
                    description:
                      '댓글을 작성하면 서버 응답(~300ms)까지 UI가 멈춥니다. 사용자에게 즉각적인 피드백이 없어 "클릭이 됐나?" 하는 불확실성이 생깁니다.',
                    demo: <OptimisticProblemDemo />,
                    code: OPTIMISTIC_PROBLEM_CODE,
                  }}
                />
                <Panel
                  variant="solution"
                  label="Solution"
                  tag="Relay Optimistic Response"
                  data={{
                    description:
                      'Relay의 optimisticResponse로 가짜 데이터를 Store에 먼저 기록합니다. UI가 즉시 업데이트되고, 서버 응답이 도착하면 실제 데이터로 교체됩니다. 실패 시 자동 롤백.',
                    demo: <OptimisticSolutionDemo />,
                    code: OPTIMISTIC_SOLUTION_CODE,
                  }}
                />
              </div>
            </section>

            {/* 8. Subscriptions */}
            <section>
              <h3 className="mb-1 text-lg font-semibold text-gray-900">8. Subscriptions</h3>
              <p className="mb-4 text-sm text-gray-500">
                GraphQL Subscriptions로 실시간 데이터 업데이트 받기
              </p>
              <div className="rounded-lg border border-blue-200 bg-blue-50/30 p-5">
                <div className="mb-3 flex items-center gap-2">
                  <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                    Real-time
                  </span>
                  <span className="text-sm font-medium text-gray-700">Live Comment Feed</span>
                </div>
                <div className="mb-3 rounded-lg border border-blue-100 bg-white p-4">
                  <SubscriptionDemo />
                </div>
                <p className="text-sm leading-relaxed text-gray-600">
                  GraphQL Subscription은 WebSocket 연결을 통해 서버에서 클라이언트로 실시간
                  이벤트를 푸시합니다. Relay의{' '}
                  <code className="text-xs">requestSubscription</code>이 연결 수명주기와 Store
                  업데이트를 자동으로 관리합니다.
                </p>
              </div>
            </section>

            {/* 9. @defer/@stream */}
            <section>
              <h3 className="mb-1 text-lg font-semibold text-gray-900">9. @defer / @stream</h3>
              <p className="mb-4 text-sm text-gray-500">
                점진적 데이터 전달로 Time-to-First-Paint 최적화하기
              </p>
              <div className="rounded-lg border border-purple-200 bg-purple-50/30 p-5">
                <div className="mb-3 flex items-center gap-2">
                  <span className="rounded bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-700">
                    Incremental
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    Blocking vs Deferred Loading
                  </span>
                </div>
                <div className="mb-3 rounded-lg border border-purple-100 bg-white p-4">
                  <DeferStreamDemo />
                </div>
                <p className="text-sm leading-relaxed text-gray-600">
                  <code className="text-xs">@defer</code>는 느린 필드를 별도 청크로 스트리밍하여,
                  빠른 필드부터 먼저 화면에 표시합니다.{' '}
                  <code className="text-xs">@stream</code>은 리스트 항목을 하나씩 전달합니다.
                  두 디렉티브 모두 GraphQL 스펙 draft 단계이며, 서버 지원이 필요합니다.
                </p>
              </div>
            </section>

            {/* 10. Store & Cache */}
            <section>
              <h3 className="mb-1 text-lg font-semibold text-gray-900">
                10. Relay Store & Cache Management
              </h3>
              <p className="mb-4 text-sm text-gray-500">
                정규화 캐시, Garbage Collection, Store Invalidation 이해하기
              </p>
              <div className="rounded-lg border border-indigo-200 bg-indigo-50/30 p-5">
                <div className="mb-3 flex items-center gap-2">
                  <span className="rounded bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                    Store
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    Relay Store Inspector
                  </span>
                </div>
                <div className="mb-3 rounded-lg border border-indigo-100 bg-white p-4">
                  <StoreCacheDemo />
                </div>
                <p className="text-sm leading-relaxed text-gray-600">
                  Relay Store는 모든 GraphQL 응답을{' '}
                  <code className="text-xs">Type:ID</code> 형태로 정규화하여 저장합니다. 같은
                  엔티티가 여러 쿼리에 등장해도 하나의 레코드로 관리되어 일관성이 보장됩니다.
                  GC가 참조되지 않는 레코드를 자동 정리합니다.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProblemSolveSection({
  title,
  subtitle,
  problem,
  solution,
}: {
  title: string
  subtitle: string
  problem: { description: string; demo: React.ReactNode; code: string }
  solution: { description: string; demo: React.ReactNode; code: string }
}) {
  return (
    <section>
      <h3 className="mb-1 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mb-4 text-sm text-gray-500">{subtitle}</p>
      <div className="space-y-4">
        <Panel variant="problem" label="Problem" tag="REST API" data={problem} />
        <Panel variant="solution" label="Solution" tag="GraphQL" data={solution} />
      </div>
    </section>
  )
}

const REST_PROBLEM_CODE = `// 화면에 필요한 데이터: 유저 이름, 아바타, 게시글 제목, 댓글 내용
// REST로는 3번의 API 호출이 필요합니다

// 1) Over-fetching: 필요한 건 name, avatar뿐인데 9개 필드 전체가 옵니다
const user = await fetch('/api/users/1')
// → { id, name, email, avatar, phone, address, role, createdAt, updatedAt }
//         ^^^^         ^^^^^^  ← 실제 사용 (2/9 fields)

// 2) Under-fetching: 유저 정보만으로는 화면을 못 그려서 추가 요청 필요
const posts = await fetch('/api/users/1/posts')
// → [{ id, title, body, authorId, createdAt, updatedAt, tags, slug }, ...]
//          ^^^^^  ← 실제 사용 (1/8 fields per post)

// 3) Waterfall: 게시글 ID를 알아야 댓글을 요청할 수 있음 → 직렬 대기
const comments = await fetch(\`/api/posts/\${posts[0].id}/comments\`)
// → [{ id, body, authorId, postId, createdAt, updatedAt }, ...]
//          ^^^^  ← 실제 사용 (1/6 fields per comment)

// 총 37개 필드 수신, 6개만 사용 → 84% 데이터 낭비
// 총 3번 요청, 순차 실행 시 latency = sum(각 요청 시간)`

const GRAPHQL_SOLUTION_CODE = `// 같은 화면을 GraphQL 하나의 쿼리로 해결

const { data } = await gqlFetch(\`
  query UserProfile($id: ID!) {
    user(id: $id) {
      name            # 필요한 필드만 선택 (no over-fetching)
      avatar
      posts {         # 중첩 관계를 한 번에 조회 (no under-fetching)
        title
        comments {
          body        # 3단계 깊이도 하나의 요청 (no waterfall)
        }
      }
    }
  }
\`, { id: "1" })

// 결과: 요청한 필드만 정확히 반환됩니다
// {
//   user: {
//     name: "Alice Kim",
//     avatar: "...",
//     posts: [
//       { title: "Getting Started...", comments: [{ body: "Great!" }] }
//     ]
//   }
// }
//
// ✅ 1 request (no waterfall)
// ✅ 0% wasted data (no over-fetching)
// ✅ All related data in one shot (no under-fetching)
// ✅ Type-safe: schema guarantees response shape`

const RELAY_ENVIRONMENT_CODE = `// Relay Environment = Network + Store
import { Environment, Network, RecordSource, Store } from 'relay-runtime'

const fetchFn = async (request, variables) => {
  const response = await fetch('/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: request.text, variables }),
  })
  return response.json()
}

const environment = new Environment({
  network: Network.create(fetchFn),  // 서버 통신 담당
  store: new Store(new RecordSource()), // 정규화 캐시 담당
})

// 컴포넌트에서 사용:
// const data = useLazyLoadQuery(graphql\`query { user(id: "1") { name } }\`, {})
// → Suspense로 로딩 처리, Store에 자동 캐싱`

const FRAGMENT_PROBLEM_CODE = `// ❌ 루트에서 모든 데이터를 가져와 props로 전달
const QUERY = \`query {
  user(id: "1") {
    id name email avatar     # UserHeader가 필요한 것
    posts {
      id title body createdAt # PostItem이 필요한 것
      comments {
        id body               # CommentItem이 필요한 것
        author { name }
      }
    }
  }
}\`

// 자식 컴포넌트에 필드를 추가하면:
// 1. 쿼리 수정
// 2. 중간 컴포넌트의 props 타입 수정
// 3. prop 전달 코드 수정
// → 변경이 전파되는 "shotgun surgery" 문제`

const FRAGMENT_SOLUTION_CODE = `// ✅ 각 컴포넌트가 자신의 fragment를 선언
// UserHeader.tsx
const UserHeaderFragment = graphql\`
  fragment UserHeader_user on User {
    name email avatar    # 이 컴포넌트가 사용하는 필드만
  }
\`
// PostItem.tsx
const PostItemFragment = graphql\`
  fragment PostItem_post on Post {
    title body createdAt
    comments { ...CommentItem_comment }  # 자식 fragment 포함
  }
\`
// 루트 쿼리 — fragment를 spread할 뿐, 필드를 직접 나열하지 않음
const Query = graphql\`
  query UserProfileQuery($id: ID!) {
    user(id: $id) {
      ...UserHeader_user   # 컴파일러가 자동 합성
      posts { ...PostItem_post }
    }
  }
\`
// 자식에 필드 추가 시 → 해당 fragment만 수정하면 끝!`

const PAGINATION_PROBLEM_CODE = `// ❌ 수동 오프셋 페이지네이션
const [posts, setPosts] = useState([])
const [page, setPage] = useState(0)
const PAGE_SIZE = 5

useEffect(() => {
  const offset = page * PAGE_SIZE
  fetch(\`/api/posts?offset=\${offset}&limit=\${PAGE_SIZE}\`)
    .then(res => res.json())
    .then(data => {
      setPosts(data.posts)  // 기존 데이터 교체! (누적 아님)
    })
}, [page])

// 문제:
// 1. 페이지 전환 시 데이터가 사라졌다 나타남 (깜빡임)
// 2. 중간에 항목 삽입/삭제 시 offset이 밀려서 중복/누락
// 3. "더 보기" 구현 시 상태 관리가 복잡해짐`

const PAGINATION_SOLUTION_CODE = `// ✅ Relay @connection + usePaginationFragment
const PostListFragment = graphql\`
  fragment PostList_query on Query
  @refetchable(queryName: "PostListPaginationQuery")
  @argumentDefinitions(
    first: { type: "Int", defaultValue: 5 }
    after: { type: "String" }
  ) {
    posts(first: $first, after: $after)
      @connection(key: "PostList_posts") {  # Relay가 페이지를 자동 병합
      edges {
        node { id title author { name } }
      }
      totalCount
    }
  }
\`

// 컴포넌트에서:
const { data, loadNext, hasNext } = usePaginationFragment(
  PostListFragment, queryRef
)
// loadNext(5) → 다음 5개를 기존 리스트에 누적 (append)
// hasNext → 더 불러올 데이터가 있는지 자동 판별
// Relay Store가 @connection 데이터를 정규화하여 관리`

const OPTIMISTIC_PROBLEM_CODE = `// ❌ 서버 응답까지 UI가 멈추는 패턴
async function addComment(body: string) {
  setSubmitting(true) // 스피너 표시

  // 서버 응답을 기다림 (300ms+)
  const { data } = await gqlFetch(\`
    mutation($input: AddCommentInput!) {
      addComment(input: $input) {
        comment { id body author { name } }
      }
    }
  \`, { input: { postId: "1", body, authorId: "1" } })

  // 응답 후에야 UI 업데이트
  setComments(prev => [...prev, data.addComment.comment])
  setSubmitting(false)
}
// 사용자 경험: 클릭 → 300ms 멈춤 → 결과 표시`

const OPTIMISTIC_SOLUTION_CODE = `// ✅ Relay Optimistic Response — 즉시 UI 반영
const [commit] = useMutation(AddCommentMutation)

function addComment(body: string) {
  commit({
    variables: { input: { postId: "1", body, authorId: "1" } },

    // 서버 응답 전에 Store에 가짜 데이터를 먼저 기록
    optimisticResponse: {
      addComment: {
        comment: {
          id: \`temp-\${Date.now()}\`,  // 임시 ID
          body,
          author: { name: "Alice Kim" },
        },
      },
    },

    // 서버 응답 후 Store 업데이트 (실제 ID로 교체)
    updater: (store) => {
      const newComment = store.getRootField('addComment')
        .getLinkedRecord('comment')
      // ... Store에 연결
    },
  })
}
// 사용자 경험: 클릭 → 즉시 표시 → 서버 확인 → 실패 시 롤백`
