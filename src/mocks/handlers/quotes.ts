import { HttpResponse, http } from "msw"
import { createQuoteRequestSchema } from "@/api/contracts"
import { createQuote, toQuoteResponse } from "@/mocks/domain/quotes"
import { requireAuth } from "@/mocks/lib/auth"
import { api, parseBody, route } from "@/mocks/lib/http"

export const quoteHandlers = [
  http.post(
    api("/quotes"),
    route(async ({ request }) => {
      const { user } = requireAuth(request)
      const { network } = await parseBody(request, createQuoteRequestSchema)
      return HttpResponse.json(toQuoteResponse(createQuote(user.id, network)), { status: 201 })
    }),
  ),
]
