import type { Cart, CartItem, OrderLine } from "@/api/contracts"
import { eth } from "@/lib/eth"
import { commit, type DbCart, type DbUser, getDb, nextId } from "@/mocks/db"
import { findEdition, findNft } from "@/mocks/domain/catalog"
import { DEFAULT_NETWORK, summarize } from "@/mocks/domain/pricing"
import { guestCartId, optionalAuth } from "@/mocks/lib/auth"
import { HttpError, nowIso } from "@/mocks/lib/http"

export const userCartKey = (userId: string) => `user:${userId}`
const guestCartKey = (guestId: string) => `guest:${guestId}`

export function cartKeyFor(request: Request): { key: string; user: DbUser | null } {
  const auth = optionalAuth(request)
  if (auth) return { key: userCartKey(auth.user.id), user: auth.user }
  const guestId = guestCartId(request)
  if (!guestId) throw new HttpError("VALIDATION_ERROR", "Missing guest cart id")
  return { key: guestCartKey(guestId), user: null }
}

export function getOrCreateCart(key: string): DbCart {
  const existing = getDb().carts[key]
  if (existing) return existing
  return commit((db) => {
    const cart: DbCart = {
      id: nextId("cart", "cart"),
      items: [],
      couponCode: null,
      version: 0,
      updatedAt: nowIso(),
    }
    db.carts[key] = cart
    return cart
  })
}

export function mutateCart(key: string, mutator: (cart: DbCart) => void): DbCart {
  getOrCreateCart(key)
  return commit((db) => {
    const cart = db.carts[key] as DbCart
    mutator(cart)
    cart.version += 1
    cart.updatedAt = nowIso()
    return cart
  })
}

export function effectiveLimit(available: number, maxPerOrder: number) {
  return Math.min(available, maxPerOrder)
}

export function assertQuantityAllowed(nftId: string, editionId: string, quantity: number): void {
  const nft = findNft(nftId)
  const edition = findEdition(nft, editionId)
  if (edition.available === 0) {
    throw new HttpError(
      "AVAILABILITY_CONFLICT",
      `${edition.label} edition of ${nft.name} is sold out`,
      {
        details: { nftId, editionId, available: 0, maxPerOrder: edition.maxPerOrder },
      },
    )
  }
  const limit = effectiveLimit(edition.available, edition.maxPerOrder)
  if (quantity > limit) {
    throw new HttpError("AVAILABILITY_CONFLICT", `You can buy at most ${limit} of this edition`, {
      fields: { quantity: `Maximum is ${limit}` },
      details: { nftId, editionId, available: edition.available, maxPerOrder: edition.maxPerOrder },
    })
  }
}

export function toCartResponse(cart: DbCart): Cart {
  const items: CartItem[] = cart.items.flatMap((item) => {
    const nft = getDb().nfts.find((n) => n.id === item.nftId)
    const edition = nft?.editions.find((e) => e.id === item.editionId)
    const [image] = nft?.gallery ?? []
    if (!nft || !edition || !image) return []
    const limit = effectiveLimit(edition.available, edition.maxPerOrder)
    return [
      {
        id: item.id,
        nftId: nft.id,
        editionId: edition.id,
        name: nft.name,
        editionLabel: edition.label,
        image,
        unitPrice: edition.price,
        quantity: item.quantity,
        lineTotal: eth.mul(edition.price, item.quantity),
        available: edition.available,
        maxPerOrder: edition.maxPerOrder,
        status:
          edition.available === 0
            ? "sold-out"
            : item.quantity > limit
              ? "insufficient-stock"
              : "ok",
        nftVersion: nft.version,
      },
    ]
  })

  const priced = items.filter((i) => i.status === "ok").map((i) => i.lineTotal)
  const { coupon, ...summary } = summarize(priced, cart.couponCode, DEFAULT_NETWORK)
  return {
    id: cart.id,
    items,
    coupon,
    summary,
    itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
    version: cart.version,
    updatedAt: cart.updatedAt,
  }
}

export function mergeGuestCart(userId: string, guestId: string): DbCart {
  const guest = getDb().carts[guestCartKey(guestId)]
  const key = userCartKey(userId)
  if (!guest || guest.items.length === 0) return getOrCreateCart(key)
  const merged = mutateCart(key, (cart) => {
    for (const line of guest.items) {
      const nft = getDb().nfts.find((n) => n.id === line.nftId)
      const edition = nft?.editions.find((e) => e.id === line.editionId)
      if (!edition) continue
      const existing = cart.items.find(
        (i) => i.nftId === line.nftId && i.editionId === line.editionId,
      )
      const limit = Math.max(1, effectiveLimit(edition.available, edition.maxPerOrder))
      if (existing) existing.quantity = Math.min(existing.quantity + line.quantity, limit)
      else
        cart.items.push({
          id: nextId("cartItem", "item"),
          nftId: line.nftId,
          editionId: line.editionId,
          quantity: Math.min(line.quantity, limit),
        })
    }
    cart.couponCode ??= guest.couponCode
  })
  commit((db) => {
    delete db.carts[guestCartKey(guestId)]
  })
  return merged
}

export function removePurchased(userId: string, lines: OrderLine[]): void {
  const key = userCartKey(userId)
  if (!getDb().carts[key]) return
  mutateCart(key, (cart) => {
    for (const line of lines) {
      const item = cart.items.find((i) => i.nftId === line.nftId && i.editionId === line.editionId)
      if (!item) continue
      item.quantity -= line.quantity
    }
    cart.items = cart.items.filter((i) => i.quantity > 0)
    if (cart.items.length === 0) cart.couponCode = null
  })
}
