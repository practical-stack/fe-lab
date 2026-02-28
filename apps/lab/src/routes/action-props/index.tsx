import { createFileRoute } from '@tanstack/react-router'
import { TabListDemo } from './-components/tab-list-demo'
import { EditableTextDemo } from './-components/editable-text-demo'

export const Route = createFileRoute('/action-props/')({
  component: ActionPropsPage,
})

function ActionPropsPage() {
  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Action Props</h1>
      <p className="mb-8 text-gray-600">
        React 19 patterns: <code className="text-sm">useTransition</code>,{' '}
        <code className="text-sm">useOptimistic</code>, and async action props for building
        responsive design components.
      </p>
      <div className="space-y-8">
        <section className="rounded-lg border border-gray-200 bg-white p-6">
          <TabListDemo />
        </section>
        <section className="rounded-lg border border-gray-200 bg-white p-6">
          <EditableTextDemo />
        </section>
      </div>
    </div>
  )
}
