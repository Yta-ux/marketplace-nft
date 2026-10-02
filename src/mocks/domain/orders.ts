import type { CreateOrderRequest, Order } from "@/api/contracts"
import { commit, type DbOrder, getDb, nextId } from "@/mocks/db"
import { removePurchased } from "@/mocks/domain/cart"
import { updateEdition } from "@/mocks/domain/catalog"
import { publishNftUpdated, publishOrderUpdated } from "@/mocks/domain/events"
import { diffQuote, priceCart } from "@/mocks/domain/quotes"
import { txHashFor } from "@/mocks/lib/crypto"
import { HttpError, nowIso } from "@/mocks/lib/http"
import { scenario } from "@/mocks/scenarios"

const EXPLORER = "https://explorer.nft-market.mock/tx"

export function toOrderResponse(order: DbOrder): Order {
  const { userId: _u, plannedOutcome: _p, settleAt: _s, ...rest } = order
  return rest
}

export function requestHash(body: CreateOrderRequest): string {
  return JSON.stringify([
    body.quoteId,
    body.walletId,
    body.network,
    body.collector.fullName,
    body.collector.email,
  ])
}

export function findOrderForUser(orderId: string, userId: string): DbOrder {
  const order = getDb().orders[orderId]
  if (!order) throw new HttpError("NOT_FOUND", "Order not found")
  if (order.userId !== userId)
    throw new HttpError("FORBIDDEN", "This order belongs to another account")
  return order
}

export function createOrder(userId: string, body: CreateOrderRequest): DbOrder {
  const db = getDb()
  const quote = db.quotes[body.quoteId]
  if (!quote || quote.userId !== userId) throw new HttpError("NOT_FOUND", "Quote not found")
  if (quote.network !== body.network) {
    throw new HttpError("VALIDATION_ERROR", "Quote was issued for another network", {
      fields: { network: "Request a new quote for this network" },
    })
  }
  if (new Date(quote.expiresAt).getTime() <= Date.now())
    throw new HttpError("QUOTE_EXPIRED", "Your quote has expired. Review the updated values.")

  const fresh = priceCart(userId, body.network)
  const changes = diffQuote(quote, fresh)
  if (changes.length > 0) {
    throw new HttpError(
      "QUOTE_OUTDATED",
      "Prices or availability changed. Review your order again.",
      { details: { changes } },
    )
  }

  const wallet = db.wallets.find((w) => w.id === body.walletId && w.userId === userId)
  if (!wallet)
    throw new HttpError("VALIDATION_ERROR", "Select one of your wallets", {
      fields: { walletId: "Wallet not found" },
    })
  if (!wallet.networks.includes(body.network)) {
    throw new HttpError("VALIDATION_ERROR", "This wallet does not support the selected network", {
      fields: { network: "Unsupported by wallet" },
    })
  }
  if (wallet.connection?.network !== body.network) {
    throw new HttpError("WALLET_NOT_CONNECTED", "Connect your wallet on the selected network first")
  }

  const config = scenario.config
  const createdAt = nowIso()
  const order: DbOrder = {
    id: nextId("order", "ord", 6),
    userId,
    status: "pending",
    lines: quote.lines.map((l) => ({ ...l })),
    couponCode: quote.couponStatus === "applied" ? quote.couponCode : null,
    subtotal: quote.subtotal,
    discount: quote.discount,
    networkFee: quote.networkFee,
    total: quote.total,
    network: quote.network,
    wallet: {
      id: wallet.id,
      label: wallet.label,
      address: wallet.address,
      provider: wallet.provider,
    },
    collector: body.collector,
    quoteId: quote.id,
    transaction: null,
    failureReason: null,
    plannedOutcome: config.paymentOutcome,
    settleAt:
      config.settleDelayMs === null
        ? null
        : new Date(Date.now() + config.settleDelayMs).toISOString(),
    createdAt,
    updatedAt: createdAt,
    version: 1,
  }
  commit((draft) => {
    draft.orders[order.id] = order
  })

  for (const line of order.lines)
    publishNftUpdated(updateEdition(line.nftId, line.editionId, { availableDelta: -line.quantity }))
  scheduleSettlement(order)
  return order
}

const timers = new Map<string, ReturnType<typeof setTimeout>>()

function scheduleSettlement(order: DbOrder): void {
  if (order.status !== "pending" || order.settleAt === null || timers.has(order.id)) return
  const wait = Math.max(0, new Date(order.settleAt).getTime() - Date.now())
  timers.set(
    order.id,
    setTimeout(() => void settleOrder(order.id), wait),
  )
}

export async function settleOrder(
  orderId: string,
  outcome?: "confirmed" | "declined",
): Promise<DbOrder> {
  timers.delete(orderId)
  const current = getDb().orders[orderId]
  if (!current) throw new HttpError("NOT_FOUND", "Order not found")
  if (current.status !== "pending") return current

  const finalOutcome = outcome ?? current.plannedOutcome
  const hash = finalOutcome === "confirmed" ? await txHashFor(orderId) : null
  const settled = commit((db) => {
    const order = db.orders[orderId] as DbOrder
    order.status = finalOutcome
    order.transaction = hash ? { hash, explorerUrl: `${EXPLORER}/${hash}` } : null
    order.failureReason =
      finalOutcome === "declined" ? "Payment was declined by the wallet provider" : null
    order.updatedAt = nowIso()
    order.version += 1
    return order
  })

  if (settled.status === "confirmed") {
    removePurchased(settled.userId, settled.lines)
  } else {
    for (const line of settled.lines)
      publishNftUpdated(
        updateEdition(line.nftId, line.editionId, { availableDelta: line.quantity }),
      )
  }
  publishOrderUpdated(settled)
  return settled
}

export function resumePendingSettlements(): void {
  for (const order of Object.values(getDb().orders)) scheduleSettlement(order)
}

export function clearSettlementTimers(): void {
  for (const timer of timers.values()) clearTimeout(timer)
  timers.clear()
}
