import { useState } from 'react'

type EditableTextProblemProps = {
  value: string
  displayValue?: string | ((value: string) => string)
  action: (value: string) => Promise<unknown>
  onChange?: (e: React.SyntheticEvent) => void
}

export function EditableTextProblem({
  value,
  displayValue,
  action,
  onChange,
}: EditableTextProblemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  async function handleCommit(e: React.SyntheticEvent) {
    setIsEditing(false)
    if (draft === value) return
    onChange?.(e)
    await action(draft)
  }

  function handleCancel() {
    setIsEditing(false)
    setDraft(value)
  }

  const resolvedDisplay = value
    ? typeof displayValue === 'function'
      ? displayValue(value)
      : (displayValue ?? value)
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
    <button
      onClick={() => {
        setDraft(value)
        setIsEditing(true)
      }}
      className="cursor-pointer rounded px-2 py-1 text-sm text-gray-900 hover:bg-gray-100"
    >
      {resolvedDisplay || 'Click to edit...'}
    </button>
  )
}
