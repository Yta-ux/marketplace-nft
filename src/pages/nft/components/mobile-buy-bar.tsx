import { Icon } from "@/components/icon"
import { QuantityStepper } from "@/components/quantity-stepper"
import { Button } from "@/components/ui/button"

type MobileBuyBarProps = {
  price: string
  quantity: number
  onQuantityChange: (quantity: number) => void
  maxQuantity?: number
  onBuy: () => void
  onAddToCart: () => void
  disabled?: boolean
}

export function MobileBuyBar({
  price,
  quantity,
  onQuantityChange,
  maxQuantity,
  onBuy,
  onAddToCart,
  disabled,
}: MobileBuyBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 flex flex-col gap-5 rounded-t-[40px] bg-surface px-6 pt-5 pb-9 drop-shadow-[0px_0px_10px_rgba(10,6,4,0.45)] lg:hidden">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="font-medium text-body leading-4 text-text-secondary">
            Qtd.
          </span>
          <QuantityStepper
            size="sm"
            label="Quantidade"
            value={quantity}
            onChange={onQuantityChange}
            max={maxQuantity}
            valueClassName="font-medium text-[18px] leading-[25px]"
          />
        </div>
        <p className="font-bold text-[20px] leading-4 whitespace-nowrap text-highlight">{price}</p>
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant="pill"
          size="pill"
          className="w-[196px] px-12"
          onClick={onBuy}
          disabled={disabled}
        >
          Comprar NFT
        </Button>
        <button
          type="button"
          aria-label="Adicionar ao carrinho"
          onClick={onAddToCart}
          disabled={disabled}
          className="flex size-[60px] items-center justify-center rounded-[40px] border border-border bg-surface-raised transition-colors hover:border-primary disabled:opacity-50"
        >
          <Icon name="shop" />
        </button>
      </div>
    </div>
  )
}
