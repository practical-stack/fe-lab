import { useState } from 'react'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@fe-lab/ui/components/accordion'
import { Checkbox } from '@fe-lab/ui/components/checkbox'
import { Button } from '@fe-lab/ui/components/button'
import type { TermItem } from '../../api/terms.helper'

type TermsContentProps = {
  terms: TermItem[]
  onAgree: () => void
}

export function TermsContent({ terms, onAgree }: TermsContentProps) {
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  const allRequiredChecked = terms
    .filter((t) => t.required)
    .every((t) => checked[t.id])

  function toggleAll(value: boolean) {
    setChecked(Object.fromEntries(terms.map((t) => [t.id, value])))
  }

  return (
    <div className="space-y-4 p-4">
      <label className="flex cursor-pointer items-center gap-3 pb-2">
        <Checkbox checked={allRequiredChecked} onCheckedChange={toggleAll} />
        <span className="text-sm font-semibold">전체 동의</span>
      </label>

      <Accordion>
        {terms.map((term) => (
          <AccordionItem key={term.id} value={term.id}>
            <div className="flex items-center gap-3">
              <Checkbox
                checked={checked[term.id] ?? false}
                onCheckedChange={(value) =>
                  setChecked((prev) => ({ ...prev, [term.id]: Boolean(value) }))
                }
              />
              <AccordionTrigger>
                <span className="text-sm">
                  {term.required && (
                    <span className="mr-1 text-red-500">[필수]</span>
                  )}
                  {term.title}
                </span>
              </AccordionTrigger>
            </div>
            <AccordionContent>
              <p className="pl-7 text-xs leading-relaxed text-gray-500">
                {term.content}
              </p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <Button
        className="w-full"
        size="lg"
        disabled={!allRequiredChecked}
        onClick={onAgree}
      >
        동의하고 진행하기
      </Button>
    </div>
  )
}
