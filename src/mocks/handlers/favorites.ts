import { HttpResponse, http } from "msw"
import type { FavoriteToggleResponse } from "@/api/contracts"
import { commit, getDb } from "@/mocks/db"
import { findNft } from "@/mocks/domain/catalog"
import { requireAuth } from "@/mocks/lib/auth"
import { api, HttpError, route } from "@/mocks/lib/http"
import { scenario } from "@/mocks/scenarios"

function toggle(request: Request, nftId: string, favorited: boolean): FavoriteToggleResponse {
  const { user } = requireAuth(request)
  if (scenario.config.favoritesFail)
    throw new HttpError("TRANSIENT", "Could not update favorites right now")
  findNft(nftId)
  return commit((db) => {
    const list = db.favorites[user.id] ?? []
    const has = list.includes(nftId)
    const nft = db.nfts.find((n) => n.id === nftId)
    if (!nft) throw new HttpError("NOT_FOUND", "NFT not found")

    if (favorited && !has) {
      db.favorites[user.id] = [...list, nftId]
      nft.favoritesCount += 1
    } else if (!favorited && has) {
      db.favorites[user.id] = list.filter((id) => id !== nftId)
      nft.favoritesCount = Math.max(0, nft.favoritesCount - 1)
    }
    return { nftId, favorited, favoritesCount: nft.favoritesCount }
  })
}

export const favoriteHandlers = [
  http.get(
    api("/me/favorites"),
    route(({ request }) => {
      const { user } = requireAuth(request)
      return HttpResponse.json({ nftIds: getDb().favorites[user.id] ?? [] })
    }),
  ),
  http.put<{ nftId: string }>(
    api("/me/favorites/:nftId"),
    route(({ request, params }) => HttpResponse.json(toggle(request, params.nftId, true))),
  ),
  http.delete<{ nftId: string }>(
    api("/me/favorites/:nftId"),
    route(({ request, params }) => HttpResponse.json(toggle(request, params.nftId, false))),
  ),
]
