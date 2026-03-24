import { createFileRoute, Link } from '@tanstack/react-router'
import { Panel } from '~/@lib/ui/common/panel'
import { useGraphQLWorker } from './-sub/@shared/use-graphql-worker'
import { RestProblemDemo } from './-sub/01-rest-vs-graphql/rest-problem-demo'
import { GraphQLSolutionDemo } from './-sub/01-rest-vs-graphql/graphql-solution-demo'
import { QueryMutationDemo } from './-sub/02-query-mutation-basics/query-mutation-demo'
import { SchemaExplorerDemo } from './-sub/03-schema-type-system/schema-explorer-demo'

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

        {/* Phase 2 & 3 Placeholders */}
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
          <p className="text-sm text-gray-500">
            Phase 2: Relay Introduction (Fragment Colocation, Pagination) — Coming soon
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Phase 3: Relay Deep Dive (Optimistic Updates, Subscriptions, @defer/@stream) — Coming
            soon
          </p>
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
