type Tab = {
  label: string
  value: string
}

type TabListProblemProps = {
  tabs: Tab[]
  activeTab: string
  changeAction?: (value: string) => Promise<unknown>
  onChange?: (e: React.MouseEvent<HTMLButtonElement>) => void
}

export function TabListProblem({ tabs, activeTab, changeAction, onChange }: TabListProblemProps) {
  async function handleTabChange(e: React.MouseEvent<HTMLButtonElement>, value: string) {
    onChange?.(e)
    await changeAction?.(value)
  }

  return (
    <div className="flex items-center gap-1">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={(e) => handleTabChange(e, tab.value)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            tab.value === activeTab
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
