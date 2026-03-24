import { useState, useEffect } from 'react'

type LayerId = 'client' | 'transport' | 'parsing' | 'validation' | 'execution' | 'data'

type Layer = {
  id: LayerId
  number: number
  title: string
  titleEn: string
  color: string
  bgColor: string
  borderColor: string
  badgeColor: string
  description: string
  responsibilities: string[]
  tools: string[]
  input: string
  output: string
}

const LAYERS: Layer[] = [
  {
    id: 'client',
    number: 1,
    title: 'Client Layer',
    titleEn: '클라이언트 계층',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    badgeColor: 'bg-blue-100 text-blue-700',
    description:
      '사용자와 가장 가까운 계층. GraphQL 쿼리를 작성하고, 서버 응답을 캐싱·정규화하며, UI 컴포넌트에 데이터를 제공합니다. Apollo Client, Relay, urql 같은 클라이언트 라이브러리가 이 계층을 담당합니다.',
    responsibilities: [
      '쿼리/뮤테이션 작성 및 변수 바인딩',
      '응답 데이터의 정규화(normalized) 캐싱',
      'Optimistic updates — 서버 응답 전 UI 선반영',
      'Fragment colocation — 컴포넌트별 데이터 요구사항 선언',
      'Garbage collection — 사용하지 않는 캐시 엔트리 정리',
    ],
    tools: ['Apollo Client', 'Relay', 'urql', 'graphql-request', 'TanStack Query + gql'],
    input: 'UI 컴포넌트의 데이터 요구사항',
    output: 'GraphQL document (query string + variables)',
  },
  {
    id: 'transport',
    number: 2,
    title: 'Transport Layer',
    titleEn: '전송 계층',
    color: 'text-cyan-700',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    badgeColor: 'bg-cyan-100 text-cyan-700',
    description:
      'GraphQL 쿼리를 서버로 전달하고 응답을 받아오는 네트워크 계층. GraphQL 자체는 전송 프로토콜에 무관(transport-agnostic)하지만, 실무에서는 대부분 HTTP POST를 사용합니다.',
    responsibilities: [
      'HTTP POST /graphql 요청 발송 (query + variables를 JSON body로)',
      'HTTP 헤더 관리 (Authorization, Content-Type 등)',
      'WebSocket 연결 관리 (Subscriptions용)',
      'Batching — 여러 쿼리를 하나의 HTTP 요청으로 합치기',
      'Persisted Queries — 쿼리 해시로 전송하여 페이로드 축소',
    ],
    tools: ['HTTP (fetch/axios)', 'WebSocket (graphql-ws)', 'SSE (Server-Sent Events)', 'gRPC (드물지만 가능)'],
    input: 'Serialized GraphQL document (JSON)',
    output: 'HTTP response (JSON: { data, errors })',
  },
  {
    id: 'parsing',
    number: 3,
    title: 'Parsing Layer',
    titleEn: '파싱 계층',
    color: 'text-violet-700',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
    badgeColor: 'bg-violet-100 text-violet-700',
    description:
      '서버에 도착한 쿼리 문자열을 AST(Abstract Syntax Tree)로 변환하는 계층. GraphQL 문법에 맞지 않는 쿼리는 이 단계에서 즉시 거부됩니다. SQL의 파싱 단계와 유사합니다.',
    responsibilities: [
      'Lexical analysis — 쿼리 문자열을 토큰으로 분해',
      'Syntax analysis — 토큰을 AST(DocumentNode)로 조립',
      'Syntax error 감지 — 닫히지 않은 브라켓, 잘못된 키워드 등',
    ],
    tools: ['graphql-js (graphql/language/parser)', 'Relay Compiler (빌드 타임 파싱)', 'graphql-tag (gql template literal)'],
    input: 'Query string: "query { user(id: \\"1\\") { name } }"',
    output: 'AST (DocumentNode) — 트리 구조의 쿼리 표현',
  },
  {
    id: 'validation',
    number: 4,
    title: 'Validation Layer',
    titleEn: '검증 계층',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    badgeColor: 'bg-amber-100 text-amber-700',
    description:
      'AST를 스키마와 대조하여 유효성을 검사하는 계층. 존재하지 않는 필드, 잘못된 타입의 변수, 누락된 필수 인자 등을 이 단계에서 잡아냅니다. 실행 전에 오류를 발견하므로 불필요한 DB 쿼리를 방지합니다.',
    responsibilities: [
      '필드 존재 여부 확인 — User.nonExistent 같은 잘못된 필드 거부',
      '타입 호환성 — String 변수에 Int 전달 방지',
      '필수 인자 확인 — user(id:) 없이 호출 시 거부',
      'Fragment 유효성 — 올바른 타입에 spread 되었는지',
      'Depth/complexity 검사 — 보안 레이어 (커스텀 규칙)',
    ],
    tools: ['graphql-js (validate)', 'graphql-depth-limit', 'graphql-query-complexity', 'graphql-armor'],
    input: 'AST + Schema',
    output: 'Validated AST 또는 Validation Errors',
  },
  {
    id: 'execution',
    number: 5,
    title: 'Execution Layer',
    titleEn: '실행 계층',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    badgeColor: 'bg-green-100 text-green-700',
    description:
      'GraphQL의 핵심 엔진. 검증된 AST를 순회하며 각 필드에 해당하는 resolver 함수를 실행합니다. Breadth-first로 트리를 탐색하고, 각 resolver의 반환값이 자식 필드의 parent 객체가 됩니다.',
    responsibilities: [
      'Resolver 체인 실행 — 루트 Query부터 leaf 필드까지 재귀적 resolve',
      'Resolver 함수 호출 — (parent, args, context, info) 인자 전달',
      'Default resolver — resolver가 없으면 parent[fieldName] 자동 반환',
      'Error collection — 개별 필드 에러를 수집하되 나머지는 계속 실행 (부분 성공)',
      'Null propagation — Non-null 필드가 null이면 부모로 에러 전파',
    ],
    tools: ['graphql-js (execute)', 'Apollo Server', 'GraphQL Yoga', 'Mercurius', 'Pothos/Nexus (schema builders)'],
    input: 'Validated AST + Root Value + Context',
    output: '{ data: {...}, errors?: [...] }',
  },
  {
    id: 'data',
    number: 6,
    title: 'Data Source Layer',
    titleEn: '데이터 소스 계층',
    color: 'text-rose-700',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    badgeColor: 'bg-rose-100 text-rose-700',
    description:
      'Resolver가 실제 데이터를 가져오는 계층. 데이터베이스, REST API, 마이크로서비스, 캐시 등 다양한 소스에서 데이터를 조회합니다. DataLoader를 통한 배치/캐싱이 이 계층의 성능을 좌우합니다.',
    responsibilities: [
      'Database 쿼리 (SQL, NoSQL, ORM)',
      'REST API 호출 (기존 마이크로서비스 래핑)',
      'DataLoader — N+1 방지를 위한 배치 + 요청 레벨 캐싱',
      'Cache layer (Redis, Memcached) 조회',
      'Authorization — 현재 사용자의 접근 권한 확인',
    ],
    tools: ['DataLoader', 'Prisma', 'Drizzle', 'TypeORM', 'RESTDataSource (Apollo)'],
    input: 'Resolver 인자 (parent, args, context)',
    output: '도메인 객체 (User, Post, Comment 등)',
  },
]

const FLOW_STEPS = [
  { from: 'client', label: 'query + variables', arrow: '↓' },
  { from: 'transport', label: 'POST /graphql (JSON)', arrow: '↓' },
  { from: 'parsing', label: 'AST (DocumentNode)', arrow: '↓' },
  { from: 'validation', label: 'validated AST', arrow: '↓' },
  { from: 'execution', label: 'resolver chain', arrow: '↓' },
  { from: 'data', label: '{ data, errors }', arrow: '↑' },
]

export function LayerFlowDemo() {
  const [activeLayer, setActiveLayer] = useState<LayerId | null>(null)
  const [animating, setAnimating] = useState(false)
  const [highlightIdx, setHighlightIdx] = useState(-1)

  async function animateFlow() {
    setAnimating(true)
    setActiveLayer(null)
    for (let i = 0; i < LAYERS.length; i++) {
      setHighlightIdx(i)
      setActiveLayer(LAYERS[i].id)
      await new Promise((r) => setTimeout(r, 800))
    }
    // Response travels back up
    for (let i = LAYERS.length - 1; i >= 0; i--) {
      setHighlightIdx(i)
      setActiveLayer(LAYERS[i].id)
      await new Promise((r) => setTimeout(r, 400))
    }
    setAnimating(false)
    setHighlightIdx(-1)
  }

  const selectedLayer = LAYERS.find((l) => l.id === activeLayer)

  return (
    <div className="space-y-6">
      {/* Flow animation */}
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Query Lifecycle — 쿼리가 데이터가 되기까지</h3>
          <button
            onClick={animateFlow}
            disabled={animating}
            className="rounded-md bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600 disabled:opacity-50"
          >
            {animating ? 'Animating...' : '▶ 흐름 재생'}
          </button>
        </div>

        <div className="flex flex-col items-center gap-1">
          {LAYERS.map((layer, i) => (
            <div key={layer.id} className="flex w-full flex-col items-center">
              <button
                onClick={() => setActiveLayer(activeLayer === layer.id ? null : layer.id)}
                className={`w-full max-w-md rounded-lg border-2 px-4 py-2.5 text-left transition-all ${
                  activeLayer === layer.id
                    ? `${layer.borderColor} ${layer.bgColor} ring-2 ring-offset-1 ${layer.borderColor.replace('border-', 'ring-')}`
                    : highlightIdx === i
                      ? `${layer.borderColor} ${layer.bgColor}`
                      : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold ${layer.badgeColor}`}>
                    {layer.number}
                  </span>
                  <span className={`text-xs font-bold ${activeLayer === layer.id ? layer.color : 'text-gray-700'}`}>
                    {layer.title}
                  </span>
                  <span className="text-[10px] text-gray-400">{layer.titleEn}</span>
                </div>
              </button>
              {i < LAYERS.length - 1 && (
                <div className={`py-0.5 text-xs transition-colors ${highlightIdx === i ? 'text-blue-500' : highlightIdx === i + LAYERS.length ? 'text-green-500' : 'text-gray-300'}`}>
                  {highlightIdx > LAYERS.length - 1 && highlightIdx - LAYERS.length < i ? '↑' : '↓'}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Selected layer detail */}
      {selectedLayer && <LayerDetail layer={selectedLayer} />}
    </div>
  )
}

function LayerDetail({ layer }: { layer: Layer }) {
  return (
    <div className={`rounded-lg border-2 ${layer.borderColor} ${layer.bgColor} p-5`}>
      <div className="mb-3 flex items-center gap-2">
        <span className={`rounded px-2 py-0.5 text-xs font-bold ${layer.badgeColor}`}>
          Layer {layer.number}
        </span>
        <h3 className={`text-base font-bold ${layer.color}`}>{layer.title}</h3>
        <span className="text-xs text-gray-400">{layer.titleEn}</span>
      </div>

      <p className="mb-4 text-sm leading-relaxed text-gray-700">{layer.description}</p>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Responsibilities */}
        <div className="rounded-md border border-gray-200 bg-white p-3">
          <h4 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
            역할 (Responsibilities)
          </h4>
          <ul className="space-y-1">
            {layer.responsibilities.map((r, i) => (
              <li key={i} className="flex gap-1.5 text-xs text-gray-600">
                <span className="mt-0.5 text-gray-300">•</span>
                {r}
              </li>
            ))}
          </ul>
        </div>

        {/* Tools & I/O */}
        <div className="space-y-3">
          <div className="rounded-md border border-gray-200 bg-white p-3">
            <h4 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              대표 도구/라이브러리
            </h4>
            <div className="flex flex-wrap gap-1">
              {layer.tools.map((tool) => (
                <span
                  key={tool}
                  className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${layer.badgeColor}`}
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-gray-200 bg-white p-3">
            <h4 className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Input / Output
            </h4>
            <div className="space-y-1 text-xs">
              <div className="flex gap-2">
                <span className="w-10 shrink-0 font-medium text-gray-400">IN</span>
                <span className="font-mono text-gray-600">{layer.input}</span>
              </div>
              <div className="flex gap-2">
                <span className="w-10 shrink-0 font-medium text-gray-400">OUT</span>
                <span className="font-mono text-gray-600">{layer.output}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
