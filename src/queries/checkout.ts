import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRef } from "react"
import type { Collector, Network, Quote, Wallet } from "@/api/contracts"
import { ordersApi, quotesApi, walletsApi } from "@/api/endpoints"
import { ApiError } from "@/api/errors"
import { walletKeys } from "@/queries/account"
import { cartKeys } from "@/queries/cart"

export const quoteKeys = { all: ["quote"] as const }
export const orderKeys = {
  all: ["orders"] as const,
  detail: (id: string) => ["orders", id] as const,
}

export const quoteQueryOptions = (network: Network, enabled: boolean) =>
  queryOptions({
    queryKey: [...quoteKeys.all, network],
    queryFn: () => quotesApi.create({ network }),
    enabled,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

export type PlaceOrderInput = {
  quote: Quote
  wallet: Wallet
  network: Network
  collector: Collector
}

export function usePlaceOrder() {
  const queryClient = useQueryClient()
  const attempt = useRef<{ signature: string; key: string } | null>(null)

  return useMutation({
    mutationFn: async ({ quote, wallet, network, collector }: PlaceOrderInput) => {
      const signature = JSON.stringify([
        quote.id,
        wallet.id,
        network,
        collector.fullName,
        collector.email,
      ])
      if (attempt.current?.signature !== signature) {
        attempt.current = { signature, key: crypto.randomUUID() }
      }
      if (wallet.connection?.network !== network) {
        await walletsApi.connect(wallet.id, { network })
      }
      return ordersApi.create(
        { quoteId: quote.id, walletId: wallet.id, network, collector },
        attempt.current.key,
      )
    },
    onSuccess: (order) => {
      attempt.current = null
      queryClient.setQueryData(orderKeys.detail(order.id), order)
      void queryClient.invalidateQueries({ queryKey: cartKeys.all })
      void queryClient.invalidateQueries({ queryKey: orderKeys.all })
      void queryClient.invalidateQueries({ queryKey: walletKeys.all })
    },
    onError: (error) => {
      if (error instanceof ApiError && error.code === "IDEMPOTENCY_CONFLICT") attempt.current = null
    },
  })
}
