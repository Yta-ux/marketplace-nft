import { cn } from "@/lib/utils"

export type OrderItemData = {
  id: string
  name: string
  detail: string
  image: { url: string; alt: string }
  quantity: number
  total: string
}

type OrderItemProps = {
  item: OrderItemData
  variant: "summary" | "receipt"
}

export function OrderItem({ item, variant }: OrderItemProps) {
  const summary = variant === "summary"
  return (
    <li
      className={cn(
        "flex min-h-[70px] w-full flex-wrap items-center gap-y-2 bg-surface sm:h-[70px] sm:flex-nowrap",
        summary ? "gap-2 pr-4 pl-1" : "justify-between",
      )}
    >
      <div className={cn("flex items-center", summary ? "gap-2" : "gap-3")}>
        <img
          src={item.image.url}
          alt={item.image.alt}
          width={70}
          height={70}
          className="size-[70px] shrink-0 rounded-lg object-cover"
        />
        <div className="flex w-[154px] flex-col gap-1.5 leading-4">
          <p className="font-bold text-body-lg text-foreground">{item.name}</p>
          <p className="text-body-sm text-subtle">{item.detail}</p>
        </div>
      </div>
      <p
        className={cn(
          "flex items-center whitespace-nowrap text-right leading-4",
          summary ? "ml-auto gap-5" : "gap-4 sm:w-[194px] sm:gap-12",
        )}
      >
        <span className="text-body-sm text-text-secondary">
          <span className="sr-only">Quantidade: </span>(x {item.quantity})
        </span>
        <span className="font-bold text-title-sm text-highlight">
          <span className="sr-only">Subtotal: </span>
          {item.total}
        </span>
      </p>
    </li>
  )
}
