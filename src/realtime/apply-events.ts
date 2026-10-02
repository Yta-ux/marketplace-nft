import type { QueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import type {
  Cart,
  FeaturedNftsResponse,
  NftDetail,
  NftListResponse,
  NftUpdatedEvent,
  Order,
  OrderUpdatedEvent,
} from "@/api/contracts"
import { formatEth } from "@/lib/format"
import { cartKeys } from "@/queries/cart"
import { nftKeys } from "@/queries/catalog"
import { orderKeys } from "@/queries/checkout"
import { type CartChange, cartChanges } from "@/realtime/cart-changes"

function applyToSummary<
  T extends { id: string; version: number; priceFrom: string; totalAvailable: number },
>(item: T, event: NftUpdatedEvent): T {
  if (item.id !== event.data.nftId || item.version >= event.version) return item
  return {
    ...item,
    version: event.version,
    priceFrom: event.data.priceFrom,
    totalAvailable: event.data.totalAvailable,
  }
}

function detectCartChanges(cart: Cart, event: NftUpdatedEvent): CartChange[] {
  const found: CartChange[] = []
  for (const item of cart.items) {
    if (item.nftId !== event.data.nftId) continue
    const edition = event.data.editions.find((candidate) => candidate.id === item.editionId)
    if (!edition) continue
    const base = { nftId: item.nftId, name: item.name }
    if (edition.price !== item.unitPrice) {
      found.push({
        ...base,
        key: `${item.nftId}:${item.editionId}:price`,
        field: "price",
        previous: item.unitPrice,
        current: edition.price,
      })
    }
    if (edition.available !== item.available && edition.available < item.quantity) {
      found.push({
        ...base,
        key: `${item.nftId}:${item.editionId}:available`,
        field: "available",
        previous: String(item.available),
        current: String(edition.available),
      })
    }
  }
  return found
}

export function describeCartChange(change: CartChange): string {
  if (change.field === "price") {
    return `${change.name}: preço de ${formatEth(change.previous)} para ${formatEth(change.current)}.`
  }
  return `${change.name}: disponibilidade de ${change.previous} para ${change.current}.`
}

export function applyNftUpdated(queryClient: QueryClient, event: NftUpdatedEvent): void {
  const { nftId, editions } = event.data

  queryClient.setQueryData<NftDetail>(nftKeys.detail(nftId), (current) => {
    if (!current || current.version >= event.version) return current
    return {
      ...applyToSummary(current, event),
      editions: current.editions.map((edition) => {
        const update = editions.find((candidate) => candidate.id === edition.id)
        return update ? { ...edition, price: update.price, available: update.available } : edition
      }),
    }
  })

  queryClient.setQueriesData<NftListResponse>({ queryKey: [...nftKeys.all, "list"] }, (current) =>
    current
      ? { ...current, items: current.items.map((item) => applyToSummary(item, event)) }
      : current,
  )

  queryClient.setQueryData<FeaturedNftsResponse>(nftKeys.featured(), (current) =>
    current
      ? { ...current, items: current.items.map((item) => applyToSummary(item, event)) }
      : current,
  )

  const cart = queryClient.getQueryData<Cart>(cartKeys.all)
  if (!cart) return
  const detected = detectCartChanges(cart, event)
  if (detected.length === 0) return
  cartChanges.record(detected)
  for (const change of detected) toast.info(describeCartChange(change))
  void queryClient.invalidateQueries({ queryKey: cartKeys.all })
}

export function settleOrderQueries(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({ queryKey: cartKeys.all })
  void queryClient.invalidateQueries({ queryKey: orderKeys.all })
  void queryClient.invalidateQueries({ queryKey: nftKeys.all })
}

export function applyOrderUpdated(queryClient: QueryClient, event: OrderUpdatedEvent): void {
  const { orderId, status, transaction, failureReason, updatedAt } = event.data
  queryClient.setQueryData<Order>(orderKeys.detail(orderId), (current) =>
    current && current.version < event.version
      ? { ...current, status, transaction, failureReason, updatedAt, version: event.version }
      : current,
  )
  if (status !== "pending") {
    cartChanges.clear()
    settleOrderQueries(queryClient)
  }
}

export function reconcileActiveQueries(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({ queryKey: nftKeys.all })
  void queryClient.invalidateQueries({ queryKey: cartKeys.all })
  void queryClient.invalidateQueries({ queryKey: orderKeys.all })
}
