import type { ReactNode } from 'react'

export function DesignCallout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4">
      <h4 className="mb-2 text-sm font-semibold text-blue-900">{title}</h4>
      <div className="text-sm leading-relaxed text-blue-800 [&_li]:ml-4 [&_li]:list-disc [&_ul]:space-y-1">
        {children}
      </div>
    </div>
  )
}
