import type { RatingSummary, Review } from "@/api/contracts"
import { createRandom, pad } from "@/mocks/fixtures/random"

const AUTHORS = [
  "Ana Collector",
  "Bruno Reis",
  "Carla Mendes",
  "Diego Faria",
  "Elisa Prado",
  "Felipe Nunes",
  "Gabriela Torres",
  "Heitor Lima",
  "Isabela Rocha",
  "João Pedro",
  "Karina Alves",
  "Lucas Barros",
]

const BY_RATING: Record<number, { titles: string[]; bodies: string[] }> = {
  5: {
    titles: ["Peça incrível", "Superou o esperado", "Vale cada ETH", "Acabamento impecável"],
    bodies: [
      "A arte é ainda mais detalhada ao vivo. O processo de compra foi rápido e a obra já está na minha carteira.",
      "Colecionável com identidade forte e procedência clara. Recomendo para quem quer começar uma coleção.",
      "Entrega imediata, metadados corretos e a edição limitada faz diferença no acervo.",
    ],
  },
  4: {
    titles: ["Muito bom", "Boa aquisição", "Gostei bastante"],
    bodies: [
      "Ótima composição e boa liquidez. Só senti falta de mais informações sobre a coleção.",
      "A obra corresponde à descrição. A taxa de rede pesou um pouco, mas a experiência foi tranquila.",
    ],
  },
  3: {
    titles: ["Razoável", "Cumpre o que promete"],
    bodies: [
      "Boa arte, porém esperava mais extras para colecionadores. Preço dentro do mercado.",
      "A compra funcionou bem, mas o valor está um pouco acima do que eu pagaria.",
    ],
  },
  2: {
    titles: ["Abaixo do esperado"],
    bodies: [
      "A imagem final difere um pouco da prévia e a escassez da edição não compensa o preço.",
    ],
  },
}

const BASE_DATE = Date.UTC(2026, 8, 20, 12, 0, 0)
const DAY_MS = 86_400_000

function seedFor(nftId: string): number {
  return Number(nftId.replace(/\D/g, "")) || 1
}

export function reviewsFor(nftId: string): Review[] {
  const seed = seedFor(nftId)
  if (seed % 9 === 0) return []
  const random = createRandom(seed * 7919)
  const count = seed === 1 ? 19 : random.int(4, 24)
  const reviews: Review[] = []
  for (let i = 0; i < count; i++) {
    const roll = random.next()
    const rating = roll < 0.55 ? 5 : roll < 0.85 ? 4 : roll < 0.96 ? 3 : 2
    const pool = BY_RATING[rating] ?? BY_RATING[5]
    if (!pool) continue
    const authorIndex = (seed + i * 5) % AUTHORS.length
    reviews.push({
      id: `rev-${nftId}-${pad(i + 1, 2)}`,
      nftId,
      author: {
        id: `author-${pad(authorIndex + 1, 2)}`,
        name: AUTHORS[authorIndex] ?? "Colecionador",
      },
      rating,
      title: random.pick(pool.titles),
      body: random.pick(pool.bodies),
      createdAt: new Date(BASE_DATE - (i * 3 + random.int(0, 2)) * DAY_MS).toISOString(),
    })
  }
  return reviews
}

export function summarize(reviews: Review[]): RatingSummary {
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  let total = 0
  for (const review of reviews) {
    distribution[review.rating as 1 | 2 | 3 | 4 | 5] += 1
    total += review.rating
  }
  const average = reviews.length === 0 ? 0 : Math.round((total / reviews.length) * 10) / 10
  return { average, count: reviews.length, distribution }
}
