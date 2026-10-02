import type { Network, Quote, QuoteChange, QuoteLine } from "@/api/contracts"
import { eth } from "@/lib/eth"
import { commit, type DbQuote, getDb, nextId } from "@/mocks/db"
import { effectiveLimit, getOrCreateCart, userCartKey } from "@/mocks/domain/cart"
import { findEdition, findNft, updateEdition } from "@/mocks/domain/catalog"
import { publishNftUpdated } from "@/mocks/domain/events"
import { summarize } from "@/mocks/domain/pricing"
import { HttpError, nowIso } from "@/mocks/lib/http"
import { scenario } from "@/mocks/scenarios"

export const QUOTE_TTL_MS = 5 * 60_000

type FreshQuote = Omit<DbQuote, "id" | "userId" | "createdAt" | "expiresAt">

export function priceCart(userId: string, network: Network): FreshQuote {
  const cart = getOrCreateCart(userCartKey(userId))
  if (cart.items.length === 0) throw new HttpError("VALIDATION_ERROR", "Your cart is empty")

  const conflicts: QuoteChange[] = []
  const lines: QuoteLine[] = cart.items.map((item) => {
    const nft = findNft(item.nftId)
    const edition = findEdition(nft, item.editionId)
    const limit = effectiveLimit(edition.available, edition.maxPerOrder)
    if (item.quantity > limit) {
      conflicts.push({
        nftId: nft.id,
        editionId: edition.id,
        name: `${nft.name} — ${edition.label}`,
        field: "available",
        previous: String(item.quantity),
        current: String(edition.available),
      })
    }
    return {
      nftId: nft.id,
      editionId: edition.id,
      name: nft.name,
      editionLabel: edition.label,
      imageUrl: nft.gallery[0]?.url ?? "",
      unitPrice: edition.price,
      quantity: item.quantity,
      lineTotal: eth.mul(edition.price, item.quantity),
    }
  })
  if (conflicts.length > 0) {
    throw new HttpError(
      "AVAILABILITY_CONFLICT",
      "Some items are no longer available in the requested quantity",
      {
        details: { changes: conflicts },
      },
    )
  }

  const summary = summarize(
    lines.map((l) => l.lineTotal),
    cart.couponCode,
    network,
  )
  return {
    lines,
    couponCode: cart.couponCode,
    couponStatus: summary.coupon?.status ?? null,
    subtotal: summary.subtotal,
    discount: summary.discount,
    networkFee: summary.networkFee,
    total: summary.total,
    network,
    cartVersion: cart.version,
  }
}

export function createQuote(userId: string, network: Network): DbQuote {
  const fresh = priceCart(userId, network)
  const createdAt = nowIso()
  const quote: DbQuote = {
    ...fresh,
    id: nextId("quote", "quote"),
    userId,
    createdAt,
    expiresAt: new Date(Date.now() + QUOTE_TTL_MS).toISOString(),
  }
  commit((db) => {
    db.quotes[quote.id] = quote
  })
  scheduleCheckoutChange(quote)
  return quote
}

export function toQuoteResponse(quote: DbQuote): Quote {
  const { userId: _userId, couponCode, couponStatus, ...rest } = quote
  const coupon =
    couponCode && couponStatus
      ? {
          code: couponCode,
          description: getDb().coupons.find((c) => c.code === couponCode)?.description ?? "",
          status: couponStatus,
        }
      : null
  return { ...rest, coupon }
}

export function diffQuote(quote: DbQuote, fresh: FreshQuote): QuoteChange[] {
  const changes: QuoteChange[] = []
  for (const line of quote.lines) {
    const current = fresh.lines.find(
      (l) => l.nftId === line.nftId && l.editionId === line.editionId,
    )
    const name = `${line.name} — ${line.editionLabel}`
    if (!current) {
      changes.push({
        nftId: line.nftId,
        editionId: line.editionId,
        name,
        field: "removed",
        previous: String(line.quantity),
        current: null,
      })
    } else if (!eth.eq(current.unitPrice, line.unitPrice)) {
      changes.push({
        nftId: line.nftId,
        editionId: line.editionId,
        name,
        field: "price",
        previous: line.unitPrice,
        current: current.unitPrice,
      })
    } else if (current.quantity !== line.quantity) {
      changes.push({
        nftId: line.nftId,
        editionId: line.editionId,
        name,
        field: "available",
        previous: String(line.quantity),
        current: String(current.quantity),
      })
    }
  }
  for (const line of fresh.lines) {
    if (!quote.lines.some((l) => l.nftId === line.nftId && l.editionId === line.editionId)) {
      changes.push({
        nftId: line.nftId,
        editionId: line.editionId,
        name: `${line.name} — ${line.editionLabel}`,
        field: "available",
        previous: null,
        current: String(line.quantity),
      })
    }
  }
  if (
    quote.couponCode !== fresh.couponCode ||
    quote.couponStatus !== fresh.couponStatus ||
    !eth.eq(quote.discount, fresh.discount)
  ) {
    changes.push({
      nftId: "",
      editionId: "",
      name: "Coupon",
      field: "coupon",
      previous: quote.discount,
      current: fresh.discount,
    })
  }
  if (!eth.eq(quote.networkFee, fresh.networkFee)) {
    changes.push({
      nftId: "",
      editionId: "",
      name: "Network fee",
      field: "networkFee",
      previous: quote.networkFee,
      current: fresh.networkFee,
    })
  }
  return changes
}

function scheduleCheckoutChange(quote: DbQuote): void {
  const { checkoutChange, checkoutChangeDelayMs = 0 } = scenario.config
  const [line] = quote.lines
  if (!checkoutChange || !line || !scenario.claimCheckoutChange()) return
  setTimeout(() => {
    const nft =
      checkoutChange === "price"
        ? updateEdition(line.nftId, line.editionId, { price: eth.percentOf(line.unitPrice, 110) })
        : updateEdition(line.nftId, line.editionId, { available: 0 })
    publishNftUpdated(nft)
  }, checkoutChangeDelayMs)
}
