import {
  type AddCartItemRequest,
  type ApplyCouponRequest,
  type Cart,
  cartSchema,
  type MergeCartRequest,
  type UpdateCartItemRequest,
} from "@/api/contracts"
import { http, parseResponse } from "@/api/http"

const item = (itemId: string) => `/cart/items/${encodeURIComponent(itemId)}`

export const cartApi = {
  get: async (signal?: AbortSignal): Promise<Cart> =>
    parseResponse(cartSchema, (await http.get("/cart", { signal })).data),

  addItem: async (body: AddCartItemRequest): Promise<Cart> =>
    parseResponse(cartSchema, (await http.post("/cart/items", body)).data),

  updateItem: async (itemId: string, body: UpdateCartItemRequest): Promise<Cart> =>
    parseResponse(cartSchema, (await http.patch(item(itemId), body)).data),

  removeItem: async (itemId: string): Promise<Cart> =>
    parseResponse(cartSchema, (await http.delete(item(itemId))).data),

  applyCoupon: async (body: ApplyCouponRequest): Promise<Cart> =>
    parseResponse(cartSchema, (await http.post("/cart/coupon", body)).data),

  removeCoupon: async (): Promise<Cart> =>
    parseResponse(cartSchema, (await http.delete("/cart/coupon")).data),

  merge: async (body: MergeCartRequest): Promise<Cart> =>
    parseResponse(cartSchema, (await http.post("/cart/merge", body)).data),
}
