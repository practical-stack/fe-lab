import { Skeleton } from '@fe-lab/ui/components/skeleton'

export function TermsSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3">
          <Skeleton className="mt-1 h-4 w-4 shrink-0 rounded" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      ))}
      <Skeleton className="mt-4 h-10 w-full rounded-lg" />
    </div>
  )
}
