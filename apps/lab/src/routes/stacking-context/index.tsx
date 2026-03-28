import { createFileRoute } from '@tanstack/react-router'
import { DefaultStackingOrder } from './-sub/1-default-stacking-order'
import { WhatCreatesStackingContext } from './-sub/2-what-creates-stacking-context'
import { ZIndexTrap } from './-sub/3-z-index-trap'
import { HiddenStackingContextCreators } from './-sub/4-hidden-stacking-context-creators'
import { FixedInsideTransform } from './-sub/5-fixed-inside-transform'
import { IsolationProperty } from './-sub/6-isolation-property'
import { PracticalPatterns } from './-sub/7-practical-patterns'

export const Route = createFileRoute('/stacking-context/')({
  component: StackingContextPage,
})

function StackingContextPage() {
  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-gray-900">CSS Stacking Context</h1>
      <p className="mb-8 text-gray-600">
        z-index: 9999를 줘도 왜 요소가 뒤에 숨는지, 어떤 CSS 속성이 새로운 Stacking Context를 만드는지, 실무에서 자주 겪는 함정과 해결 패턴을 단계별로 학습합니다.
      </p>

      <div className="space-y-16">
        {/* Phase 1: 기초 개념 */}
        <section>
          <div className="mb-6 border-l-4 border-blue-500 pl-4">
            <h2 className="text-xl font-bold text-gray-900">Phase 1: 기초 개념</h2>
            <p className="text-sm text-gray-500">Stacking Context가 무엇이고 어떻게 만들어지는지</p>
          </div>
          <div className="space-y-10">
            <DefaultStackingOrder />
            <WhatCreatesStackingContext />
          </div>
        </section>

        {/* Phase 2: 흔한 함정들 */}
        <section>
          <div className="mb-6 border-l-4 border-red-500 pl-4">
            <h2 className="text-xl font-bold text-gray-900">Phase 2: 흔한 함정들</h2>
            <p className="text-sm text-gray-500">실무에서 자주 겪는 z-index 문제의 근본 원인</p>
          </div>
          <div className="space-y-10">
            <ZIndexTrap />
            <HiddenStackingContextCreators />
            <FixedInsideTransform />
          </div>
        </section>

        {/* Phase 3: 해결 패턴 */}
        <section>
          <div className="mb-6 border-l-4 border-green-500 pl-4">
            <h2 className="text-xl font-bold text-gray-900">Phase 3: 해결 패턴</h2>
            <p className="text-sm text-gray-500">Stacking Context를 제어하고 활용하는 실전 패턴</p>
          </div>
          <div className="space-y-10">
            <IsolationProperty />
            <PracticalPatterns />
          </div>
        </section>
      </div>
    </div>
  )
}
