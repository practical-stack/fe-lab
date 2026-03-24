import { useState } from 'react'

type ComparisonRow = {
  aspect: string
  rest: string
  graphql: string
  layerNote: string
}

const COMPARISONS: ComparisonRow[] = [
  {
    aspect: 'Client → 쿼리 작성',
    rest: 'URL 경로 + HTTP 메서드로 결정. 클라이언트가 응답 형태를 제어할 수 없음',
    graphql: '클라이언트가 필요한 필드를 직접 선언. Fragment로 컴포넌트별 데이터 요구사항 분리',
    layerNote: 'Client Layer',
  },
  {
    aspect: 'Transport → 요청 전송',
    rest: 'GET/POST/PUT/DELETE + URL. 각 리소스가 고유 URL을 가짐 → HTTP 캐시 활용 가능',
    graphql: 'POST /graphql 단일 엔드포인트. 쿼리가 body에 포함되므로 URL 기반 캐시 불가',
    layerNote: 'Transport Layer',
  },
  {
    aspect: 'Parsing → 요청 해석',
    rest: 'URL 라우팅 + JSON body 파싱. 프레임워크가 자동 처리 (Express, Koa 등)',
    graphql: 'GraphQL 전용 파서가 쿼리 문자열 → AST 변환. 별도 파싱 단계가 추가됨',
    layerNote: 'Parsing Layer',
  },
  {
    aspect: 'Validation → 요청 검증',
    rest: '개발자가 직접 구현 (Joi, Zod, class-validator). 스키마와 무관한 별도 계층',
    graphql: '스키마 기반 자동 검증. 타입/필드 존재 여부를 런타임에 자동 체크',
    layerNote: 'Validation Layer',
  },
  {
    aspect: 'Execution → 데이터 처리',
    rest: '컨트롤러/서비스가 전체 응답을 한 번에 조립. 개발자가 쿼리 최적화 직접 담당',
    graphql: 'Resolver가 필드 단위로 독립 실행. 유연하지만 N+1 문제 발생 가능',
    layerNote: 'Execution Layer',
  },
  {
    aspect: 'Data → 데이터 접근',
    rest: '서비스 레이어에서 DB 쿼리 직접 작성. JOIN으로 관련 데이터 한 번에 조회',
    graphql: 'DataLoader로 배치/캐싱. 각 resolver가 독립적으로 데이터 소스 접근',
    layerNote: 'Data Source Layer',
  },
]

export function LayerComparisonDemo() {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">
        각 계층에서 REST와 GraphQL의 접근 방식이 어떻게 다른지 비교합니다. 행을 클릭하면 상세 설명을 볼 수 있습니다.
      </p>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-3 py-2 text-left font-medium text-gray-500">계층 / 관점</th>
              <th className="px-3 py-2 text-left font-medium text-green-600">REST</th>
              <th className="px-3 py-2 text-left font-medium text-purple-600">GraphQL</th>
            </tr>
          </thead>
          <tbody>
            {COMPARISONS.map((row, i) => (
              <tr
                key={i}
                onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
                className={`cursor-pointer border-b border-gray-50 transition-colors last:border-0 ${
                  expandedIdx === i ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
              >
                <td className="px-3 py-2.5">
                  <p className="font-medium text-gray-800">{row.aspect}</p>
                  <p className="text-[10px] text-gray-400">{row.layerNote}</p>
                </td>
                <td className="px-3 py-2.5 text-gray-600">{row.rest}</td>
                <td className="px-3 py-2.5 text-gray-600">{row.graphql}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Key insight */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h4 className="mb-2 text-xs font-bold text-gray-700">핵심 차이</h4>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded border border-green-100 bg-green-50/50 p-3">
            <p className="text-xs font-semibold text-green-800">REST — 서버 주도</p>
            <p className="mt-1 text-[11px] text-green-700">
              서버가 엔드포인트별로 응답 형태를 결정합니다. 각 계층이 독립적이고 HTTP 표준과
              자연스럽게 통합됩니다. 하지만 클라이언트의 다양한 데이터 요구를 수용하기 어렵습니다.
            </p>
          </div>
          <div className="rounded border border-purple-100 bg-purple-50/50 p-3">
            <p className="text-xs font-semibold text-purple-800">GraphQL — 클라이언트 주도</p>
            <p className="mt-1 text-[11px] text-purple-700">
              클라이언트가 필요한 데이터를 선언하고, 서버는 그에 맞게 실행합니다. 유연하지만
              파싱/검증/실행 각 단계에서 추가 복잡도가 발생하고, HTTP 표준 활용이 제한됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
