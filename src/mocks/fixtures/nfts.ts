import type { Edition, NftCategory, NftChain } from "@/api/contracts"
import { eth } from "@/lib/eth"
import type { DbCreator, DbNft } from "@/mocks/db/schema"
import { createRandom, pad } from "@/mocks/fixtures/random"

export const NFT_COUNT = 36
const GALLERY_SIZE = 3
const ARTWORK_SIZE = 800

const ARTWORKS = [
  "ape-green-jacket",
  "ape-purple-hoodie",
  "ape-cream-blazer",
  "ape-orange-headphones",
] as const
type Artwork = (typeof ARTWORKS)[number]

export const creators: DbCreator[] = [
  "Orbitian",
  "Mira Okafor",
  "Kenji Hale",
  "Lumen Studio",
  "Petra Voss",
  "Dot Matrix",
  "Sol Arden",
  "Nyx Collective",
].map((name, i) => ({ id: `creator-${pad(i + 1, 2)}`, name, avatarUrl: null }))

const categories: NftCategory[] = [
  "digital-art",
  "photography",
  "music",
  "3d-art",
  "collectibles",
  "generative",
  "gaming",
  "memberships",
  "utility",
]
const chains: NftChain[] = ["ethereum", "polygon", "solana"]

type Seed = {
  name: string
  price: string
  artwork: Artwork
  category: NftCategory
  chain: NftChain
  compareAtPrice?: string
}

const figmaHomeGrid: Seed[] = [
  {
    name: "Emerald Ape #042",
    price: "1.19",
    artwork: "ape-green-jacket",
    category: "digital-art",
    chain: "ethereum",
  },
  {
    name: "Sage Nomad #009",
    price: "1.69",
    artwork: "ape-purple-hoodie",
    category: "digital-art",
    chain: "polygon",
  },
  {
    name: "Neon Vessel #552",
    price: "1.99",
    compareAtPrice: "2.29",
    artwork: "ape-cream-blazer",
    category: "3d-art",
    chain: "ethereum",
  },
  {
    name: "Cosmic Bloom #118",
    price: "1.29",
    artwork: "ape-purple-hoodie",
    category: "generative",
    chain: "solana",
  },
  {
    name: "Violet Nomad #314",
    price: "1.39",
    artwork: "ape-purple-hoodie",
    category: "photography",
    chain: "polygon",
  },
  {
    name: "Ivory Baron #088",
    price: "1.79",
    artwork: "ape-cream-blazer",
    category: "collectibles",
    chain: "ethereum",
  },
  {
    name: "Golden Beat #207",
    price: "0.99",
    artwork: "ape-orange-headphones",
    category: "music",
    chain: "solana",
  },
  {
    name: "Golden Pulse #233",
    price: "0.79",
    artwork: "ape-orange-headphones",
    category: "music",
    chain: "ethereum",
  },
  {
    name: "Golden Signal #160",
    price: "0.39",
    artwork: "ape-orange-headphones",
    category: "gaming",
    chain: "polygon",
  },
]

const adjectives = [
  "Amber",
  "Copper",
  "Rust",
  "Ivory",
  "Sage",
  "Golden",
  "Velvet",
  "Cosmic",
  "Emerald",
]
const nouns = ["Ape", "Nomad", "Baron", "Vessel", "Signal", "Bloom", "Beat", "Drifter", "Monarch"]
const PRICE_OVERRIDES: Record<number, string> = { 20: "12.30", 30: "0.02" }

const toCents = (cents: number) => (cents / 100).toFixed(2)

function generatedSeed(index: number, rand: ReturnType<typeof createRandom>): Seed {
  const i = index - 1
  return {
    name: `${adjectives[i % adjectives.length]} ${nouns[(i * 4) % nouns.length]} #${pad(rand.int(100, 999))}`,
    price: PRICE_OVERRIDES[index] ?? toCents(rand.int(12, 350)),
    compareAtPrice: index % 7 === 0 ? toCents(rand.int(360, 480)) : undefined,
    artwork: ARTWORKS[i % ARTWORKS.length] as Artwork,
    category: categories[i % categories.length] as NftCategory,
    chain: chains[i % chains.length] as NftChain,
  }
}

function buildEditions(
  id: string,
  index: number,
  price: string,
  rand: ReturnType<typeof createRandom>,
): Edition[] {
  const standardSupply = rand.int(20, 200)
  const editions: Edition[] = [
    {
      id: `${id}-standard`,
      label: "Standard",
      price,
      supply: standardSupply,
      available: rand.int(1, standardSupply),
      maxPerOrder: 5,
    },
  ]
  if (index % 2 === 0) {
    const supply = rand.int(5, 25)
    editions.push({
      id: `${id}-gold`,
      label: "Gold",
      price: eth.mul(price, 3),
      supply,
      available: index % 7 === 0 ? 0 : rand.int(1, supply),
      maxPerOrder: 2,
    })
  }
  if (index % 3 === 0) {
    editions.push({
      id: `${id}-unique`,
      label: "1/1 Unique",
      price: eth.mul(price, 10),
      supply: 1,
      available: index % 9 === 0 ? 0 : 1,
      maxPerOrder: 1,
    })
  }
  if (index % 13 === 0) for (const edition of editions) edition.available = 0
  return editions
}

function galleryFor(artwork: Artwork, name: string) {
  const start = ARTWORKS.indexOf(artwork)
  return Array.from({ length: GALLERY_SIZE }, (_, v) => ({
    url: `/images/nfts/${ARTWORKS[(start + v) % ARTWORKS.length]}.webp`,
    alt: v === 0 ? `Arte do NFT ${name}` : `Arte do NFT ${name}, vista ${v + 1}`,
    width: ARTWORK_SIZE,
    height: ARTWORK_SIZE,
  }))
}

export function buildNfts(): DbNft[] {
  const rand = createRandom(2026)
  return Array.from({ length: NFT_COUNT }, (_, i) => {
    const index = i + 1
    const id = `nft-${pad(index)}`
    const seed = figmaHomeGrid[i] ?? generatedSeed(index, rand)
    const creator = creators[(i * 3) % creators.length] as DbCreator
    const editions = buildEditions(id, index, seed.price, rand)
    return {
      id,
      name: seed.name,
      description: `${seed.name} faz parte da coleção de ${creator.name}. Cada edição inclui o arquivo em alta resolução e a procedência registrada on-chain.`,
      creatorId: creator.id,
      category: seed.category,
      chain: seed.chain,
      compareAtPrice: seed.compareAtPrice ?? null,
      gallery: galleryFor(seed.artwork, seed.name),
      editions,
      tags: [seed.category, seed.chain, creator.name.toLowerCase().replace(/\s+/g, "-")],
      contractAddress: `0x${(0x5a17e000 + index).toString(16).padStart(40, "0")}`,
      tokenStandard: editions.length > 1 ? "ERC-1155" : "ERC-721",
      favoritesCount: rand.int(0, 480),
      featured: index === 2 || index === 6 || index === 11 || index === 17,
      createdAt: new Date(Date.UTC(2026, 8, 30 - i, 12)).toISOString(),
      version: 1,
    }
  })
}
