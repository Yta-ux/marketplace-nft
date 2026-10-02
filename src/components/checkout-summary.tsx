import { Link } from "@tanstack/react-router"
import type { CartSummaryData } from "@/components/cart-summary"
import { CircleMark } from "@/components/circle-mark"
import { OrderItem, type OrderItemData } from "@/components/order-item"
import { Hairline, SummaryRow, TotalRow } from "@/components/summary-rows"
import { Button } from "@/components/ui/button"
import type { ConfirmState, WalletChoice } from "@/lib/checkout-types"
import { cn } from "@/lib/utils"

type CheckoutSummaryProps = {
  items: OrderItemData[]
  totals: CartSummaryData
  wallets: WalletChoice[]
  walletId: string | null
  onWalletChange: (id: string) => void
  walletError?: string
  confirm: ConfirmState
  onConfirm: () => void
}

export function CheckoutSummary({
  items,
  totals,
  wallets,
  walletId,
  onWalletChange,
  walletError,
  confirm,
  onConfirm,
}: CheckoutSummaryProps) {
  return (
    <aside
      aria-labelledby="checkout-items-heading"
      className="flex w-full flex-col gap-3 xl:w-[405px]"
    >
      <h2 id="checkout-items-heading" className="font-bold text-label leading-4 text-foreground">
        Seus NFTs
      </h2>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3">
          <div
            aria-hidden="true"
            className="flex items-center justify-between text-body-lg leading-4 whitespace-nowrap text-foreground"
          >
            <span className="font-bold">NFTs</span>
            <span className="font-medium">Subtotal</span>
          </div>
          <Hairline />
        </div>
        <ul className="flex flex-col gap-3">
          {items.map((item) => (
            <OrderItem key={item.id} item={item} variant="summary" />
          ))}
        </ul>
        <div className="flex flex-col items-center gap-3">
          <dl className="flex w-full flex-col items-center gap-3">
            <SummaryRow label="Subtotal" value={totals.subtotal} />
            <SummaryRow label="Desconto" value={totals.discount} valueSize="md" />
            <SummaryRow label="Taxa de rede" value={totals.networkFee} />
          </dl>
          <p className="text-center text-caption leading-4 text-highlight">Taxa estimada</p>
          <Hairline />
          <dl className="w-full xl:w-[321px]">
            <TotalRow value={totals.total} />
          </dl>
        </div>
        <div className="flex flex-col gap-5">
          <h3 className="text-center font-bold text-label leading-4 text-foreground">
            Carteira e rede
          </h3>
          <div className="flex flex-col gap-6">
            {wallets.length === 0 ? (
              <p className="text-center text-body-sm leading-6 text-text-secondary">
                Você ainda não tem carteiras.{" "}
                <Link to="/wallets" className="text-highlight hover:underline">
                  Adicionar carteira
                </Link>
              </p>
            ) : (
              <fieldset className="m-0 flex min-w-0 flex-col gap-4 border-0 p-0">
                <legend className="sr-only">Carteira e rede</legend>
                {wallets.map((wallet) => {
                  const selected = walletId === wallet.id
                  return (
                    <label
                      key={wallet.id}
                      className={cn(
                        "flex h-[45px] w-full cursor-pointer items-center rounded-[3px] border text-left has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-highlight",
                        selected ? "gap-3 border-primary pl-4" : "gap-2.5 border-border pl-3",
                      )}
                    >
                      <input
                        type="radio"
                        name="wallet"
                        value={wallet.id}
                        checked={selected}
                        onChange={() => onWalletChange(wallet.id)}
                        aria-label={wallet.label}
                        className="sr-only"
                      />
                      <span className={cn("flex shrink-0", selected && "w-[39px]")}>
                        <CircleMark checked={selected} />
                      </span>
                      <span className="min-w-0 truncate text-body leading-[normal] text-foreground">
                        {wallet.label}
                        <span className="text-body-sm text-subtle"> · {wallet.providerLabel}</span>
                      </span>
                    </label>
                  )
                })}
              </fieldset>
            )}
            {walletError && (
              <p role="alert" className="text-caption leading-4 text-danger">
                {walletError}
              </p>
            )}
            <Button
              variant="brand"
              size="checkout"
              onClick={onConfirm}
              disabled={confirm.disabled || confirm.pending}
              aria-busy={confirm.pending || undefined}
            >
              {confirm.label}
            </Button>
          </div>
        </div>
      </div>
    </aside>
  )
}
