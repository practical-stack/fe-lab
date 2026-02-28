import { useState } from 'react'
import { TabList } from './tab-list'
import { changeTab } from '../-server/actions'

const tabs = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
]

export function TabListDemo() {
  const [activeTab, setActiveTab] = useState('all')

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-500">TabList</h3>
      <TabList
        tabs={tabs}
        activeTab={activeTab}
        changeAction={async (value) => {
          await changeTab({ data: value })
          setActiveTab(value)
        }}
      />
      <p className="text-sm text-gray-600">
        Persisted tab: <span className="font-mono font-semibold">{activeTab}</span>
      </p>
    </div>
  )
}
