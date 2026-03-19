export type Product = {
  id: number
  name: string
  price: number
  rating: number
  reviewCount: number
  category: string
  imageColor: string
}

const CATEGORIES = ['전자기기', '의류', '식품', '가구', '도서', '스포츠', '뷰티', '완구']
const COLORS = [
  'bg-rose-200',
  'bg-blue-200',
  'bg-emerald-200',
  'bg-amber-200',
  'bg-violet-200',
  'bg-cyan-200',
  'bg-pink-200',
  'bg-lime-200',
]
const ADJECTIVES = ['프리미엄', '베이직', '클래식', '모던', '빈티지', '슬림', '울트라', '에코']
const NOUNS = ['워치', '백팩', '스니커즈', '텀블러', '쿠션', '램프', '키보드', '이어폰']

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

export function generateProduct(id: number): Product {
  const r1 = seededRandom(id * 7 + 3)
  const r2 = seededRandom(id * 13 + 7)
  const r3 = seededRandom(id * 17 + 11)
  const r4 = seededRandom(id * 23 + 19)
  const r5 = seededRandom(id * 29 + 31)

  return {
    id,
    name: `${ADJECTIVES[Math.floor(r1 * ADJECTIVES.length)]} ${NOUNS[Math.floor(r2 * NOUNS.length)]}`,
    price: Math.floor(r3 * 200 + 10) * 100,
    rating: Math.floor(r4 * 30 + 20) / 10,
    reviewCount: Math.floor(r5 * 5000),
    category: CATEGORIES[Math.floor(r1 * r2 * 100) % CATEGORIES.length],
    imageColor: COLORS[id % COLORS.length],
  }
}

const TOTAL_PRODUCTS = 10_000

export function getProducts(cursor: number, limit: number) {
  const items: Product[] = []
  const start = cursor
  const end = Math.min(start + limit, TOTAL_PRODUCTS)

  for (let i = start; i < end; i++) {
    items.push(generateProduct(i + 1))
  }

  return {
    items,
    nextCursor: end < TOTAL_PRODUCTS ? end : null,
    hasNext: end < TOTAL_PRODUCTS,
    total: TOTAL_PRODUCTS,
  }
}
