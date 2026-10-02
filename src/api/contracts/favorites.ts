import { z } from "zod"

export const favoritesResponseSchema = z.object({
  nftIds: z.array(z.string()),
})
export type FavoritesResponse = z.infer<typeof favoritesResponseSchema>

export const favoriteToggleResponseSchema = z.object({
  nftId: z.string(),
  favorited: z.boolean(),
  favoritesCount: z.number().int().min(0),
})
export type FavoriteToggleResponse = z.infer<typeof favoriteToggleResponseSchema>
