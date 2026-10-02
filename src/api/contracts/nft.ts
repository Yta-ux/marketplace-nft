import { z } from "zod"
import { ethAmountSchema, isoDateSchema, paginatedSchema } from "./common"
import { ratingSummarySchema } from "./review"

export const nftCategorySchema = z.enum([
  "digital-art",
  "photography",
  "music",
  "3d-art",
  "collectibles",
  "generative",
  "gaming",
  "memberships",
  "utility",
])
export type NftCategory = z.infer<typeof nftCategorySchema>

export const nftChainSchema = z.enum(["ethereum", "polygon", "solana"])
export type NftChain = z.infer<typeof nftChainSchema>

export const creatorSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatarUrl: z.string().nullable(),
})
export type Creator = z.infer<typeof creatorSchema>

export const nftImageSchema = z.object({
  url: z.string(),
  alt: z.string(),
  width: z.number().int(),
  height: z.number().int(),
})
export type NftImage = z.infer<typeof nftImageSchema>

export const editionSchema = z.object({
  id: z.string(),
  label: z.string(),
  price: ethAmountSchema,
  supply: z.number().int().min(1),
  available: z.number().int().min(0),
  maxPerOrder: z.number().int().min(1),
})
export type Edition = z.infer<typeof editionSchema>

export const nftSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  image: nftImageSchema,
  creator: creatorSchema,
  category: nftCategorySchema,
  chain: nftChainSchema,
  priceFrom: ethAmountSchema,
  compareAtPrice: ethAmountSchema.nullable(),
  totalAvailable: z.number().int().min(0),
  isRare: z.boolean(),
  defaultEditionId: z.string().nullable(),
  favoritesCount: z.number().int().min(0),
  createdAt: isoDateSchema,
  version: z.number().int().min(1),
})
export type NftSummary = z.infer<typeof nftSummarySchema>

export const nftDetailSchema = nftSummarySchema.extend({
  description: z.string(),
  gallery: z.array(nftImageSchema).min(1),
  editions: z.array(editionSchema).min(1),
  tags: z.array(z.string()),
  contractAddress: z.string(),
  tokenStandard: z.enum(["ERC-721", "ERC-1155"]),
  tokenId: z.string(),
  collection: z.string(),
  rating: ratingSummarySchema,
})
export type NftDetail = z.infer<typeof nftDetailSchema>

export const nftSortSchema = z.enum(["recent", "price-asc", "price-desc", "popular", "name"])
export type NftSort = z.infer<typeof nftSortSchema>

export const nftTabSchema = z.enum(["all", "new", "trending"])
export type NftTab = z.infer<typeof nftTabSchema>

export const NFT_PAGE_SIZE = 9
export const NFT_MAX_PAGE_SIZE = 48

const csv = <T extends z.ZodType>(item: T) =>
  z.preprocess(
    (value) => (typeof value === "string" ? value.split(",").filter(Boolean) : value),
    z.array(item).optional(),
  )

export const nftListQuerySchema = z.object({
  q: z.string().trim().max(80).optional().catch(undefined),
  categories: csv(nftCategorySchema).catch(undefined),
  chains: csv(nftChainSchema).catch(undefined),
  minPrice: ethAmountSchema.optional().catch(undefined),
  maxPrice: ethAmountSchema.optional().catch(undefined),
  tab: nftTabSchema.default("all").catch("all"),
  sort: nftSortSchema.default("recent").catch("recent"),
  page: z.coerce.number().int().min(1).default(1).catch(1),
  pageSize: z.coerce
    .number()
    .int()
    .min(1)
    .max(NFT_MAX_PAGE_SIZE)
    .default(NFT_PAGE_SIZE)
    .catch(NFT_PAGE_SIZE),
})
export type NftListQuery = z.infer<typeof nftListQuerySchema>
export type NftListQueryInput = Partial<NftListQuery>

export function nftListQueryToParams(query: NftListQueryInput): URLSearchParams {
  const q = nftListQuerySchema.parse(query)
  const params = new URLSearchParams()
  if (q.q) params.set("q", q.q)
  if (q.categories?.length) params.set("categories", [...q.categories].sort().join(","))
  if (q.chains?.length) params.set("chains", [...q.chains].sort().join(","))
  if (q.minPrice) params.set("minPrice", q.minPrice)
  if (q.maxPrice) params.set("maxPrice", q.maxPrice)
  if (q.tab !== "all") params.set("tab", q.tab)
  if (q.sort !== "recent") params.set("sort", q.sort)
  if (q.page !== 1) params.set("page", String(q.page))
  if (q.pageSize !== NFT_PAGE_SIZE) params.set("pageSize", String(q.pageSize))
  return params
}

export function nftListQueryFromParams(params: URLSearchParams): NftListQuery {
  return nftListQuerySchema.parse(Object.fromEntries(params))
}

export const nftFacetsSchema = z.object({
  categories: z.record(nftCategorySchema, z.number().int().min(0)),
  chains: z.record(nftChainSchema, z.number().int().min(0)),
  priceRange: z.object({ min: ethAmountSchema, max: ethAmountSchema }),
})
export type NftFacets = z.infer<typeof nftFacetsSchema>

export const nftListResponseSchema = paginatedSchema(nftSummarySchema).extend({
  facets: nftFacetsSchema,
})
export type NftListResponse = z.infer<typeof nftListResponseSchema>

export const featuredNftsResponseSchema = z.object({ items: z.array(nftSummarySchema) })
export type FeaturedNftsResponse = z.infer<typeof featuredNftsResponseSchema>
