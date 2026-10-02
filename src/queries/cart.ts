import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import type { AddCartItemRequest, Cart } from "@/api/contracts"
import { cartApi } from "@/api/endpoints"
import { ApiError } from "@/api/errors"

export const cartKeys = {
  all: ["cart"] as const,
}

export const cartQueryOptions = () =>
  queryOptions({
    queryKey: cartKeys.all,
    queryFn: ({ signal }) => cartApi.get(signal),
  })

function addToCartMessage(error: unknown): string {
  if (error instanceof ApiError && error.code === "AVAILABILITY_CONFLICT") {
    return "Quantidade indisponível para este NFT."
  }
  if (error instanceof ApiError && error.code === "NETWORK") {
    return "Sem conexão. Tente novamente."
  }
  return "Não foi possível adicionar ao carrinho."
}

export function useAddToCart() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: AddCartItemRequest) => cartApi.addItem(input),
    onSuccess: (cart, input) => {
      queryClient.setQueryData(cartKeys.all, cart)
      const added = cart.items.find((item) => item.nftId === input.nftId)
      toast.success(`${added?.name ?? "NFT"} adicionado ao carrinho.`)
    },
    onError: (error) => toast.error(addToCartMessage(error)),
  })
}

function cartMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    if (error.code === "AVAILABILITY_CONFLICT") return "Quantidade indisponível para este NFT."
    if (error.code === "COUPON_INVALID") return "Cupom inválido."
    if (error.code === "COUPON_EXPIRED") return "Este cupom expirou."
    if (error.code === "VALIDATION_ERROR") return "Verifique o código informado."
    if (error.code === "NOT_FOUND") return "Este item não está mais no carrinho."
    if (error.code === "NETWORK") return "Sem conexão. Tente novamente."
  }
  return fallback
}

function useCartMutation<TInput>(
  mutationFn: (input: TInput) => Promise<Cart>,
  fallback: string,
  success?: string,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: (cart) => {
      queryClient.setQueryData(cartKeys.all, cart)
      if (success) toast.success(success)
    },
    onError: (error) => {
      toast.error(cartMessage(error, fallback))
      if (error instanceof ApiError && error.code === "NOT_FOUND") {
        void queryClient.invalidateQueries({ queryKey: cartKeys.all })
      }
    },
  })
}

export function useUpdateCartItem() {
  return useCartMutation(
    ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      cartApi.updateItem(itemId, { quantity }),
    "Não foi possível atualizar a quantidade.",
  )
}

export function useRemoveCartItem() {
  return useCartMutation(
    (itemId: string) => cartApi.removeItem(itemId),
    "Não foi possível remover o item.",
    "Item removido do carrinho.",
  )
}

export function useApplyCoupon() {
  return useCartMutation(
    (code: string) => cartApi.applyCoupon({ code }),
    "Não foi possível aplicar o cupom.",
    "Cupom aplicado.",
  )
}

export function useRemoveCoupon() {
  return useCartMutation(
    () => cartApi.removeCoupon(),
    "Não foi possível remover o cupom.",
    "Cupom removido.",
  )
}
