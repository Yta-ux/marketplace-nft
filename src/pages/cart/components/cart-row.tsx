import type { CartItem } from "@/api/contracts"
import { Icon } from "@/components/icon"
import { QuantityStepper } from "@/components/quantity-stepper"

type CartItemStatus = CartItem["status"]

export type CartRowData = {
  id: string
  name: string
  editionLabel: string
  status: CartItemStatus
  maxQuantity: number
  image: { url: string; alt: string }
  unitPrice: string
  quantity: number
  total: string
}

type CartRowProps = {
  item: CartRowData
  onQuantityChange: (quantity: number) => void
  onRemove: () => void
}

const statusLabels: Record<CartItemStatus, string | null> = {
  ok: null,
  "insufficient-stock": "Estoque insuficiente",
  "sold-out": "Esgotado",
}

export function cartStatusLabel(status: CartItemStatus): string | null {
  return statusLabels[status] ?? null
}

export function CartRow({ item, onQuantityChange, onRemove }: CartRowProps) {
  return (
    <li className="flex min-h-[70px] w-full flex-wrap items-center justify-between gap-y-3 bg-surface pr-6 xl:h-[70px] xl:flex-nowrap">
      <div className="flex h-[70px] w-[250px] items-center gap-4">
        <img
          src={item.image.url}
          alt={item.image.alt}
          width={70}
          height={70}
          className="size-[70px] shrink-0 rounded-[6px] object-cover"
        />
        <div className="flex w-[154px] flex-col gap-1.5 leading-4">
          <p className="font-bold text-body-lg text-foreground">{item.name}</p>
          {cartStatusLabel(item.status) ? (
            <p role="alert" className="text-body-sm text-danger">
              {cartStatusLabel(item.status)}
            </p>
          ) : (
            <p className="text-body-sm text-subtle">Edição: {item.editionLabel}</p>
          )}
        </div>
      </div>
      <p className="w-[77px] font-bold text-body-lg leading-4 whitespace-nowrap text-text-secondary">
        <span className="sr-only">Preço: </span>
        {item.unitPrice}
      </p>
      <QuantityStepper
        size="sm"
        value={item.quantity}
        onChange={onQuantityChange}
        max={item.maxQuantity}
        label={`Quantidade de ${item.name}`}
        className="w-[75px] justify-center"
      />
      <p className="w-[87px] font-bold text-body-lg leading-4 whitespace-nowrap text-highlight">
        <span className="sr-only">Total: </span>
        {item.total}
      </p>
      <button
        type="button"
        aria-label={`Remover ${item.name} do carrinho`}
        onClick={onRemove}
        className="rounded-xs"
      >
        <Icon name="delete" />
      </button>
    </li>
  )
}
