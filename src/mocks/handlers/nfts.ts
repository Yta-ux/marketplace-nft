import { HttpResponse, http } from "msw"
import { nftListQueryFromParams } from "@/api/contracts"
import { featuredNfts, findNft, listNfts, toDetail } from "@/mocks/domain/catalog"
import { reviewsFor, summarize } from "@/mocks/fixtures/reviews"
import { api, route } from "@/mocks/lib/http"

export const nftHandlers = [
  http.get(
    api("/nfts/featured"),
    route(() => HttpResponse.json({ items: featuredNfts() })),
  ),

  http.get(
    api("/nfts"),
    route(({ request }) => {
      const query = nftListQueryFromParams(new URL(request.url).searchParams)
      return HttpResponse.json(listNfts(query))
    }),
  ),

  http.get<{ nftId: string }>(
    api("/nfts/:nftId/reviews"),
    route(({ params }) => {
      const nft = findNft(params.nftId)
      const items = reviewsFor(nft.id)
      return HttpResponse.json({ items: items.slice(0, 20), summary: summarize(items) })
    }),
  ),

  http.get<{ nftId: string }>(
    api("/nfts/:nftId"),
    route(({ params }) => HttpResponse.json(toDetail(findNft(params.nftId)))),
  ),
]
