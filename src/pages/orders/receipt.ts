import type { Order } from "@/api/contracts"
import type { OrderItemData } from "@/components/order-item"
import { providerLabels } from "@/lib/account-labels"
import type { WalletChoice } from "@/lib/checkout-types"
import { formatEth } from "@/lib/format"
import type { OrderReceiptData } from "@/pages/orders/components/order-confirmation-modal"

const notes: Record<Order["status"], (order: Order) => string> = {
  pending: () =>
    "Sua transação foi enviada e está aguardando confirmação na rede. Esta tela atualiza sozinha.",
  confirmed: (order) =>
    `Transação confirmada na rede ${order.network}. A propriedade foi transferida para sua carteira conectada e registrada na rede.`,
  declined: (order) =>
    order.failureReason
      ? "O pagamento foi recusado pela carteira. Seus itens continuam no carrinho e nenhum valor foi cobrado."
      : "O pagamento foi recusado. Seus itens continuam no carrinho.",
}

export function orderItems(order: Order): OrderItemData[] {
  return order.lines.map((line) => ({
    id: `${line.nftId}:${line.editionId}`,
    name: line.name,
    detail: `Edição ${line.editionLabel}`,
    image: { url: line.imageUrl, alt: `Arte do NFT ${line.name}` },
    quantity: line.quantity,
    total: formatEth(line.lineTotal),
  }))
}

export function orderTotals(order: Order) {
  return {
    subtotal: formatEth(order.subtotal),
    discount: `(-) ${formatEth(order.discount)}`,
    networkFee: formatEth(order.networkFee),
    total: formatEth(order.total),
  }
}

export function orderWalletChoice(order: Order): WalletChoice {
  return {
    id: order.wallet.id,
    label: order.wallet.label,
    address: order.wallet.address,
    providerLabel: providerLabels[order.wallet.provider],
    networks: [order.network],
    connectedNetwork: order.network,
  }
}

function formatDate(iso: string): string {
  const parts = new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).formatToParts(new Date(iso))
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? ""
  const month = get("month").replace(".", "")
  return `${get("day")} ${month.charAt(0).toUpperCase()}${month.slice(1)}, ${get("year")}`
}

function shortHash(hash: string): string {
  return hash.length > 12 ? `${hash.slice(0, 6)}…${hash.slice(-4)}` : hash
}

export function toReceipt(order: Order): OrderReceiptData {
  return {
    status: order.status,
    transactionId: order.transaction ? shortHash(order.transaction.hash) : "Aguardando",
    date: formatDate(order.createdAt),
    total: formatEth(order.total),
    wallet: providerLabels[order.wallet.provider],
    networkFee: formatEth(order.networkFee),
    items: orderItems(order),
    note: notes[order.status](order),
    explorerUrl: order.transaction?.explorerUrl ?? null,
  }
}
