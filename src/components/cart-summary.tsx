import { Link } from "@tanstack/react-router"
import type { AppliedCoupon as AppliedCouponData } from "@/api/contracts"
import { AppliedCoupon } from "@/components/applied-coupon"
import { PromoCodeField } from "@/components/promo-code-field"
import { SectionHeading } from "@/components/section-heading"
import { SummaryRow, TotalRow } from "@/components/summary-rows"
import { Button } from "@/components/ui/button"

export type CartSummaryData = {
  subtotal: string
  discount: string
  networkFee: string
  total: string
  coupon?: AppliedCouponData | null
}

type CartSummaryProps = {
  data: CartSummaryData
  onApplyCoupon: (code: string) => void
  onRemoveCoupon: () => void
  couponPending?: boolean
  canCheckout: boolean
}

export function CartSummary({
  data,
  onApplyCoupon,
  onRemoveCoupon,
  couponPending,
  canCheckout,
}: CartSummaryProps) {
  return (
    <aside
      aria-labelledby="cart-summary-heading"
      className="flex w-full flex-col gap-6 xl:w-[332px]"
    >
      <SectionHeading id="cart-summary-heading" tone="foreground">
        Resumo da carteira
      </SectionHeading>
      <div className="flex flex-col gap-3">
        <PromoCodeField onApply={onApplyCoupon} />
        {data.coupon && (
          <AppliedCoupon coupon={data.coupon} onRemove={onRemoveCoupon} pending={couponPending} />
        )}
      </div>
      <dl className="flex flex-col gap-3">
        <SummaryRow label="Subtotal" value={data.subtotal} />
        <SummaryRow label="Desconto do lançamento" value={data.discount} valueSize="md" />
        <div className="flex flex-col items-end gap-3">
          <SummaryRow label="Taxa de rede" value={data.networkFee} />
          <p className="text-caption leading-4 text-highlight">Taxa estimada</p>
        </div>
      </dl>
      <dl>
        <TotalRow value={data.total} />
      </dl>
      <div className="flex flex-col items-center gap-3">
        {canCheckout ? (
          <Button asChild variant="brand" size="form">
            <Link to="/checkout">Conectar e finalizar</Link>
          </Button>
        ) : (
          <>
            <Button variant="brand" size="form" disabled>
              Conectar e finalizar
            </Button>
            <p role="alert" className="text-caption leading-4 text-danger">
              Remova ou ajuste os itens indisponíveis para continuar.
            </p>
          </>
        )}
        <Link
          to="/"
          hash="catalogo"
          className="text-body leading-[normal] whitespace-nowrap text-highlight hover:underline"
        >
          Continuar explorando
        </Link>
      </div>
    </aside>
  )
}
