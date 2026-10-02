import type { AppliedCoupon as AppliedCouponData } from "@/api/contracts"
import { cn } from "@/lib/utils"

const statusText: Record<AppliedCouponData["status"], string | null> = {
  applied: null,
  expired: "Este cupom expirou e não está sendo aplicado.",
  "not-applicable": "Este cupom não se aplica aos itens do carrinho.",
}

type AppliedCouponProps = {
  coupon: AppliedCouponData
  onRemove: () => void
  pending?: boolean
  className?: string
}

export function AppliedCoupon({ coupon, onRemove, pending, className }: AppliedCouponProps) {
  const warning = statusText[coupon.status]
  return (
    <div className={cn("flex w-full flex-col gap-1 text-caption leading-4", className)}>
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 text-foreground">
          Cupom <span className="font-bold text-highlight">{coupon.code}</span>
          {coupon.status === "applied" && ` — ${coupon.description}`}
        </p>
        <button
          type="button"
          disabled={pending}
          onClick={onRemove}
          className="shrink-0 rounded-xs font-bold text-highlight hover:underline disabled:opacity-50"
        >
          Remover
        </button>
      </div>
      {warning && (
        <p role="alert" className="text-danger">
          {warning}
        </p>
      )}
    </div>
  )
}
