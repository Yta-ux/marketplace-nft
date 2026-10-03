import { Link } from "@tanstack/react-router"
import { AppliedCoupon } from "@/components/applied-coupon"
import type { CartSummaryData } from "@/components/cart-summary"
import { PromoCodeField } from "@/components/promo-code-field"
import { SummaryRow, TotalRow } from "@/components/summary-rows"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type MobileCartSummaryProps = {
  data: CartSummaryData
  onApplyCoupon: (code: string) => void
  onRemoveCoupon: () => void
  couponPending?: boolean
  canCheckout: boolean
  className?: string
}

export function MobileCartSummary({
  data,
  onApplyCoupon,
  onRemoveCoupon,
  couponPending,
  canCheckout,
  className,
}: MobileCartSummaryProps) {
  return (
    <aside
      aria-label="Resumo da carteira"
      className={cn(
        "flex flex-col items-center justify-between gap-6 rounded-t-[40px] bg-surface px-6 pt-6 pb-9",
        className,
      )}
    >
      <div className="flex w-full flex-col gap-3">
        <PromoCodeField variant="pill" onApply={onApplyCoupon} />
        {data.coupon && (
          <AppliedCoupon coupon={data.coupon} onRemove={onRemoveCoupon} pending={couponPending} />
        )}
        <dl className="flex flex-col gap-3">
          <SummaryRow label="Subtotal" value={data.subtotal} valueSize="sm" />
          <SummaryRow label="Desconto do lançamento" value={data.discount} valueSize="md" />
          <div className="flex flex-col items-end">
            <SummaryRow label="Taxa de rede" value={data.networkFee} valueSize="sm" />
            <p className="text-caption leading-4 text-highlight">Taxa estimada</p>
          </div>
          <TotalRow value={data.total} />
        </dl>
      </div>
      {canCheckout ? (
        <Button asChild variant="pill" size="pill">
          <Link to="/checkout">Conectar e finalizar</Link>
        </Button>
      ) : (
        <div className="flex w-full flex-col items-center gap-2">
          <Button variant="pill" size="pill" disabled>
            Conectar e finalizar
          </Button>
          <p role="alert" className="text-center text-caption leading-4 text-danger">
            Remova ou ajuste os itens indisponíveis para continuar.
          </p>
        </div>
      )}
    </aside>
  )
}
