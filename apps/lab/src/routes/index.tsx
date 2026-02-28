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
