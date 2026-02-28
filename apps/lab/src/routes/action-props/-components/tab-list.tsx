import { useOptimistic, useTransition } from 'react'
import { Spinner } from './spinner'

type Tab = {
  label: string
  value: string
}

type TabListProps = {
  tabs: Tab[]
  activeTab: string
  changeAction?: (value: string) => Promise<unknown>
  onChange?: (e: React.MouseEvent<HTMLButtonElement>) => void
}

export function TabList({ tabs, activeTab, changeAction, onChange }: TabListProps) {
  const [optimisticTab, setOptimisticTab] = useOptimistic(activeTab)
  const [isPending, startTransition] = useTransition()

  function handleTabChange(e: React.MouseEvent<HTMLButtonElement>, value: string) {
    onChange?.(e)
    startTransition(async () => {
      setOptimisticTab(value)
      await changeAction?.(value)
    })
  }

  return (
    <div className="flex items-center gap-1">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={(e) => handleTabChange(e, tab.value)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            tab.value === optimisticTab
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {tab.label}
        </button>
      ))}
      {isPending && <Spinner />}
    </div>
  )
}
