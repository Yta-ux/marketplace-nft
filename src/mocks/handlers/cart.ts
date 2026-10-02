import { HttpResponse, http } from "msw"
import {
  addCartItemRequestSchema,
  applyCouponRequestSchema,
  mergeCartRequestSchema,
  updateCartItemRequestSchema,
} from "@/api/contracts"
import { eth } from "@/lib/eth"
import { nextId } from "@/mocks/db"
import {
  assertQuantityAllowed,
  cartKeyFor,
  getOrCreateCart,
  mergeGuestCart,
  mutateCart,
  toCartResponse,
} from "@/mocks/domain/cart"
import { findEdition, findNft } from "@/mocks/domain/catalog"
import { assertCouponApplicable } from "@/mocks/domain/pricing"
import { requireAuth } from "@/mocks/lib/auth"
import { api, HttpError, parseBody, route } from "@/mocks/lib/http"

const json = (key: string) => HttpResponse.json(toCartResponse(getOrCreateCart(key)))

export const cartHandlers = [
  http.get(
    api("/cart"),
    route(({ request }) => json(cartKeyFor(request).key)),
  ),

  http.post(
    api("/cart/items"),
    route(async ({ request }) => {
      const { key } = cartKeyFor(request)
      const body = await parseBody(request, addCartItemRequestSchema)
      findEdition(findNft(body.nftId), body.editionId)
      const existing = getOrCreateCart(key).items.find(
        (i) => i.nftId === body.nftId && i.editionId === body.editionId,
      )
      assertQuantityAllowed(body.nftId, body.editionId, (existing?.quantity ?? 0) + body.quantity)
      const cart = mutateCart(key, (draft) => {
        const line = draft.items.find(
          (i) => i.nftId === body.nftId && i.editionId === body.editionId,
        )
        if (line) line.quantity += body.quantity
        else draft.items.push({ id: nextId("cartItem", "item"), ...body })
      })
      return HttpResponse.json(toCartResponse(cart), { status: existing ? 200 : 201 })
    }),
  ),

  http.patch<{ itemId: string }>(
    api("/cart/items/:itemId"),
    route(async ({ request, params }) => {
      const { key } = cartKeyFor(request)
      const body = await parseBody(request, updateCartItemRequestSchema)
      const item = getOrCreateCart(key).items.find((i) => i.id === params.itemId)
      if (!item) throw new HttpError("NOT_FOUND", "Cart item not found")
      assertQuantityAllowed(item.nftId, item.editionId, body.quantity)
      const cart = mutateCart(key, (draft) => {
        const line = draft.items.find((i) => i.id === params.itemId)
        if (line) line.quantity = body.quantity
      })
      return HttpResponse.json(toCartResponse(cart))
    }),
  ),

  http.delete<{ itemId: string }>(
    api("/cart/items/:itemId"),
    route(({ request, params }) => {
      const { key } = cartKeyFor(request)
      if (!getOrCreateCart(key).items.some((i) => i.id === params.itemId)) {
        throw new HttpError("NOT_FOUND", "Cart item not found")
      }
      const cart = mutateCart(key, (draft) => {
        draft.items = draft.items.filter((i) => i.id !== params.itemId)
        if (draft.items.length === 0) draft.couponCode = null
      })
      return HttpResponse.json(toCartResponse(cart))
    }),
  ),

  http.post(
    api("/cart/coupon"),
    route(async ({ request }) => {
      const { key } = cartKeyFor(request)
      const { code } = await parseBody(request, applyCouponRequestSchema)
      const current = toCartResponse(getOrCreateCart(key))
      if (current.items.length === 0)
        throw new HttpError("VALIDATION_ERROR", "Add items before applying a coupon", {
          fields: { code: "Cart is empty" },
        })
      assertCouponApplicable(
        code,
        eth.sum(current.items.filter((i) => i.status === "ok").map((i) => i.lineTotal)),
      )
      const cart = mutateCart(key, (draft) => {
        draft.couponCode = code
      })
      return HttpResponse.json(toCartResponse(cart))
    }),
  ),

  http.delete(
    api("/cart/coupon"),
    route(({ request }) => {
      const { key } = cartKeyFor(request)
      const cart = mutateCart(key, (draft) => {
        draft.couponCode = null
      })
      return HttpResponse.json(toCartResponse(cart))
    }),
  ),

  http.post(
    api("/cart/merge"),
    route(async ({ request }) => {
      const { user } = requireAuth(request)
      const { guestCartId } = await parseBody(request, mergeCartRequestSchema)
      return HttpResponse.json(toCartResponse(mergeGuestCart(user.id, guestCartId)))
    }),
  ),
]
