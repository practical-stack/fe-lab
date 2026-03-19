import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
})

const concepts = [
  {
    to: '/optimistic-actions' as const,
    title: 'Optimistic Actions',
    description:
      'React 19 patterns: useTransition, useOptimistic, and async action props for building responsive design components.',
    source: 'Aurora Scharff - Building Design Components with Action Props',
  },
  {
    to: '/prefetch-overlay' as const,
    title: 'Prefetch + Overlay',
    description:
      '화면에 당장 보이지 않는 데이터를 PrefetchQuery로 미리 캐싱하여, 오버레이(바텀시트)를 Skeleton 없이 즉시 여는 패턴.',
    source: 'Prefetch + Overlay 패턴: 약관 동의 바텀시트를 로딩 없이 여는 법',
  },
  {
    to: '/month-selector-pagination' as const,
    title: 'Pagination Patterns',
    description:
      '서버 인터페이스(Offset / Cursor / 월+Offset)에 따른 페이지네이션 구현 패턴과 keepPreviousData를 활용한 전환 UX.',
    source: '월 선택 + 페이지네이션 패턴: 월 단위 목록 조회를 위한 이중 네비게이션',
  },
  {
    to: '/sticky-header' as const,
    title: 'Sticky Header',
    description:
      '중간에 위치한 컴포넌트가 스크롤되어 화면 상단에 닿으면 고정되는 패턴. IntersectionObserver sentinel로 sticky 상태를 감지하여 시각적 피드백을 제공합니다.',
    source: 'Sticky Header 패턴: IntersectionObserver + CSS sticky',
  },
  {
    to: '/swipeable-tabs' as const,
    title: 'Swipeable Tabs',
    description:
      '탭 패널을 좌우 스와이프로 전환하는 패턴. CSS scroll-snap으로 제스처를 처리하고, scrollIntoView로 프로그래밍 전환, 스크롤 위치 기반 탭 인디케이터 자동 동기화.',
    source: 'devongovett/rac-swipeable-tabs (React Aria Components)',
  },
]

function Home() {
  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-gray-900">FE Lab</h1>
      <p className="mb-8 text-gray-600">Exploring modern frontend patterns and concepts.</p>
      <div className="grid gap-4">
        {concepts.map((concept) => (
          <Link
            key={concept.to}
            to={concept.to}
            className="block rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
          >
            <h2 className="mb-1 text-lg font-semibold text-gray-900">{concept.title}</h2>
            <p className="mb-2 text-sm text-gray-600">{concept.description}</p>
            <p className="text-xs text-gray-400">{concept.source}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
