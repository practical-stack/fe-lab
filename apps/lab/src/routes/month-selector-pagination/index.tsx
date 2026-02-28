import { createFileRoute } from '@tanstack/react-router'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@fe-lab/ui/components/tabs'
import { OffsetDemo } from './-sub/offset-demo'
import { CursorDemo } from './-sub/cursor-demo'
import { MonthOffsetDemo } from './-sub/month-offset-demo'

export const Route = createFileRoute('/month-selector-pagination/')({
  component: PaginationPatternsPage,
})

function PaginationPatternsPage() {
  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Pagination Patterns</h1>
      <p className="mb-8 text-gray-600">
        서버 인터페이스에 따른 페이지네이션 구현 패턴을 비교합니다.
      </p>

      <Tabs defaultValue="offset">
        <TabsList variant="line">
          <TabsTrigger value="offset">Offset-based</TabsTrigger>
          <TabsTrigger value="cursor">Cursor-based</TabsTrigger>
          <TabsTrigger value="month-offset">Month + Offset</TabsTrigger>
        </TabsList>

        <TabsContent value="offset" className="pt-6">
          <OffsetDemo />
        </TabsContent>

        <TabsContent value="cursor" className="pt-6">
          <CursorDemo />
        </TabsContent>

        <TabsContent value="month-offset" className="pt-6">
          <MonthOffsetDemo />
        </TabsContent>
      </Tabs>
    </div>
  )
}
