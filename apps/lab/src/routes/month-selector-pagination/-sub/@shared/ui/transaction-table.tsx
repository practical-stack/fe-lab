import type { TransactionItem } from '../api/mock-data'

function formatAmount(amount: number): string {
  const prefix = amount >= 0 ? '+' : ''
  return `${prefix}${amount.toLocaleString('ko-KR')}원`
}

export function TransactionTable({
  items,
  isStale = false,
}: {
  items: TransactionItem[]
  isStale?: boolean
}) {
  return (
    <div
      className="overflow-hidden rounded-lg border border-gray-200 transition-opacity duration-200"
      style={{ opacity: isStale ? 0.5 : 1 }}
    >
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs text-gray-500">
            <th className="px-4 py-2.5 font-medium">날짜</th>
            <th className="px-4 py-2.5 font-medium">내용</th>
            <th className="px-4 py-2.5 font-medium">카테고리</th>
            <th className="px-4 py-2.5 text-right font-medium">금액</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-gray-100 last:border-0">
              <td className="px-4 py-2.5 text-gray-500">{item.date}</td>
              <td className="px-4 py-2.5 text-gray-900">{item.description}</td>
              <td className="px-4 py-2.5">
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                  {item.category}
                </span>
              </td>
              <td
                className={`px-4 py-2.5 text-right font-mono text-sm ${
                  item.amount >= 0 ? 'text-blue-600' : 'text-gray-900'
                }`}
              >
                {formatAmount(item.amount)}
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                데이터가 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
