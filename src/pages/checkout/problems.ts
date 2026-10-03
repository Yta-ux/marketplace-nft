import { type QuoteChange, quoteOutdatedDetailsSchema } from "@/api/contracts"
import { ApiError } from "@/api/errors"
import { apiErrorMessage } from "@/lib/api-message"
import { formatEth } from "@/lib/format"

export type CheckoutProblem = { message: string; changes: string[] }

function describeChange(change: QuoteChange): string {
  switch (change.field) {
    case "price":
      return `${change.name}: preço de ${formatEth(change.previous ?? "0")} para ${formatEth(change.current ?? "0")}.`
    case "available":
      return `${change.name}: quantidade de ${change.previous ?? 0} para ${change.current ?? 0}.`
    case "removed":
      return `${change.name}: item removido do carrinho.`
    case "coupon":
      return "O desconto do cupom foi alterado."
    case "networkFee":
      return `Taxa de rede de ${formatEth(change.previous ?? "0")} para ${formatEth(change.current ?? "0")}.`
  }
}

const QUOTE_CODES = new Set(["QUOTE_OUTDATED", "QUOTE_EXPIRED", "AVAILABILITY_CONFLICT"])

export function toCheckoutProblem(error: unknown): CheckoutProblem | null {
  if (!(error instanceof ApiError) || !QUOTE_CODES.has(error.code)) return null
  const parsed = quoteOutdatedDetailsSchema.safeParse(error.details)
  return {
    message: apiErrorMessage(error, "Revise o pedido."),
    changes: parsed.success ? parsed.data.changes.map(describeChange) : [],
  }
}
