import {
  type FeaturedNftsResponse,
  featuredNftsResponseSchema,
  type NftDetail,
  type NftListQueryInput,
  type NftListResponse,
  nftDetailSchema,
  nftListQueryToParams,
  nftListResponseSchema,
  type ReviewsResponse,
  reviewsResponseSchema,
} from "@/api/contracts"
import { http, parseResponse } from "@/api/http"

export const nftsApi = {
  list: async (query: NftListQueryInput, signal?: AbortSignal): Promise<NftListResponse> =>
    parseResponse(
      nftListResponseSchema,
      (await http.get("/nfts", { params: nftListQueryToParams(query), signal })).data,
    ),

  featured: async (signal?: AbortSignal): Promise<FeaturedNftsResponse> =>
    parseResponse(featuredNftsResponseSchema, (await http.get("/nfts/featured", { signal })).data),

  reviews: async (nftId: string, signal?: AbortSignal): Promise<ReviewsResponse> =>
    parseResponse(
      reviewsResponseSchema,
      (await http.get(`/nfts/${encodeURIComponent(nftId)}/reviews`, { signal })).data,
    ),

  detail: async (nftId: string, signal?: AbortSignal): Promise<NftDetail> =>
    parseResponse(
      nftDetailSchema,
      (await http.get(`/nfts/${encodeURIComponent(nftId)}`, { signal })).data,
    ),
}
