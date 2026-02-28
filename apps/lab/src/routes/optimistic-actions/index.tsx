import type { ReactNode } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { TabListProblemDemo } from './-sub/tab-list/tab-list-problem-demo'
import { TabListSolutionDemo } from './-sub/tab-list/tab-list-solution-demo'
import { EditableTextProblemDemo } from './-sub/editable-text/editable-text-problem-demo'
import { EditableTextSolutionDemo } from './-sub/editable-text/editable-text-solution-demo'
import { CodeBlock } from './-sub/code-block'

export const Route = createFileRoute('/optimistic-actions/')({
  component: OptimisticActionsPage,
})

function OptimisticActionsPage() {
  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Optimistic Actions</h1>
      <p className="mb-8 text-gray-600">
        React 19 patterns: <code className="text-sm">useTransition</code>,{' '}
        <code className="text-sm">useOptimistic</code>, and async action props for building
        responsive design components.
      </p>

      <div className="space-y-12">
        <ProblemSolveSection
          title="TabList"
          problem={{
            description:
              '탭을 클릭하면 서버 응답(800ms)이 올 때까지 아무런 피드백이 없습니다. 사용자는 클릭이 됐는지 알 수 없고, 탭이 즉시 전환되지 않습니다.',
            demo: <TabListProblemDemo />,
            code: TAB_LIST_PROBLEM_CODE,
          }}
          solution={{
            description:
              'useOptimistic으로 탭이 즉시 전환되고, useTransition의 isPending으로 스피너가 표시됩니다. 서버 응답 전에도 UI가 즉각 반응합니다.',
            demo: <TabListSolutionDemo />,
            code: TAB_LIST_SOLUTION_CODE,
          }}
        />

        <ProblemSolveSection
          title="EditableText"
          problem={{
            description:
              '값을 수정하고 커밋하면 서버 응답(1000ms)까지 이전 값이 그대로 표시됩니다. 로딩 상태도 없어서 저장 중인지 알 수 없습니다.',
            demo: <EditableTextProblemDemo />,
            code: EDITABLE_TEXT_PROBLEM_CODE,
          }}
          solution={{
            description:
              'useOptimistic으로 수정된 값이 즉시 반영되고, useTransition의 isPending으로 스피너가 표시됩니다. 서버 실패 시 자동으로 이전 값으로 복구됩니다.',
            demo: <EditableTextSolutionDemo />,
            code: EDITABLE_TEXT_SOLUTION_CODE,
          }}
        />
      </div>
    </div>
  )
}

type PanelData = {
  description: string
  demo: ReactNode
  code: string
}

function ProblemSolveSection({
  title,
  problem,
  solution,
}: {
  title: string
  problem: PanelData
  solution: PanelData
}) {
  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold text-gray-900">{title}</h2>
      <div className="space-y-4">
        <Panel variant="problem" label="Problem" tag="basic async/await" data={problem} />
        <Panel
          variant="solution"
          label="Solution"
          tag="useTransition + useOptimistic"
          data={solution}
        />
      </div>
    </section>
  )
}

function Panel({
  variant,
  label,
  tag,
  data,
}: {
  variant: 'problem' | 'solution'
  label: string
  tag: string
  data: PanelData
}) {
  const styles = {
    problem: {
      border: 'border-red-200',
      bg: 'bg-red-50/30',
      badge: 'bg-red-100 text-red-700',
      demoBorder: 'border-red-100',
    },
    solution: {
      border: 'border-green-200',
      bg: 'bg-green-50/30',
      badge: 'bg-green-100 text-green-700',
      demoBorder: 'border-green-100',
    },
  }[variant]

  return (
    <div className={`rounded-lg border ${styles.border} ${styles.bg} p-5`}>
      <div className="mb-3 flex items-center gap-2">
        <span className={`rounded px-2 py-0.5 text-xs font-semibold ${styles.badge}`}>
          {label}
        </span>
        <span className="text-sm font-medium text-gray-700">{tag}</span>
      </div>

      <div className={`mb-3 rounded-lg border ${styles.demoBorder} bg-white p-4`}>
        {data.demo}
      </div>

      <p className="mb-3 text-sm leading-relaxed text-gray-600">{data.description}</p>

      <div className={`rounded-lg border ${styles.demoBorder} bg-white`}>
        <CodeBlock code={data.code} />
      </div>
    </div>
  )
}

const TAB_LIST_PROBLEM_CODE = `
function TabList({ tabs, activeTab, changeAction }) {
  // useOptimistic 없음 → 서버 응답까지 이전 탭 유지
  // useTransition 없음 → isPending 상태 알 수 없음

  async function handleTabChange(e, value) {
    await changeAction?.(value) // 800ms 대기...
  }

  return (
    <div>
      {tabs.map((tab) => (
        <button
          onClick={(e) => handleTabChange(e, tab.value)}
          className={tab.value === activeTab ? 'active' : ''}
        >
          {tab.label}
        </button>
      ))}
      {/* 스피너 표시 불가 - isPending이 없음 */}
    </div>
  )
}`

const TAB_LIST_SOLUTION_CODE = `
function TabList({ tabs, activeTab, changeAction }) {
  const [optimisticTab, setOptimisticTab] = useOptimistic(activeTab)
  const [isPending, startTransition] = useTransition()

  function handleTabChange(e, value) {
    startTransition(async () => {
      setOptimisticTab(value)     // 즉시 UI 반영
      await changeAction?.(value) // 서버 요청 (백그라운드)
    })
  }

  return (
    <div>
      {tabs.map((tab) => (
        <button
          onClick={(e) => handleTabChange(e, tab.value)}
          className={tab.value === optimisticTab ? 'active' : ''}
        >
          {tab.label}
        </button>
      ))}
      {isPending && <Spinner />}
    </div>
  )
}`

const EDITABLE_TEXT_PROBLEM_CODE = `
function EditableText({ value, action }) {
  // useOptimistic 없음 → 서버 응답까지 이전 값 표시
  // useTransition 없음 → 저장 중 상태 알 수 없음

  async function handleCommit(e) {
    await action(draft) // 1000ms 대기...
    // 이 사이에 사용자는 아무 피드백도 못 받음
  }

  return (
    <button>
      {value} {/* 서버 응답 후에야 새 값 표시 */}
    </button>
  )
}`

const EDITABLE_TEXT_SOLUTION_CODE = `
function EditableText({ value, action }) {
  const [optimisticValue, setOptimisticValue] = useOptimistic(value)
  const [isPending, startTransition] = useTransition()

  function handleCommit(e) {
    startTransition(async () => {
      setOptimisticValue(draft)  // 즉시 새 값 표시
      await action(draft)        // 서버 요청 (백그라운드)
    })
    // 서버 실패 시 자동으로 value(이전 값)로 복구
  }

  return (
    <span>
      <button>{optimisticValue}</button>
      {isPending && <Spinner />}
    </span>
  )
}`
