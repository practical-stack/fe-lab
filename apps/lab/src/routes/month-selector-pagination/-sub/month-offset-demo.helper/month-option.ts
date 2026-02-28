import { endOfMonth, format, isBefore, set, startOfMonth, subMonths } from 'date-fns'

export type MonthOption = {
  startDate: string // "2025-03-01"
  endDate: string // "2025-03-31"
  label: string // "2025년 3월"
  key: string // "2025-03"
}

export function generateMonthOptions(
  today: Date = set(new Date(), { hours: 12, minutes: 0, seconds: 0, milliseconds: 0 }),
): MonthOption[] {
  const months: MonthOption[] = []
  const currentMonth = startOfMonth(today)
  const oldestMonth = subMonths(currentMonth, 11)

  let cursor = currentMonth

  while (!isBefore(cursor, oldestMonth)) {
    const monthStart = startOfMonth(cursor)
    const monthEnd = endOfMonth(cursor)

    months.push({
      startDate: format(monthStart, 'yyyy-MM-dd'),
      endDate: format(monthEnd, 'yyyy-MM-dd'),
      label: format(monthStart, 'yyyy년 M월'),
      key: format(monthStart, 'yyyy-MM'),
    })

    cursor = subMonths(cursor, 1)
  }

  return months // [최신월, ..., 가장 오래된 월]
}
