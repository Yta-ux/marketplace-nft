import { delay, HttpResponse, http } from "msw"
import { createOrderRequestSchema, IDEMPOTENCY_HEADER, orderStatusSchema } from "@/api/contracts"
import { commit, getDb } from "@/mocks/db"
import { createOrder, findOrderForUser, requestHash, toOrderResponse } from "@/mocks/domain/orders"
import { requireAuth } from "@/mocks/lib/auth"
import { api, HttpError, parseBody, route } from "@/mocks/lib/http"
import { scenario } from "@/mocks/scenarios"

export const orderHandlers = [
  http.post(
    api("/orders"),
    route(async ({ request }) => {
      const { user } = requireAuth(request)
      const key = request.headers.get(IDEMPOTENCY_HEADER)
      if (!key) throw new HttpError("VALIDATION_ERROR", `Missing ${IDEMPOTENCY_HEADER} header`)
      const body = await parseBody(request, createOrderRequestSchema)
      const hash = requestHash(body)
      const recordKey = `${user.id}:${key}`

      const previous = getDb().idempotency[recordKey]
      if (previous) {
        if (previous.requestHash !== hash) {
          throw new HttpError(
            "IDEMPOTENCY_CONFLICT",
            "This idempotency key was already used for a different order",
          )
        }
        return HttpResponse.json(toOrderResponse(findOrderForUser(previous.orderId, user.id)), {
          status: 200,
        })
      }

      const order = createOrder(user.id, body)
      commit((db) => {
        db.idempotency[recordKey] = { orderId: order.id, requestHash: hash }
      })

      if (scenario.config.orderTimeout && scenario.claimOrderTimeout(recordKey)) {
        await delay("infinite")
      }
      return HttpResponse.json(toOrderResponse(order), { status: 201 })
    }),
  ),

  http.get(
    api("/orders"),
    route(({ request }) => {
      const { user } = requireAuth(request)
      const status = orderStatusSchema.safeParse(new URL(request.url).searchParams.get("status"))
      const items = Object.values(getDb().orders)
        .filter((o) => o.userId === user.id && (!status.success || o.status === status.data))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map(toOrderResponse)
      return HttpResponse.json({ items })
    }),
  ),

  http.get<{ orderId: string }>(
    api("/orders/:orderId"),
    route(({ request, params }) => {
      const { user } = requireAuth(request)
      return HttpResponse.json(toOrderResponse(findOrderForUser(params.orderId, user.id)))
    }),
  ),
]
