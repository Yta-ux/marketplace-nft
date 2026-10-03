import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { toast } from "sonner"
import type { Cart } from "@/api/contracts"
import { Breadcrumb } from "@/components/breadcrumb"
import { CartSummary, type CartSummaryData } from "@/components/cart-summary"
import { PageMessage } from "@/components/page-message"
import { RelatedNfts } from "@/components/related-nfts"
import { ScreenHeader } from "@/components/screen-header"
import { formatEth } from "@/lib/format"
import { CartItems } from "@/pages/cart/components/cart-items"
import type { CartRowData } from "@/pages/cart/components/cart-row"
import { CartSkeleton } from "@/pages/cart/components/cart-skeleton"
import { LiveChangesNotice } from "@/pages/cart/components/live-changes-notice"
import { MobileCartItem } from "@/pages/cart/components/mobile-cart-item"
import { MobileCartSummary } from "@/pages/cart/components/mobile-cart-summary"
import {
  cartQueryOptions,
  useApplyCoupon,
  useRemoveCartItem,
  useRemoveCoupon,
  useUpdateCartItem,
} from "@/queries/cart"
import { describeCartChange } from "@/realtime/apply-events"
import { cartChanges, useCartChanges } from "@/realtime/cart-changes"

function toRows(cart: Cart): CartRowData[] {
  return cart.items.map((item) => ({
    id: item.id,
    name: item.name,
    editionLabel: item.editionLabel,
    image: { url: item.image.url, alt: item.image.alt },
    unitPrice: formatEth(item.unitPrice),
    quantity: item.quantity,
    maxQuantity: Math.max(item.quantity, Math.min(item.available, item.maxPerOrder)),
    total: formatEth(item.lineTotal),
    status: item.status,
  }))
}

function toSummary(cart: Cart): CartSummaryData {
  return {
    subtotal: formatEth(cart.summary.subtotal),
    discount: `(-) ${formatEth(cart.summary.discount)}`,
    networkFee: formatEth(cart.summary.networkFee),
    total: formatEth(cart.summary.total),
    coupon: cart.coupon,
  }
}

function EmptyCart() {
  return (
    <div className="flex min-h-[300px] flex-col items-start justify-center gap-4 bg-surface p-8">
      <p className="font-bold text-title-sm text-foreground">Seu carrinho está vazio.</p>
      <Link
        to="/"
        hash="catalogo"
        className="text-body leading-[normal] text-highlight hover:underline"
      >
        Continuar explorando
      </Link>
    </div>
  )
}

export function CartPage() {
  const { data: cart, isPending, isError, refetch } = useQuery(cartQueryOptions())
  const updateItem = useUpdateCartItem()
  const removeItem = useRemoveCartItem()
  const applyCoupon = useApplyCoupon()
  const removeCoupon = useRemoveCoupon()
  const liveChanges = useCartChanges()

  if (isPending) return <CartSkeleton />

  if (isError || !cart) {
    return (
      <div className="flex flex-col gap-3 px-7 pt-8 lg:px-0">
        <PageMessage
          role="alert"
          title="Não foi possível carregar o carrinho."
          text="Verifique sua conexão e tente novamente."
          action={{ label: "Tentar novamente", onClick: () => void refetch() }}
        />
      </div>
    )
  }

  const rows = toRows(cart)
  const summary = toSummary(cart)
  const empty = cart.items.length === 0
  const canCheckout = !empty && cart.items.every((item) => item.status === "ok")
  const changeQuantity = (itemId: string, quantity: number) =>
    updateItem.mutate({ itemId, quantity })
  const remove = (itemId: string) => removeItem.mutate(itemId)
  const apply = (code: string) => {
    if (!code) {
      toast.error("Digite um código promocional.")
      return
    }
    applyCoupon.mutate(code)
  }
  const couponPending = applyCoupon.isPending || removeCoupon.isPending
  const notice =
    liveChanges.length > 0 ? (
      <LiveChangesNotice
        title="Os valores do seu carrinho mudaram."
        changes={liveChanges.map(describeCartChange)}
        onDismiss={() => cartChanges.clear()}
      />
    ) : null
  const exclude = cart.items.map((item) => item.nftId)

  return (
    <>
      <div className="flex min-h-dvh flex-col gap-1 bg-ink pt-8 lg:hidden">
        <div className="flex flex-col gap-3 px-7">
          <ScreenHeader title="Carrinho de NFTs" titleClassName="left-[96px]" />
          {notice}
          {empty ? (
            <EmptyCart />
          ) : (
            <ul className="flex flex-col gap-5">
              {rows.map((item) => (
                <MobileCartItem
                  key={item.id}
                  item={item}
                  onQuantityChange={(quantity) => changeQuantity(item.id, quantity)}
                  onRemove={() => remove(item.id)}
                />
              ))}
            </ul>
          )}
        </div>
        {!empty && (
          <MobileCartSummary
            data={summary}
            onApplyCoupon={apply}
            onRemoveCoupon={() => removeCoupon.mutate()}
            couponPending={couponPending}
            canCheckout={canCheckout}
            className="mt-3 flex-1"
          />
        )}
      </div>
      <div className="hidden flex-col gap-24 pt-8 lg:flex">
        <div className="flex flex-col gap-3">
          <Breadcrumb
            items={[
              { label: "Início", link: { to: "/" } },
              { label: "Mercado", link: { to: "/", hash: "catalogo" } },
              { label: "Carrinho" },
            ]}
          />
          {notice}
          {empty ? (
            <EmptyCart />
          ) : (
            <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
              <CartItems items={rows} onQuantityChange={changeQuantity} onRemove={remove} />
              <CartSummary
                data={summary}
                onApplyCoupon={apply}
                onRemoveCoupon={() => removeCoupon.mutate()}
                couponPending={couponPending}
                canCheckout={canCheckout}
              />
            </div>
          )}
        </div>
        <RelatedNfts title="Colecionadores também viram" variant="cart" exclude={exclude} />
      </div>
    </>
  )
}
