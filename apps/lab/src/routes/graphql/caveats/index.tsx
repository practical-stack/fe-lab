import { createFileRoute, Link } from '@tanstack/react-router'
import { useGraphQLWorker } from '../-sub/@shared/use-graphql-worker'
import { HttpCachingDemo } from './-sub/http-caching-demo'
import { NPlusOneDemo } from './-sub/n-plus-one-demo'
import { ServerComplexityDemo } from './-sub/server-complexity-demo'
import { ErrorHandlingDemo } from './-sub/error-handling-demo'
import { FileUploadDemo } from './-sub/file-upload-demo'
import { WhenRestWinsDemo } from './-sub/when-rest-wins-demo'

export const Route = createFileRoute('/graphql/caveats/')({
  component: CaveatsPage,
})

const CAVEATS = [
  { id: 'http-caching', number: 1, title: 'HTTP 캐싱이 작동하지 않는다', tagline: 'POST 요청 + 동적 바디 = CDN/브라우저 캐시 무용지물' },
  { id: 'n-plus-one', number: 2, title: 'N+1 문제가 기본으로 발생한다', tagline: '중첩 resolver가 각각 DB 쿼리를 실행하는 구조적 문제' },
  { id: 'server-complexity', number: 3, title: '서버 복잡도가 증가한다', tagline: '클라이언트가 임의 깊이의 쿼리를 보낼 수 있는 보안/성능 리스크' },
  { id: 'error-handling', number: 4, title: '에러 핸들링이 완전히 다르다', tagline: '항상 HTTP 200, 부분 성공 가능, errors 배열 필수 체크' },
  { id: 'file-upload', number: 5, title: '파일 업로드가 스펙에 없다', tagline: 'GraphQL 스펙은 JSON만 다루므로 바이너리 전송에 별도 확장 필요' },
  { id: 'when-rest-wins', number: 6, title: '단순한 경우에는 REST가 낫다', tagline: 'GraphQL이 만능은 아닙니다 — 트레이드오프를 이해하고 선택하기' },
]

function CaveatsPage() {
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
      {/* Header */}
      <div className="mb-2">
        <Link to="/graphql" className="text-xs text-blue-600 hover:underline">
          ← GraphQL
        </Link>
      </div>
      <h1 className="mb-2 text-2xl font-bold text-gray-900">
        GraphQL Caveats
      </h1>
      <p className="mb-8 text-gray-600">
        GraphQL이 만능은 아닙니다. REST 대비 구조적으로 발생하는 트레이드오프를 인터랙티브 데모와
        함께 하나씩 살펴봅니다. 도입 전에 이 문제들을 이해하고 대응 전략을 세워야 합니다.
      </p>

      {/* Table of contents */}
      <nav className="mb-12 rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
          목차
        </h2>
        <div className="grid gap-2 md:grid-cols-2">
          {CAVEATS.map((c) => (
            <a
              key={c.id}
              href={`#${c.id}`}
              className="group flex items-start gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-gray-50"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-amber-100 text-[10px] font-bold text-amber-700">
                {c.number}
              </span>
              <div>
                <p className="text-xs font-medium text-gray-800 group-hover:text-blue-600">
                  {c.title}
                </p>
                <p className="text-[10px] text-gray-400">{c.tagline}</p>
              </div>
            </a>
          ))}
        </div>
      </nav>

      {/* Caveat sections */}
      <div className="space-y-16">
        {/* 1. HTTP Caching */}
        <CaveatSection
          id="http-caching"
          number={1}
          title="HTTP 캐싱이 작동하지 않는다"
          severity="high"
          summary="REST는 GET 요청의 URL을 캐시 키로 사용해 CDN과 브라우저 캐시를 자연스럽게 활용합니다. GraphQL은 모든 요청이 같은 URL(/graphql)에 대한 POST이므로 HTTP 표준 캐싱 메커니즘이 전혀 작동하지 않습니다."
          detail="이 문제는 특히 읽기 비중이 높은 API(뉴스, 상품 목록 등)에서 심각합니다. REST라면 CDN 하나로 해결할 트래픽을 GraphQL은 매번 오리진 서버까지 전달해야 합니다. Persisted Queries, 클라이언트 사이드 normalized cache, 또는 GraphQL-aware CDN(Stellate)이 대안이지만 모두 추가 인프라와 복잡도를 수반합니다."
        >
          <HttpCachingDemo />
        </CaveatSection>

        {/* 2. N+1 Problem */}
        <CaveatSection
          id="n-plus-one"
          number={2}
          title="N+1 문제가 기본으로 발생한다"
          severity="high"
          summary="GraphQL resolver는 필드 단위로 실행됩니다. 리스트의 각 항목에 대해 연관 데이터를 가져오는 resolver가 개별로 실행되면, 1(리스트) + N(각 항목의 연관 데이터) 번의 DB 쿼리가 발생합니다."
          detail="REST에서는 컨트롤러가 한 번에 JOIN 쿼리를 작성하므로 이 문제가 구조적으로 발생하지 않습니다. GraphQL에서는 resolver의 독립성(각 필드가 자체적으로 데이터를 resolve)이 오히려 N+1을 유발합니다. DataLoader는 이를 해결하는 표준 패턴으로, 같은 이벤트 루프 tick 내의 개별 load() 호출을 하나의 배치 쿼리로 합칩니다."
        >
          <NPlusOneDemo />
        </CaveatSection>

        {/* 3. Server Complexity */}
        <CaveatSection
          id="server-complexity"
          number={3}
          title="서버 복잡도가 증가한다"
          severity="medium"
          summary="REST는 서버가 응답 형태를 결정하지만, GraphQL은 클라이언트가 쿼리 형태를 결정합니다. 이는 유연성의 원천이자 동시에 위험의 원천입니다 — 악의적이거나 실수로 작성된 깊은 쿼리가 서버 리소스를 고갈시킬 수 있습니다."
          detail="특히 circular reference가 있는 스키마(User → Posts → Author → Posts → ...)에서 depth 제한 없이는 무한히 깊은 쿼리가 가능합니다. 또한 aliases를 이용한 field explosion 공격도 가능합니다. 프로덕션 GraphQL 서버에는 query depth limiting, cost analysis, rate limiting, 그리고 가능하다면 persisted queries(임의 쿼리 완전 차단)가 필수입니다."
        >
          <ServerComplexityDemo />
        </CaveatSection>

        {/* 4. Error Handling */}
        <CaveatSection
          id="error-handling"
          number={4}
          title="에러 핸들링이 완전히 다르다"
          severity="medium"
          summary="REST에서는 HTTP 상태 코드(404, 401, 500)로 에러 종류를 즉시 판별할 수 있습니다. GraphQL은 거의 항상 HTTP 200을 반환하고, 성공/실패 여부는 응답 바디의 data/errors 필드를 파싱해야 알 수 있습니다."
          detail="더 놀라운 점은 '부분 성공'이 가능하다는 것입니다. 하나의 쿼리에서 일부 필드는 성공적으로 resolve되고, 일부는 에러가 발생할 수 있습니다. 이 경우 data와 errors가 동시에 존재합니다. 기존의 HTTP 상태 코드 기반 에러 처리 미들웨어(interceptor, retry logic 등)를 완전히 재설계해야 합니다."
        >
          <ErrorHandlingDemo />
        </CaveatSection>

        {/* 5. File Upload */}
        <CaveatSection
          id="file-upload"
          number={5}
          title="파일 업로드가 스펙에 없다"
          severity="low"
          summary="GraphQL 스펙은 JSON 기반 요청/응답만 정의합니다. 바이너리 파일 업로드는 스펙 범위 밖이며, 커뮤니티 확장(graphql-multipart-request-spec)이나 REST 하이브리드 패턴으로 해결해야 합니다."
          detail="graphql-upload 같은 라이브러리가 있지만 비표준이고, 서버 프레임워크마다 지원 방식이 다릅니다. 실무에서는 파일 업로드를 REST(또는 S3 presigned URL)로 처리하고, 반환된 URL을 GraphQL mutation에 전달하는 하이브리드 패턴이 가장 널리 사용됩니다."
        >
          <FileUploadDemo />
        </CaveatSection>

        {/* 6. When REST Wins */}
        <CaveatSection
          id="when-rest-wins"
          number={6}
          title="단순한 경우에는 REST가 낫다"
          severity="info"
          summary="GraphQL은 복잡한 데이터 요구사항을 우아하게 해결하지만, 그 유연성에는 비용이 따릅니다. 스키마 설계, 리졸버 작성, 코드 생성, 클라이언트 캐시 설정 등 초기 비용과 러닝커브가 상당합니다."
          detail="단순한 CRUD API, 캐싱이 핵심인 서비스, 팀에 GraphQL 경험이 없는 경우에는 REST가 더 적합할 수 있습니다. 중요한 것은 '새로운 기술이니까' 도입하는 것이 아니라, 실제 문제(다양한 클라이언트, 깊은 관계형 데이터, 프론트엔드 자율성)를 해결하기 위해 선택하는 것입니다."
        >
          <WhenRestWinsDemo />
        </CaveatSection>
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

const SEVERITY_STYLES = {
  high: { badge: 'bg-red-100 text-red-700', border: 'border-red-200' },
  medium: { badge: 'bg-yellow-100 text-yellow-700', border: 'border-yellow-200' },
  low: { badge: 'bg-blue-100 text-blue-700', border: 'border-blue-200' },
  info: { badge: 'bg-gray-100 text-gray-700', border: 'border-gray-200' },
}

function CaveatSection({
  id,
  number,
  title,
  severity,
  summary,
  detail,
  children,
}: {
  id: string
  number: number
  title: string
  severity: 'high' | 'medium' | 'low' | 'info'
  summary: string
  detail: string
  children: React.ReactNode
}) {
  const styles = SEVERITY_STYLES[severity]

  return (
    <section id={id} className="scroll-mt-20">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-800">
          {number}
        </span>
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${styles.badge}`}>
          {severity === 'info' ? 'TRADE-OFF' : `SEVERITY: ${severity.toUpperCase()}`}
        </span>
      </div>

      <div className="mb-4 space-y-2 text-sm leading-relaxed text-gray-700">
        <p>{summary}</p>
        <p className="text-gray-500">{detail}</p>
      </div>

      <div className={`rounded-lg border ${styles.border} bg-white p-5`}>
        {children}
      </div>
    </section>
  )
}
