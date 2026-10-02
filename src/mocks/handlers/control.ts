import { HttpResponse, http } from "msw"
import { z } from "zod"
import { ethAmountSchema, realtimeEventSchema } from "@/api/contracts"
import { commit, getDb, resetDb } from "@/mocks/db"
import { updateEdition } from "@/mocks/domain/catalog"
import { publishNftUpdated } from "@/mocks/domain/events"
import { clearSettlementTimers, settleOrder, toOrderResponse } from "@/mocks/domain/orders"
import { api, parseBody, route } from "@/mocks/lib/http"
import { isScenario, scenario, scenarioNames, scenarios, setScenario } from "@/mocks/scenarios"
import {
  disconnectAll,
  emitRaw,
  replay,
  resetSocketState,
  restore,
  socketStatus,
} from "@/mocks/socket"

const scenarioBody = z.object({ name: z.string().refine(isScenario, "Unknown scenario") })
const editionPatch = z
  .object({ price: ethAmountSchema.optional(), available: z.number().int().min(0).optional() })
  .refine((v) => v.price !== undefined || v.available !== undefined, "Provide price or available")

export const controlHandlers = [
  http.post(
    api("/__mocks/reset"),
    route(async ({ request }) => {
      const body = await request.json().catch(() => ({}))
      const parsed = z.object({ scenario: z.string().optional() }).safeParse(body)
      clearSettlementTimers()
      resetDb()
      resetSocketState()
      const name =
        parsed.success && isScenario(parsed.data.scenario) ? parsed.data.scenario : "default"
      setScenario(name)
      return HttpResponse.json({ scenario: name })
    }),
  ),

  http.get(api("/__mocks/scenario"), () =>
    HttpResponse.json({
      active: scenario.name,
      available: scenarioNames.map((name) => ({ name, description: scenarios[name].description })),
    }),
  ),

  http.put(
    api("/__mocks/scenario"),
    route(async ({ request }) => {
      const { name } = await parseBody(request, scenarioBody)
      if (isScenario(name)) setScenario(name)
      return HttpResponse.json({ active: scenario.name })
    }),
  ),

  http.patch<{ nftId: string; editionId: string }>(
    api("/__mocks/nfts/:nftId/editions/:editionId"),
    route(async ({ request, params }) => {
      const patch = await parseBody(request, editionPatch)
      const nft = updateEdition(params.nftId, params.editionId, patch)
      return HttpResponse.json({ event: publishNftUpdated(nft) })
    }),
  ),

  http.post<{ orderId: string }>(
    api("/__mocks/orders/:orderId/settle"),
    route(async ({ request, params }) => {
      const body = await request.json().catch(() => ({}))
      const outcome = z
        .object({ outcome: z.enum(["confirmed", "declined"]).optional() })
        .safeParse(body)
      const order = await settleOrder(
        params.orderId,
        outcome.success ? outcome.data.outcome : undefined,
      )
      return HttpResponse.json(toOrderResponse(order))
    }),
  ),

  http.post(
    api("/__mocks/session/expire"),
    route(() => {
      const expired = commit((db) => {
        const past = new Date(Date.now() - 1000).toISOString()
        for (const session of db.sessions) session.expiresAt = past
        return db.sessions.length
      })
      return HttpResponse.json({ expired })
    }),
  ),

  http.get(api("/__mocks/socket"), () => HttpResponse.json(socketStatus())),

  http.post(
    api("/__mocks/socket/disconnect"),
    route(async ({ request }) => {
      const body = await request.json().catch(() => ({}))
      const parsed = z.object({ downForMs: z.number().int().min(0).optional() }).safeParse(body)
      return HttpResponse.json({
        closed: disconnectAll(parsed.success ? parsed.data.downForMs : undefined),
      })
    }),
  ),

  http.post(api("/__mocks/socket/restore"), () => {
    restore()
    return HttpResponse.json(socketStatus())
  }),

  http.post(
    api("/__mocks/socket/replay"),
    route(async ({ request }) => {
      const body = await parseBody(
        request,
        z.object({
          count: z.number().int().min(1).max(50).default(1),
          userId: z.string().optional(),
        }),
      )
      return HttpResponse.json({ replayed: replay(body.count, body.userId) })
    }),
  ),

  http.post(
    api("/__mocks/socket/emit"),
    route(async ({ request }) => {
      const body = await parseBody(
        request,
        z.object({ event: realtimeEventSchema, userId: z.string().optional() }),
      )
      emitRaw(body.event, body.userId)
      return HttpResponse.json({ emitted: body.event.id })
    }),
  ),

  http.get(api("/__mocks/db"), () => HttpResponse.json(getDb())),
]
