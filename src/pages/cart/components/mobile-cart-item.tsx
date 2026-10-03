import { Icon } from "@/components/icon"
import { type CartRowData, cartStatusLabel } from "@/pages/cart/components/cart-row"

type MobileCartItemProps = {
  item: CartRowData
  onQuantityChange: (quantity: number) => void
  onRemove: () => void
}

export function MobileCartItem({ item, onQuantityChange, onRemove }: MobileCartItemProps) {
  const atMinimum = item.quantity <= 1
  return (
    <li className="relative flex h-[100px] w-full rounded-[14px] bg-surface shadow-[0px_6px_20px_rgba(10,6,4,0.45)]">
      <img
        src={item.image.url}
        alt={item.image.alt}
        width={100}
        height={100}
        className="size-[100px] shrink-0 rounded-l-[14px] object-cover"
      />
      <div className="flex min-w-0 flex-1 flex-col justify-between pt-[13px] pr-[42px] pb-[15px] pl-[9px]">
        <div className="flex flex-col gap-1.5">
          <p className="truncate font-bold text-body leading-4 text-foreground">{item.name}</p>
          {cartStatusLabel(item.status) ? (
            <p
              role="alert"
              className="max-w-[calc(100%-72px)] truncate text-body-sm leading-4 text-danger"
            >
              {cartStatusLabel(item.status)}
            </p>
          ) : (
            <p className="max-w-[calc(100%-72px)] truncate text-body-sm leading-4 text-text-secondary">
              Edição: {item.editionLabel}
            </p>
          )}
        </div>
        <p className="font-bold text-title-sm leading-4 whitespace-nowrap text-highlight">
          <span className="sr-only">Total: </span>
          {item.total}
        </p>
      </div>
      <fieldset className="absolute top-[38px] right-4 m-0 flex min-w-0 items-center gap-3 border-0 p-0">
        <legend className="sr-only">Quantidade de {item.name}</legend>
        <button
          type="button"
          aria-label="Diminuir quantidade"
          disabled={atMinimum}
          onClick={() => onQuantityChange(item.quantity - 1)}
          className="flex rounded-full"
        >
          <Icon name={atMinimum ? "stepper-minus-circle-disabled" : "stepper-minus-circle"} />
        </button>
        <output aria-live="polite" className="text-body-lg leading-[22px] text-foreground">
          {item.quantity}
        </output>
        <button
          type="button"
          aria-label="Aumentar quantidade"
          disabled={item.quantity >= item.maxQuantity}
          onClick={() => onQuantityChange(item.quantity + 1)}
          className="flex size-6 items-center justify-center rounded-[31px] border border-border bg-surface-raised pb-0.5 disabled:opacity-50 text-[21px] leading-4 text-foreground"
        >
          +
        </button>
      </fieldset>
      <button
        type="button"
        aria-label={`Remover ${item.name} do carrinho`}
        onClick={onRemove}
        className="absolute top-2 right-2 flex rounded-xs"
      >
        <Icon name="delete-primary" />
      </button>
    </li>
  )
}
