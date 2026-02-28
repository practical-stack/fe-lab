import { queryOptions } from '@tanstack/react-query'
import { delay } from '~/@lib/helper/async/delay'

export type TermItem = {
  id: string
  title: string
  content: string
  required: boolean
}

const MOCK_TERMS: TermItem[] = [
  {
    id: 'service',
    title: '서비스 이용약관',
    content:
      '본 서비스 이용약관은 회사가 제공하는 서비스의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정합니다. 서비스를 이용함으로써 본 약관에 동의하는 것으로 간주됩니다.',
    required: true,
  },
  {
    id: 'privacy',
    title: '개인정보처리방침',
    content:
      '회사는 이용자의 개인정보를 중요시하며, 개인정보보호법 등 관련 법령을 준수합니다. 수집하는 개인정보 항목: 이름, 이메일, 연락처. 수집 목적: 서비스 제공 및 운영, 고객 상담.',
    required: true,
  },
  {
    id: 'marketing',
    title: '마케팅 수신동의',
    content:
      '마케팅 정보 수신에 동의하시면 신규 서비스, 이벤트, 프로모션 등의 정보를 이메일, SMS, 앱 푸시 등으로 받아보실 수 있습니다. 동의하지 않아도 서비스 이용에는 제한이 없습니다.',
    required: false,
  },
]

async function fetchTerms(): Promise<TermItem[]> {
  await delay(800)
  return MOCK_TERMS
}

export function termsQueryOptions(variant: 'problem-eager' | 'problem-lazy' | 'solution') {
  return queryOptions({
    queryKey: ['terms', variant],
    queryFn: fetchTerms,
  })
}
