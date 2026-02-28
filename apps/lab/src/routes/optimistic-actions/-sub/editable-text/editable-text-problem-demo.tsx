import { useState } from 'react'
import { EditableTextProblem } from './editable-text-problem'
import { saveText } from '../../-server/actions'
import { formatCurrency } from '~/lib/utils'

export function EditableTextProblemDemo() {
  const [goal, setGoal] = useState('10000')

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-700">Revenue Goal:</span>
        <EditableTextProblem
          value={goal}
          action={async (value) => {
            await saveText({ data: value })
            setGoal(value)
          }}
          displayValue={(value) => formatCurrency(Number(value))}
        />
      </div>
      <p className="text-sm text-gray-600">
        Persisted value:{' '}
        <span className="font-mono font-semibold">{formatCurrency(Number(goal))}</span>
      </p>
    </div>
  )
}
