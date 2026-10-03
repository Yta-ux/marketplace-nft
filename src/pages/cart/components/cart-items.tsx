import { Hairline } from "@/components/summary-rows"
import { CartRow, type CartRowData } from "@/pages/cart/components/cart-row"

type CartItemsProps = {
  items: CartRowData[]
  onQuantityChange: (id: string, quantity: number) => void
  onRemove: (id: string) => void
}

export function CartItems({ items, onQuantityChange, onRemove }: CartItemsProps) {
  return (
    <section
      aria-labelledby="cart-items-heading"
      className="flex w-full flex-col gap-3 xl:w-[782px]"
    >
      <h2 id="cart-items-heading" className="sr-only">
        Itens do carrinho
      </h2>
      <div className="flex flex-col gap-3">
        <div
          aria-hidden="true"
          className="hidden items-center justify-between pr-6 text-body-lg leading-4 text-foreground xl:flex"
        >
          <span className="w-[250px] font-bold">NFTs</span>
          <span className="w-[77px] font-medium">Preço</span>
          <span className="w-[75px] font-bold">Edições</span>
          <span className="w-[87px] font-medium">Total</span>
          <span className="h-4 w-6" />
        </div>
        <Hairline className="hidden xl:block" />
      </div>
      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <CartRow
            key={item.id}
            item={item}
            onQuantityChange={(quantity) => onQuantityChange(item.id, quantity)}
            onRemove={() => onRemove(item.id)}
          />
        ))}
      </ul>
    </section>
  )
}
