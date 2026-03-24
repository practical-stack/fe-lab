import { createFileRoute, Link } from '@tanstack/react-router'
import { LayerFlowDemo } from './-sub/layer-flow-demo'
import { LayerComparisonDemo } from './-sub/layer-comparison-demo'

export const Route = createFileRoute('/graphql/layers/')({
  component: LayersPage,
})

function LayersPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-2">
        <Link to="/graphql" className="text-xs text-blue-600 hover:underline">
          ← GraphQL
        </Link>
      </div>
      <h1 className="mb-2 text-2xl font-bold text-gray-900">GraphQL Architecture Layers</h1>
      <p className="mb-8 text-gray-600">
        하나의 GraphQL 쿼리가 데이터가 되기까지 6개의 계층을 통과합니다. 각 계층의 역할과 책임을
        이해하면 GraphQL 시스템 전체를 조망하고, 문제가 발생했을 때 어느 계층에서 디버깅해야 하는지
        판단할 수 있습니다.
      </p>

      <div className="space-y-16">
        {/* Overview diagram */}
        <section>
          <h2 className="mb-1 text-lg font-semibold text-gray-900">전체 흐름</h2>
          <p className="mb-4 text-sm text-gray-500">
            각 계층을 클릭하면 상세 설명을 볼 수 있습니다. "흐름 재생"으로 쿼리의 여정을 애니메이션으로 확인하세요.
          </p>
          <LayerFlowDemo />
        </section>

        {/* Detailed comparison */}
        <section>
          <h2 className="mb-1 text-lg font-semibold text-gray-900">계층별 REST vs GraphQL 비교</h2>
          <p className="mb-4 text-sm text-gray-500">
            같은 계층에서 REST와 GraphQL의 접근 방식이 어떻게 다른지 비교합니다.
          </p>
          <LayerComparisonDemo />
        </section>

        {/* Request lifecycle example */}
        <section>
          <h2 className="mb-1 text-lg font-semibold text-gray-900">실제 요청의 여정 — 단계별 변환</h2>
          <p className="mb-4 text-sm text-gray-500">
            하나의 GraphQL 쿼리가 각 계층에서 어떻게 변환되는지 구체적으로 살펴봅니다.
          </p>

          <div className="space-y-3">
            <StepCard
              number={1}
              layer="Client"
              color="blue"
              title="컴포넌트가 데이터 요구사항 선언"
              code={`// React 컴포넌트 내부
const query = graphql\`
  query UserProfile($id: ID!) {
    user(id: $id) {
      name
      avatar
      posts { title }
    }
  }
\`
// variables: { id: "1" }`}
            />

            <Arrow />

            <StepCard
              number={2}
              layer="Transport"
              color="cyan"
              title="HTTP POST 요청으로 직렬화"
              code={`POST /graphql HTTP/1.1
Content-Type: application/json
Authorization: Bearer eyJhbG...

{
  "query": "query UserProfile($id: ID!) { user(id: $id) { name avatar posts { title } } }",
  "variables": { "id": "1" },
  "operationName": "UserProfile"
}`}
            />

            <Arrow />

            <StepCard
              number={3}
              layer="Parsing"
              color="violet"
              title="문자열 → AST 변환"
              code={`// DocumentNode (AST)
{
  kind: "Document",
  definitions: [{
    kind: "OperationDefinition",
    operation: "query",
    name: { value: "UserProfile" },
    selectionSet: {
      selections: [{
        kind: "Field",
        name: { value: "user" },
        arguments: [{ name: "id", value: { kind: "Variable", name: "id" } }],
        selectionSet: {
          selections: [
            { kind: "Field", name: { value: "name" } },
            { kind: "Field", name: { value: "avatar" } },
            { kind: "Field", name: { value: "posts" }, selectionSet: { ... } }
          ]
        }
      }]
    }
  }]
}`}
            />

            <Arrow />

            <StepCard
              number={4}
              layer="Validation"
              color="amber"
              title="스키마와 대조하여 유효성 검증"
              code={`// 검증 항목:
// ✅ Query.user 필드 존재함
// ✅ user(id: ID!) — $id 변수가 ID 타입과 호환
// ✅ User.name: String! — 필드 존재, 타입 일치
// ✅ User.avatar: String — 필드 존재
// ✅ User.posts: [Post!]! — 필드 존재
// ✅ Post.title: String! — 필드 존재
//
// 결과: VALID — 실행 계층으로 전달`}
            />

            <Arrow />

            <StepCard
              number={5}
              layer="Execution"
              color="green"
              title="Resolver 체인 실행"
              code={`// Execution 순서 (breadth-first):
//
// 1. Query.user(_, { id: "1" }, ctx)
//    → userResolver: DB에서 user 조회 → { id: "1", name: "Alice", ... }
//
// 2. User.name(user, _, ctx)
//    → default resolver: user.name → "Alice Kim"
//
// 3. User.avatar(user, _, ctx)
//    → default resolver: user.avatar → "https://..."
//
// 4. User.posts(user, _, ctx)
//    → postsResolver: DB에서 user의 posts 조회 → [{ id: "1", title: "..." }]
//
// 5. Post.title(post, _, ctx) — 각 post에 대해
//    → default resolver: post.title → "Getting Started with GraphQL"`}
            />

            <Arrow />

            <StepCard
              number={6}
              layer="Data Source"
              color="rose"
              title="DB/API에서 실제 데이터 조회"
              code={`// 실행된 DB 쿼리들:
//
// SELECT * FROM users WHERE id = '1'          -- userResolver
// SELECT * FROM posts WHERE author_id = '1'   -- postsResolver
//
// DataLoader 사용 시:
// SELECT * FROM users WHERE id IN ('1')       -- batched
// SELECT * FROM posts WHERE author_id IN ('1') -- batched`}
            />

            <Arrow reverse />

            <StepCard
              number={7}
              layer="Response"
              color="gray"
              title="최종 JSON 응답"
              code={`// HTTP 200 OK
{
  "data": {
    "user": {
      "name": "Alice Kim",
      "avatar": "https://api.dicebear.com/9.x/avataaars/svg?seed=Alice",
      "posts": [
        { "title": "Getting Started with GraphQL" },
        { "title": "Why Relay?" }
      ]
    }
  }
}
// ← 요청한 필드만 정확히 반환됨`}
            />
          </div>
        </section>
      </div>

      {/* Back to main */}
      <div className="mt-12 border-t border-gray-200 pt-6 text-center">
        <Link
          to="/graphql"
          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
        >
          ← GraphQL 메인으로 돌아가기
        </Link>
      </div>
    </div>
  )
}

const STEP_COLORS: Record<string, { badge: string; border: string; bg: string }> = {
  blue: { badge: 'bg-blue-100 text-blue-700', border: 'border-blue-200', bg: 'bg-blue-50/30' },
  cyan: { badge: 'bg-cyan-100 text-cyan-700', border: 'border-cyan-200', bg: 'bg-cyan-50/30' },
  violet: { badge: 'bg-violet-100 text-violet-700', border: 'border-violet-200', bg: 'bg-violet-50/30' },
  amber: { badge: 'bg-amber-100 text-amber-700', border: 'border-amber-200', bg: 'bg-amber-50/30' },
  green: { badge: 'bg-green-100 text-green-700', border: 'border-green-200', bg: 'bg-green-50/30' },
  rose: { badge: 'bg-rose-100 text-rose-700', border: 'border-rose-200', bg: 'bg-rose-50/30' },
  gray: { badge: 'bg-gray-100 text-gray-700', border: 'border-gray-300', bg: 'bg-gray-50/30' },
}

function StepCard({
  number,
  layer,
  color,
  title,
  code,
}: {
  number: number
  layer: string
  color: string
  title: string
  code: string
}) {
  const c = STEP_COLORS[color] ?? STEP_COLORS.gray

  return (
    <div className={`rounded-lg border ${c.border} ${c.bg} p-4`}>
      <div className="mb-2 flex items-center gap-2">
        <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${c.badge}`}>
          {number}. {layer}
        </span>
        <span className="text-xs font-semibold text-gray-800">{title}</span>
      </div>
      <div className="rounded-md border border-gray-200 bg-gray-900 p-3">
        <pre className="overflow-x-auto text-xs leading-relaxed text-green-400">{code}</pre>
      </div>
    </div>
  )
}

function Arrow({ reverse }: { reverse?: boolean }) {
  return (
    <div className="flex justify-center py-0.5">
      <span className="text-sm text-gray-300">{reverse ? '↑ response' : '↓'}</span>
    </div>
  )
}
