import { useState } from 'react'
import { Check, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { Button } from '@fe-lab/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@fe-lab/ui/components/dialog'
import { ScrollArea } from '@fe-lab/ui/components/scroll-area'
import { Separator } from '@fe-lab/ui/components/separator'

export type MonthItem = {
  label: string
  key: string
}

export function MonthNavigator({
  label,
  months,
  selectedIndex,
  onPrev,
  onNext,
  onFirst,
  onLast,
  onSelect,
  isPrevDisabled = false,
  isNextDisabled = false,
}: {
  label: string
  months: MonthItem[]
  selectedIndex: number
  onPrev: () => void
  onNext: () => void
  onFirst: () => void
  onLast: () => void
  onSelect: (index: number) => void
  isPrevDisabled?: boolean
  isNextDisabled?: boolean
}) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [pendingIndex, setPendingIndex] = useState(selectedIndex)

  function handleOpen(open: boolean) {
    if (open) setPendingIndex(selectedIndex)
    setDialogOpen(open)
  }

  function handleApply() {
    onSelect(pendingIndex)
    setDialogOpen(false)
  }

  const isFirstDisabled = selectedIndex === 0
  const isLastDisabled = selectedIndex === months.length - 1

  return (
    <div className="flex items-center gap-1.5">
      <Button
        variant="ghost"
        size="icon"
        className="size-9"
        onClick={onFirst}
        disabled={isFirstDisabled}
        aria-label="최신 월"
      >
        <ChevronsLeft className="size-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="size-9"
        onClick={onPrev}
        disabled={isPrevDisabled}
        aria-label="다음 월"
      >
        <ChevronLeft className="size-5" />
      </Button>

      <Dialog open={dialogOpen} onOpenChange={handleOpen}>
        <DialogTrigger
          render={
            <Button
              variant="ghost"
              className="min-w-[110px] text-sm font-semibold text-gray-900"
            />
          }
        >
          {label}
        </DialogTrigger>
        <DialogContent className="flex max-h-[80vh] flex-col gap-0 p-0 sm:max-w-xs">
          <DialogHeader className="px-4 pt-4 pb-3">
            <DialogTitle>월 선택</DialogTitle>
          </DialogHeader>
          <Separator />
          <ScrollArea className="min-h-0 flex-1 overflow-hidden">
            <div className="px-2 py-1">
              {months.map((month, index) => {
                const isSelected = index === pendingIndex
                return (
                  <Button
                    key={month.key}
                    variant="ghost"
                    onClick={() => setPendingIndex(index)}
                    className={`w-full justify-between px-3 py-6 text-sm ${
                      isSelected
                        ? 'font-semibold text-emerald-600 hover:text-emerald-600'
                        : 'font-normal text-gray-900'
                    }`}
                  >
                    <span>{month.label}</span>
                    {isSelected && <Check className="size-5 text-emerald-500" />}
                  </Button>
                )
              })}
            </div>
          </ScrollArea>
          <Separator />
          <DialogFooter className="mx-0 mb-0 border-t-0 px-4 pt-3 pb-6">
            <Button
              size="lg"
              className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={handleApply}
            >
              적용
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Button
        variant="ghost"
        size="icon"
        className="size-9"
        onClick={onNext}
        disabled={isNextDisabled}
        aria-label="이전 월"
      >
        <ChevronRight className="size-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="size-9"
        onClick={onLast}
        disabled={isLastDisabled}
        aria-label="가장 오래된 월"
      >
        <ChevronsRight className="size-5" />
      </Button>
    </div>
  )
}
