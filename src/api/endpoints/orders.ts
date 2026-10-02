import {
  type CreateOrderRequest,
  IDEMPOTENCY_HEADER,
  type Order,
  type OrderStatus,
  type OrdersResponse,
  orderSchema,
  ordersResponseSchema,
} from "@/api/contracts"
import { http, parseResponse } from "@/api/http"

export const ORDER_REQUEST_TIMEOUT_MS = 8_000

export const ordersApi = {
  create: async (body: CreateOrderRequest, idempotencyKey: string): Promise<Order> =>
    parseResponse(
      orderSchema,
      (
        await http.post("/orders", body, {
          headers: { [IDEMPOTENCY_HEADER]: idempotencyKey },
          timeout: ORDER_REQUEST_TIMEOUT_MS,
        })
      ).data,
    ),

  get: async (orderId: string, signal?: AbortSignal): Promise<Order> =>
    parseResponse(
      orderSchema,
      (await http.get(`/orders/${encodeURIComponent(orderId)}`, { signal })).data,
    ),

  list: async (status?: OrderStatus, signal?: AbortSignal): Promise<OrdersResponse> =>
    parseResponse(
      ordersResponseSchema,
      (await http.get("/orders", { params: status ? { status } : undefined, signal })).data,
    ),
}
