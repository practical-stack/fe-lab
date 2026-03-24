import { useState } from 'react'

type Criterion = {
  label: string
  description: string
  rest: number  // 1-5 score
  graphql: number
  restNote: string
  graphqlNote: string
}

const CRITERIA: Criterion[] = [
  {
    label: '단순 CRUD API',
    description: '리소스 기반 CRUD 작업이 대부분인 경우',
    rest: 5, graphql: 2,
    restNote: 'URL = 리소스. HTTP 메서드 = 동작. 직관적이고 도구 지원 풍부',
    graphqlNote: '단순 CRUD에 스키마 설계, 리졸버 작성, 코드젠은 과도한 오버헤드',
  },
  {
    label: '다양한 클라이언트',
    description: 'Web, iOS, Android, IoT 등 클라이언트마다 다른 데이터가 필요',
    rest: 2, graphql: 5,
    restNote: '클라이언트별 엔드포인트 또는 ?fields= 파라미터 필요. BFF 패턴으로 우회',
    graphqlNote: '각 클라이언트가 필요한 필드만 쿼리. 서버 변경 없이 클라이언트 자율적',
  },
  {
    label: 'HTTP 캐싱',
    description: 'CDN, 브라우저 캐시를 적극 활용해야 하는 경우',
    rest: 5, graphql: 2,
    restNote: 'URL 기반 자동 캐싱. Cache-Control, ETag, 304 모두 자연스럽게 동작',
    graphqlNote: 'POST 요청이라 HTTP 캐시 불가. Persisted Queries 또는 클라이언트 캐시 필요',
  },
  {
    label: '실시간 데이터',
    description: '서버 → 클라이언트 실시간 업데이트가 핵심',
    rest: 3, graphql: 4,
    restNote: 'SSE, WebSocket 별도 구현. REST와 실시간 채널이 분리되어 관리 포인트 증가',
    graphqlNote: 'Subscription이 스키마에 통합. 타입 안전한 실시간 데이터. 하지만 인프라 복잡',
  },
  {
    label: '깊은 관계형 데이터',
    description: 'Entity 간 복잡한 관계를 탐색해야 하는 경우',
    rest: 1, graphql: 5,
    restNote: '여러 엔드포인트 순차 호출(waterfall). ?include=, ?expand= 확장은 비표준',
    graphqlNote: '중첩 쿼리로 한 번에 해결. 하지만 N+1 문제와 depth 제한 주의',
  },
  {
    label: '팀 러닝커브',
    description: '팀이 새로운 기술을 학습하는 비용',
    rest: 5, graphql: 2,
    restNote: 'HTTP만 알면 됨. 거의 모든 개발자가 이미 익숙',
    graphqlNote: '스키마 설계, resolver, code generation, 클라이언트 캐시 등 학습 필요',
  },
  {
    label: '에코시스템 / 도구',
    description: 'API 문서화, 테스트, 모니터링 도구의 성숙도',
    rest: 5, graphql: 3,
    restNote: 'OpenAPI/Swagger, Postman, curl. 표준화된 생태계가 풍부',
    graphqlNote: 'GraphiQL, Apollo Studio, Relay DevTools. 성장 중이지만 REST보다 적음',
  },
]

export function WhenRestWinsDemo() {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)

  return (
    <div className="space-y-4">
      {/* Score table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-3 py-2 text-left font-medium text-gray-500">기준</th>
              <th className="w-24 px-3 py-2 text-center font-medium text-gray-500">REST</th>
              <th className="w-24 px-3 py-2 text-center font-medium text-gray-500">GraphQL</th>
            </tr>
          </thead>
          <tbody>
            {CRITERIA.map((c, i) => (
              <tr
                key={i}
                onClick={() => setSelectedIdx(selectedIdx === i ? null : i)}
                className={`cursor-pointer border-b border-gray-50 transition-colors last:border-0 ${
                  selectedIdx === i ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
              >
                <td className="px-3 py-2">
                  <p className="font-medium text-gray-800">{c.label}</p>
                  <p className="text-[10px] text-gray-400">{c.description}</p>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center justify-center gap-1">
                    <ScoreBar score={c.rest} color="green" />
                    <span className="w-4 text-center font-mono text-[10px] text-gray-500">{c.rest}</span>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center justify-center gap-1">
                    <ScoreBar score={c.graphql} color="purple" />
                    <span className="w-4 text-center font-mono text-[10px] text-gray-500">{c.graphql}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail panel */}
      {selectedIdx !== null && (
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-md border border-green-200 bg-green-50/50 p-3">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-green-700">REST</p>
            <p className="text-xs leading-relaxed text-green-900/80">
              {CRITERIA[selectedIdx].restNote}
            </p>
          </div>
          <div className="rounded-md border border-purple-200 bg-purple-50/50 p-3">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-purple-700">GraphQL</p>
            <p className="text-xs leading-relaxed text-purple-900/80">
              {CRITERIA[selectedIdx].graphqlNote}
            </p>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 text-xs leading-relaxed text-gray-700">
        <h4 className="mb-2 font-semibold text-gray-900">결론: 어떤 경우에 뭘 쓸까?</h4>
        <div className="grid gap-2 md:grid-cols-2">
          <div className="rounded border border-green-200 bg-green-50/50 p-3">
            <p className="font-semibold text-green-800">REST가 유리한 경우</p>
            <ul className="mt-1 space-y-0.5 text-[11px] text-green-700">
              <li>• 리소스가 단순하고 관계가 얕은 CRUD API</li>
              <li>• HTTP 캐싱이 핵심 성능 전략인 경우</li>
              <li>• 팀이 GraphQL 경험이 없고 일정이 빠듯한 경우</li>
              <li>• 공개 API로 외부 개발자가 소비하는 경우</li>
              <li>• 파일 업로드/다운로드가 주요 기능인 경우</li>
            </ul>
          </div>
          <div className="rounded border border-purple-200 bg-purple-50/50 p-3">
            <p className="font-semibold text-purple-800">GraphQL이 유리한 경우</p>
            <ul className="mt-1 space-y-0.5 text-[11px] text-purple-700">
              <li>• 다양한 클라이언트가 서로 다른 데이터를 필요로 할 때</li>
              <li>• Entity 간 관계가 복잡하고 깊은 탐색이 필요할 때</li>
              <li>• 프론트엔드 팀이 백엔드 변경 없이 빠르게 이터레이션할 때</li>
              <li>• 마이크로서비스의 API Gateway(BFF)로 사용할 때</li>
              <li>• 타입 안전성과 코드 생성을 적극 활용하고 싶을 때</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

function ScoreBar({ score, color }: { score: number; color: 'green' | 'purple' }) {
  const bgClass = color === 'green' ? 'bg-green-500' : 'bg-purple-500'
  const trackClass = color === 'green' ? 'bg-green-100' : 'bg-purple-100'
  return (
    <div className={`h-2 w-12 rounded-full ${trackClass}`}>
      <div
        className={`h-full rounded-full ${bgClass} transition-all`}
        style={{ width: `${(score / 5) * 100}%` }}
      />
    </div>
  )
}
