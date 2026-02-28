import { useOptimistic, useState, useTransition } from 'react'
import { Spinner } from '../@shared/ui/spinner'

type EditableTextProps = {
  value: string
  displayValue?: string | ((value: string) => string)
  action: (value: string) => Promise<unknown>
  onChange?: (e: React.SyntheticEvent) => void
}

export function EditableTextSolution({ value, displayValue, action, onChange }: EditableTextProps) {
  const [isPending, startTransition] = useTransition()
  const [optimisticValue, setOptimisticValue] = useOptimistic(value)
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  function handleCommit(e: React.SyntheticEvent) {
    setIsEditing(false)
    if (draft === optimisticValue) return
    onChange?.(e)
    startTransition(async () => {
      setOptimisticValue(draft)
      await action(draft)
    })
  }

  function handleCancel() {
    setIsEditing(false)
    setDraft(optimisticValue)
  }

  const resolvedDisplay = optimisticValue
    ? typeof displayValue === 'function'
      ? displayValue(optimisticValue)
      : (displayValue ?? optimisticValue)
    : null

  if (isEditing) {
    return (
      <input
        className="rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={handleCommit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleCommit(e)
          if (e.key === 'Escape') handleCancel()
        }}
        autoFocus
      />
    )
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        onClick={() => {
          setDraft(optimisticValue)
          setIsEditing(true)
        }}
        className="cursor-pointer rounded px-2 py-1 text-sm text-gray-900 hover:bg-gray-100"
      >
        {resolvedDisplay || 'Click to edit...'}
      </button>
      {isPending && <Spinner />}
    </span>
  )
}
