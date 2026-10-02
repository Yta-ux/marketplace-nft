import {
  type Edition,
  type NftDetail,
  type NftListQuery,
  type NftListResponse,
  type NftSummary,
  nftCategorySchema,
  nftChainSchema,
} from "@/api/contracts"
import { eth } from "@/lib/eth"
import { commit, type DbNft, getDb } from "@/mocks/db"
import { reviewsFor, summarize } from "@/mocks/fixtures/reviews"
import { HttpError } from "@/mocks/lib/http"
import { scenario } from "@/mocks/scenarios"

export const priceFrom = (nft: DbNft) =>
  nft.editions.reduce((min, e) => eth.min(min, e.price), nft.editions[0]?.price ?? eth.zero)

const RARE_MAX_SUPPLY = 5

export const isRare = (nft: DbNft) => nft.editions.some((e) => e.supply <= RARE_MAX_SUPPLY)

export const defaultEdition = (nft: DbNft) =>
  nft.editions.filter((e) => e.available > 0).sort((a, b) => eth.cmp(a.price, b.price))[0]

export const totalAvailable = (nft: DbNft) => nft.editions.reduce((sum, e) => sum + e.available, 0)

function creatorOf(nft: DbNft) {
  const creator = getDb().creators.find((c) => c.id === nft.creatorId)
  if (!creator) throw new HttpError("INTERNAL", `Creator ${nft.creatorId} missing`)
  return creator
}

export function toSummary(nft: DbNft): NftSummary {
  const [image] = nft.gallery
  if (!image) throw new HttpError("INTERNAL", `NFT ${nft.id} has no image`)
  return {
    id: nft.id,
    name: nft.name,
    image,
    creator: creatorOf(nft),
    category: nft.category,
    chain: nft.chain,
    priceFrom: priceFrom(nft),
    compareAtPrice: nft.compareAtPrice,
    totalAvailable: totalAvailable(nft),
    isRare: isRare(nft),
    defaultEditionId: defaultEdition(nft)?.id ?? null,
    favoritesCount: nft.favoritesCount,
    createdAt: nft.createdAt,
    version: nft.version,
  }
}

export function toDetail(nft: DbNft): NftDetail {
  return {
    ...toSummary(nft),
    description: nft.description,
    gallery: nft.gallery,
    editions: nft.editions,
    tags: nft.tags,
    contractAddress: nft.contractAddress,
    tokenStandard: nft.tokenStandard,
    tokenId: `#${(nft.name.match(/#(\d+)/)?.[1] ?? nft.id.replace(/\D/g, "")).padStart(4, "0")}`,
    collection: "Kurio Apes",
    rating: summarize(reviewsFor(nft.id)),
  }
}

function visibleNfts(): readonly DbNft[] {
  return scenario.config.emptyCatalog ? [] : getDb().nfts
}

export function findNft(nftId: string): DbNft {
  const nft = visibleNfts().find((n) => n.id === nftId)
  if (!nft) throw new HttpError("NOT_FOUND", "NFT not found", { details: { nftId } })
  return nft
}

export function findEdition(nft: DbNft, editionId: string): Edition {
  const edition = nft.editions.find((e) => e.id === editionId)
  if (!edition)
    throw new HttpError("NOT_FOUND", "Edition not found", { details: { nftId: nft.id, editionId } })
  return edition
}

export function featuredNfts(): NftSummary[] {
  return visibleNfts()
    .filter((n) => n.featured)
    .map(toSummary)
}

const comparators: Record<NftListQuery["sort"], (a: DbNft, b: DbNft) => number> = {
  recent: (a, b) => b.createdAt.localeCompare(a.createdAt),
  "price-asc": (a, b) => eth.cmp(priceFrom(a), priceFrom(b)),
  "price-desc": (a, b) => eth.cmp(priceFrom(b), priceFrom(a)),
  popular: (a, b) => b.favoritesCount - a.favoritesCount,
  name: (a, b) => a.name.localeCompare(b.name),
}

const NEW_RELEASE_WINDOW_MS = 14 * 24 * 60 * 60 * 1000
const TRENDING_MIN_FAVORITES = 300

type Filter = keyof Pick<NftListQuery, "categories" | "chains">

function matches(nft: DbNft, query: NftListQuery, newestAt: number, except?: Filter): boolean {
  const term = query.q?.toLowerCase()
  if (term) {
    const haystack = `${nft.name} ${creatorOf(nft).name} ${nft.tags.join(" ")}`.toLowerCase()
    if (!haystack.includes(term)) return false
  }
  if (
    except !== "categories" &&
    query.categories?.length &&
    !query.categories.includes(nft.category)
  )
    return false
  if (except !== "chains" && query.chains?.length && !query.chains.includes(nft.chain)) return false
  const from = priceFrom(nft)
  if (query.minPrice && eth.cmp(from, query.minPrice) < 0) return false
  if (query.maxPrice && eth.cmp(from, query.maxPrice) > 0) return false
  if (query.tab === "new" && newestAt - new Date(nft.createdAt).getTime() > NEW_RELEASE_WINDOW_MS)
    return false
  if (query.tab === "trending" && nft.favoritesCount < TRENDING_MIN_FAVORITES) return false
  return true
}

function countBy<K extends string>(
  keys: readonly K[],
  items: readonly DbNft[],
  pick: (nft: DbNft) => K,
) {
  const counts = Object.fromEntries(keys.map((key) => [key, 0])) as Record<K, number>
  for (const nft of items) counts[pick(nft)] += 1
  return counts
}

export function listNfts(query: NftListQuery): NftListResponse {
  const all = visibleNfts()
  const newestAt = Math.max(0, ...all.map((n) => new Date(n.createdAt).getTime()))
  const filtered = all.filter((nft) => matches(nft, query, newestAt))
  const sorted = [...filtered].sort(
    (a, b) => comparators[query.sort](a, b) || a.id.localeCompare(b.id),
  )
  const start = (query.page - 1) * query.pageSize
  const prices = all.map(priceFrom)
  return {
    items: sorted.slice(start, start + query.pageSize).map(toSummary),
    page: query.page,
    pageSize: query.pageSize,
    total: sorted.length,
    totalPages: Math.ceil(sorted.length / query.pageSize),
    facets: {
      categories: countBy(
        nftCategorySchema.options,
        all.filter((nft) => matches(nft, query, newestAt, "categories")),
        (nft) => nft.category,
      ),
      chains: countBy(
        nftChainSchema.options,
        all.filter((nft) => matches(nft, query, newestAt, "chains")),
        (nft) => nft.chain,
      ),
      priceRange: {
        min: prices.reduce((min, p) => eth.min(min, p), prices[0] ?? eth.zero),
        max: prices.reduce((max, p) => eth.max(max, p), prices[0] ?? eth.zero),
      },
    },
  }
}

export function updateEdition(
  nftId: string,
  editionId: string,
  patch: { price?: string; available?: number; availableDelta?: number },
): DbNft {
  return commit((db) => {
    const nft = db.nfts.find((n) => n.id === nftId)
    const edition = nft?.editions.find((e) => e.id === editionId)
    if (!nft || !edition) throw new HttpError("NOT_FOUND", "Edition not found")
    if (patch.price !== undefined) edition.price = patch.price
    if (patch.available !== undefined)
      edition.available = Math.max(0, Math.min(edition.supply, patch.available))
    if (patch.availableDelta !== undefined) {
      edition.available = Math.max(
        0,
        Math.min(edition.supply, edition.available + patch.availableDelta),
      )
    }
    nft.version += 1
    return nft
  })
}
