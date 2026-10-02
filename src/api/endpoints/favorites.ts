import {
  type FavoritesResponse,
  type FavoriteToggleResponse,
  favoritesResponseSchema,
  favoriteToggleResponseSchema,
} from "@/api/contracts"
import { http, parseResponse } from "@/api/http"

const path = (nftId: string) => `/me/favorites/${encodeURIComponent(nftId)}`

export const favoritesApi = {
  list: async (signal?: AbortSignal): Promise<FavoritesResponse> =>
    parseResponse(favoritesResponseSchema, (await http.get("/me/favorites", { signal })).data),

  add: async (nftId: string): Promise<FavoriteToggleResponse> =>
    parseResponse(favoriteToggleResponseSchema, (await http.put(path(nftId))).data),

  remove: async (nftId: string): Promise<FavoriteToggleResponse> =>
    parseResponse(favoriteToggleResponseSchema, (await http.delete(path(nftId))).data),
}
