import type { NftUpdatedEvent, OrderUpdatedEvent } from "@/api/contracts"
import { type DbNft, type DbOrder, nextId } from "@/mocks/db"
import { priceFrom, totalAvailable } from "@/mocks/domain/catalog"
import { nowIso } from "@/mocks/lib/http"
import { broadcast, emitToUser } from "@/mocks/socket"

export function publishNftUpdated(nft: DbNft): NftUpdatedEvent {
  const event: NftUpdatedEvent = {
    id: nextId("event", "evt", 6),
    type: "nft.updated",
    resource: { type: "nft", id: nft.id },
    version: nft.version,
    occurredAt: nowIso(),
    data: {
      nftId: nft.id,
      priceFrom: priceFrom(nft),
      totalAvailable: totalAvailable(nft),
      editions: nft.editions.map((e) => ({ id: e.id, price: e.price, available: e.available })),
    },
  }
  broadcast(event)
  return event
}

export function publishOrderUpdated(order: DbOrder): OrderUpdatedEvent {
  const event: OrderUpdatedEvent = {
    id: nextId("event", "evt", 6),
    type: "order.updated",
    resource: { type: "order", id: order.id },
    version: order.version,
    occurredAt: nowIso(),
    data: {
      orderId: order.id,
      status: order.status,
      transaction: order.transaction,
      failureReason: order.failureReason,
      updatedAt: order.updatedAt,
    },
  }
  emitToUser(order.userId, event)
  return event
}
