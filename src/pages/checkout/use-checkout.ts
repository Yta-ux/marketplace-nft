import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import type { Network, Quote, Wallet } from "@/api/contracts"
import { ApiError } from "@/api/errors"
import type { CartSummaryData } from "@/components/cart-summary"
import type { OrderItemData } from "@/components/order-item"
import { providerLabels } from "@/lib/account-labels"
import { apiErrorMessage, translateFieldErrors } from "@/lib/api-message"
import type {
  CollectorErrors,
  CollectorValues,
  ConfirmState,
  WalletChoice,
} from "@/lib/checkout-types"
import { formatEth } from "@/lib/format"
import { type CheckoutProblem, toCheckoutProblem } from "@/pages/checkout/problems"
import { collectorFormSchema } from "@/pages/checkout/schemas"
import { profileQueryOptions, walletsQueryOptions } from "@/queries/account"
import { cartKeys, cartQueryOptions } from "@/queries/cart"
import { quoteQueryOptions, usePlaceOrder } from "@/queries/checkout"
import { describeCartChange } from "@/realtime/apply-events"
import { cartChanges, useCartChanges } from "@/realtime/cart-changes"

const MAX_TIMEOUT_MS = 2 ** 31 - 1

export function toWalletChoice(wallet: Wallet): WalletChoice {
  return {
    id: wallet.id,
    label: wallet.label,
    address: wallet.address,
    providerLabel: providerLabels[wallet.provider],
    networks: wallet.networks,
    connectedNetwork: wallet.connection?.network ?? null,
  }
}

export function quoteItems(quote: Quote): OrderItemData[] {
  return quote.lines.map((line) => ({
    id: `${line.nftId}:${line.editionId}`,
    name: line.name,
    detail: `Edição ${line.editionLabel}`,
    image: { url: line.imageUrl, alt: `Arte do NFT ${line.name}` },
    quantity: line.quantity,
    total: formatEth(line.lineTotal),
  }))
}

export function quoteTotals(quote: Quote): CartSummaryData {
  return {
    subtotal: formatEth(quote.subtotal),
    discount: `(-) ${formatEth(quote.discount)}`,
    networkFee: formatEth(quote.networkFee),
    total: formatEth(quote.total),
  }
}

function useExpired(expiresAt: string | undefined): boolean {
  const [expired, setExpired] = useState(false)
  useEffect(() => {
    setExpired(false)
    if (!expiresAt) return
    const remaining = Date.parse(expiresAt) - Date.now()
    if (remaining <= 0) {
      setExpired(true)
      return
    }
    const timer = setTimeout(() => setExpired(true), Math.min(remaining, MAX_TIMEOUT_MS))
    return () => clearTimeout(timer)
  }, [expiresAt])
  return expired
}

export function useCheckout() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const cart = useQuery(cartQueryOptions())
  const walletsQuery = useQuery(walletsQueryOptions())
  const profile = useQuery(profileQueryOptions())
  const [network, setNetwork] = useState<Network>("ethereum")
  const [overrides, setOverrides] = useState<Partial<CollectorValues>>({})
  const [walletOverride, setWalletOverride] = useState<string | null>(null)
  const [errors, setErrors] = useState<CollectorErrors>({})
  const [problem, setProblem] = useState<CheckoutProblem | null>(null)

  const hasItems = (cart.data?.items.length ?? 0) > 0
  const quote = useQuery(quoteQueryOptions(network, hasItems))
  const expired = useExpired(quote.data?.expiresAt)
  const placeOrder = usePlaceOrder()
  const liveChanges = useCartChanges()

  const wallets = walletsQuery.data?.items ?? []
  const selected =
    wallets.find((wallet) => wallet.id === walletOverride) ??
    wallets.find((wallet) => wallet.networks.includes(network)) ??
    wallets[0] ??
    null

  const values: CollectorValues = {
    fullName: overrides.fullName ?? profile.data?.displayName ?? "",
    email: overrides.email ?? profile.data?.email ?? "",
  }

  const quoteProblem = toCheckoutProblem(quote.error)
  const liveProblem: CheckoutProblem | null =
    liveChanges.length > 0
      ? {
          message: "Os valores do seu pedido mudaram. Atualize para continuar.",
          changes: liveChanges.map(describeCartChange),
        }
      : null
  const activeProblem = problem ?? quoteProblem ?? liveProblem

  const status = (() => {
    if (cart.isPending || walletsQuery.isPending) return "loading" as const
    if (cart.isError || walletsQuery.isError) return "error" as const
    if (!hasItems) return "empty" as const
    if (quote.isPending) return "loading" as const
    if (quote.isError && !quoteProblem) return "error" as const
    return "ready" as const
  })()

  function refresh() {
    cartChanges.clear()
    setProblem(null)
    setErrors({})
    void queryClient.invalidateQueries({ queryKey: cartKeys.all })
    void quote.refetch()
  }

  function retry() {
    void cart.refetch()
    void walletsQuery.refetch()
    if (hasItems) void quote.refetch()
  }

  function changeValues(patch: Partial<CollectorValues>) {
    setOverrides((current) => ({ ...current, ...patch }))
    setErrors((current) => ({
      ...current,
      ...Object.fromEntries(Object.keys(patch).map((key) => [key, undefined])),
    }))
  }

  function changeNetwork(next: Network) {
    setNetwork(next)
    setProblem(null)
    setErrors((current) => ({ ...current, network: undefined }))
  }

  function changeWallet(id: string) {
    setWalletOverride(id)
    setErrors((current) => ({ ...current, walletId: undefined }))
  }

  function handleError(error: unknown) {
    const quoteIssue = toCheckoutProblem(error)
    if (quoteIssue) {
      setProblem(quoteIssue)
      void queryClient.invalidateQueries({ queryKey: cartKeys.all })
      return
    }
    if (error instanceof ApiError && error.code === "TIMEOUT") {
      toast.error(
        "O pedido demorou para responder. Confirme novamente: não haverá cobrança duplicada.",
      )
      return
    }
    if (error instanceof ApiError && error.fields) {
      const fields = translateFieldErrors(error.fields)
      setErrors({ network: fields.network, walletId: fields.walletId })
      if (fields.network || fields.walletId) return
    }
    toast.error(apiErrorMessage(error, "Não foi possível concluir a compra."))
  }

  function confirm() {
    const parsed = collectorFormSchema.safeParse(values)
    const next: CollectorErrors = {}
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof CollectorValues
        next[key] ??= issue.message
      }
    }
    if (!selected) next.walletId = "Adicione uma carteira para continuar."
    else if (!selected.networks.includes(network)) {
      next.walletId = "Esta carteira não suporta a rede escolhida."
    }
    setErrors(next)
    if (!parsed.success || Object.keys(next).length > 0) return
    if (liveChanges.length > 0 || quote.isFetching) return
    const current = quote.data
    const wallet = walletsQuery.data?.items.find((item) => item.id === selected?.id)
    if (!current || !wallet) return
    if (expired) {
      setProblem({
        message: "Sua cotação expirou. Atualize os valores para continuar.",
        changes: [],
      })
      return
    }
    placeOrder.mutate(
      { quote: current, wallet, network, collector: parsed.data },
      {
        onSuccess: (order) =>
          void navigate({ to: "/orders/$orderId", params: { orderId: order.id } }),
        onError: handleError,
      },
    )
  }

  const confirmState: ConfirmState = {
    pending: placeOrder.isPending,
    disabled: status !== "ready" || !quote.data || quote.isFetching || liveChanges.length > 0,
    label: placeOrder.isPending ? "Confirmando…" : "Confirmar compra",
  }

  return {
    status,
    quote: quote.data ?? null,
    items: quote.data ? quoteItems(quote.data) : [],
    totals: quote.data ? quoteTotals(quote.data) : null,
    wallets: wallets.map(toWalletChoice),
    walletId: selected?.id ?? null,
    network,
    values,
    errors,
    problem: activeProblem,
    refreshing: quote.isFetching,
    confirmState,
    changeValues,
    changeNetwork,
    changeWallet,
    confirm,
    refresh,
    retry,
  }
}
