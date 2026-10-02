import { type CreateQuoteRequest, type Quote, quoteSchema } from "@/api/contracts"
import { http, parseResponse } from "@/api/http"

export const quotesApi = {
  create: async (body: CreateQuoteRequest): Promise<Quote> =>
    parseResponse(quoteSchema, (await http.post("/quotes", body)).data),
}
