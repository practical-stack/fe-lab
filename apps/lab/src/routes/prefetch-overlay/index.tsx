import { createFileRoute } from '@tanstack/react-router'
import { ProblemEagerDemo } from './-sub/problem-eager-demo'
import { ProblemDemo } from './-sub/problem-demo'
import { SolutionDemo } from './-sub/solution-demo'
import { Panel } from '~/@lib/ui/common/panel'

export const Route = createFileRoute('/prefetch-overlay/')({
  component: PrefetchOverlayPage,
})

function PrefetchOverlayPage() {
  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Prefetch + Overlay</h1>
      <p className="mb-8 text-gray-600">
        화면에 당장 보이지 않는 데이터를 미리 불러와, 오버레이를 로딩 없이 즉시 여는 패턴.
      </p>

      <div className="space-y-12">
        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">약관 동의 바텀시트</h2>
          <div className="space-y-4">
            <Panel
              variant="problem"
              label="Problem 1"
              tag="페이지에서 useQuery"
              data={{
                description:
                  '페이지 마운트 시 useQuery로 약관 데이터를 즉시 호출합니다. 데이터가 올 때까지 ~800ms 동안 페이지 자체에 Skeleton이 표시되어, 약관과 무관한 UI까지 가려집니다.',
                demo: <ProblemEagerDemo />,
                code: PROBLEM_EAGER_CODE,
              }}
            />
            <Panel
              variant="problem"
              label="Problem 2"
              tag="Sheet 내부에서 useQuery"
              data={{
                description:
                  '페이지에는 로딩이 없지만, "시작하기" 클릭 시 Sheet 내부에서 API를 호출합니다. Sheet가 열린 뒤 ~800ms 동안 Skeleton이 보이고, 그 후에야 약관 목록이 표시됩니다.',
                demo: <ProblemDemo />,
                code: PROBLEM_LAZY_CODE,
              }}
            />
            <Panel
              variant="solution"
              label="Solution"
              tag="PrefetchQuery + SuspenseQuery"
              data={{
                description:
                  'PrefetchQuery로 페이지 마운트 시 약관 데이터를 UI 없이 캐시에 준비합니다. 페이지에 Skeleton이 없고, Sheet 내부의 SuspenseQuery가 캐시 HIT → Skeleton 없이 즉시 약관 목록을 렌더링합니다.',
                demo: <SolutionDemo />,
                code: SOLUTION_CODE,
              }}
            />
          </div>
        </section>
      </div>
    </div>
  )
}

const PROBLEM_EAGER_CODE = `
// 페이지 마운트 시 useQuery → 데이터 로딩까지 Skeleton
function ProblemEagerDemo() {
  const { data: terms, isLoading } = useQuery(
    termsQueryOptions('problem-eager')
  )

  if (isLoading || !terms) {
    return <TermsSkeleton />  // 페이지에 ~800ms Skeleton
  }

  function handleOpen() {
    overlay.open(({ isOpen, close }) => (
      <Sheet open={isOpen} onOpenChange={...}>
        <SheetContent side="bottom">
          <TermsContent terms={terms} onAgree={close} />
        </SheetContent>
      </Sheet>
    ))
  }

  return <Button onClick={handleOpen}>시작하기</Button>
}`

const PROBLEM_LAZY_CODE = `
// Sheet 내부에서 useQuery → 열릴 때마다 로딩
function ProblemSheetBody({ close }) {
  const { data: terms, isLoading } = useQuery(
    termsQueryOptions('problem-lazy')
  )

  if (isLoading || !terms) {
    return <TermsSkeleton />  // Sheet 내부 ~800ms Skeleton
  }

  return <TermsContent terms={terms} onAgree={close} />
}

function ProblemDemo() {
  function handleOpen() {
    overlay.open(({ isOpen, close }) => (
      <Sheet open={isOpen} onOpenChange={...}>
        <SheetContent side="bottom">
          <ProblemSheetBody close={close} />
        </SheetContent>
      </Sheet>
    ))
  }

  return <Button onClick={handleOpen}>시작하기</Button>
}`

const SOLUTION_CODE = `
// Sheet 내부에서 SuspenseQuery → 캐시 HIT 시 즉시 렌더
function SolutionSheetBody({ close }) {
  return (
    <Suspense fallback={<TermsSkeleton />}>
      <SuspenseQuery {...termsQueryOptions('solution')}>
        {({ data: terms }) => (
          <TermsContent terms={terms} onAgree={close} />
        )}
      </SuspenseQuery>
    </Suspense>
  )
}

// PrefetchQuery로 마운트 시 UI 없이 캐시 준비
function SolutionDemo() {
  return (
    <>
      <PrefetchQuery {...termsQueryOptions('solution')} />
      <Button onClick={handleOpen}>시작하기</Button>
    </>
  )
}`
