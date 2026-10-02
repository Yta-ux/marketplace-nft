import { keepPreviousData, queryOptions } from "@tanstack/react-query"
import type { NftListQuery } from "@/api/contracts"
import { nftsApi } from "@/api/endpoints"

export const nftKeys = {
  all: ["nfts"] as const,
  list: (query: NftListQuery) => [...nftKeys.all, "list", query] as const,
  featured: () => [...nftKeys.all, "featured"] as const,
  detail: (nftId: string) => [...nftKeys.all, "detail", nftId] as const,
}

export const nftListQueryOptions = (query: NftListQuery) =>
  queryOptions({
    queryKey: nftKeys.list(query),
    queryFn: ({ signal }) => nftsApi.list(query, signal),
    placeholderData: keepPreviousData,
  })

export const nftReviewsQueryOptions = (nftId: string) =>
  queryOptions({
    queryKey: [...nftKeys.detail(nftId), "reviews"] as const,
    queryFn: ({ signal }) => nftsApi.reviews(nftId, signal),
    staleTime: 60_000,
  })

export const featuredNftsQueryOptions = () =>
  queryOptions({
    queryKey: nftKeys.featured(),
    queryFn: ({ signal }) => nftsApi.featured(signal),
    staleTime: 5 * 60_000,
  })

export const nftDetailQueryOptions = (nftId: string) =>
  queryOptions({
    queryKey: nftKeys.detail(nftId),
    queryFn: ({ signal }) => nftsApi.detail(nftId, signal),
    staleTime: 60_000,
  })

export const RELATED_COUNT = 3

export const relatedNftsQueryOptions = (key: string, query: NftListQuery, exclude: string[]) =>
  queryOptions({
    queryKey: [...nftKeys.all, "related", key, query] as const,
    queryFn: async ({ signal }) => {
      const { items } = await nftsApi.list(query, signal)
      return items.filter((nft) => !exclude.includes(nft.id)).slice(0, RELATED_COUNT)
    },
    staleTime: 60_000,
  })
