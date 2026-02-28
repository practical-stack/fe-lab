export type TransactionItem = {
  id: string
  date: string
  description: string
  amount: number
  category: string
}

const CATEGORIES = ['식비', '교통', '쇼핑', '의료', '문화', '공과금', '급여', '이체']
const DESCRIPTIONS: Record<string, string[]> = {
  식비: ['점심 식사', '저녁 식사', '카페', '편의점', '배달 주문'],
  교통: ['지하철', '버스', '택시', '주유', '주차'],
  쇼핑: ['온라인 쇼핑', '마트', '의류', '전자기기', '생활용품'],
  의료: ['병원 진료', '약국', '건강검진', '치과'],
  문화: ['영화', '도서', '공연', '구독 서비스'],
  공과금: ['전기료', '수도료', '가스료', '통신비', '인터넷'],
  급여: ['월급', '보너스', '프리랜서 수입'],
  이체: ['계좌 이체', '자동 이체', '적금'],
}

/** Deterministic seed-based random for consistent mock data */
function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

export function generateTransactions(yearMonth: string, count: number): TransactionItem[] {
  const [year, month] = yearMonth.split('-').map(Number)
  const seed = year * 100 + month
  const random = seededRandom(seed)

  const daysInMonth = new Date(year, month, 0).getDate()

  return Array.from({ length: count }, (_, i) => {
    const category = CATEGORIES[Math.floor(random() * CATEGORIES.length)]
    const descs = DESCRIPTIONS[category]
    const description = descs[Math.floor(random() * descs.length)]
    const day = Math.floor(random() * daysInMonth) + 1
    const isIncome = category === '급여'
    const amount = isIncome
      ? Math.floor(random() * 3000000) + 2000000
      : -(Math.floor(random() * 150000) + 1000)

    return {
      id: `${yearMonth}-${String(i + 1).padStart(4, '0')}`,
      date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      description,
      amount,
      category,
    }
  }).sort((a, b) => b.date.localeCompare(a.date))
}
