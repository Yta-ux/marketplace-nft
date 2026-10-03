import { Link, useNavigate, useParams } from "@tanstack/react-router"
import { useState } from "react"
import { CheckoutSkeleton } from "@/components/checkout-skeleton"
import { CheckoutView } from "@/components/checkout-view"
import { Button } from "@/components/ui/button"
import { useOrder } from "@/pages/orders/api"
import { OrderConfirmationModal } from "@/pages/orders/components/order-confirmation-modal"
import { orderItems, orderTotals, orderWalletChoice, toReceipt } from "@/pages/orders/receipt"

const noop = () => undefined

export function OrderConfirmationPage() {
  const { orderId } = useParams({ from: "/_authenticated/orders/$orderId" })
  const navigate = useNavigate()
  const order = useOrder(orderId)
  const [open, setOpen] = useState(true)

  function onOpenChange(next: boolean) {
    setOpen(next)
    if (!next) void navigate({ to: "/" })
  }

  if (order.isError) {
    return (
      <div
        role="alert"
        className="mt-8 flex min-h-[300px] flex-col items-start justify-center gap-4 bg-surface p-8"
      >
        <p className="font-bold text-title-sm text-foreground">
          Não foi possível carregar este pedido.
        </p>
        <div className="flex items-center gap-6">
          <Button type="button" variant="brand" size="compact" onClick={() => void order.refetch()}>
            Tentar novamente
          </Button>
          <Link to="/" className="text-body leading-[normal] text-highlight hover:underline">
            Voltar ao início
          </Link>
        </div>
      </div>
    )
  }

  const data = order.data

  function primaryAction() {
    if (!data) return
    if (data.status === "confirmed" && data.transaction) {
      window.open(data.transaction.explorerUrl, "_blank", "noopener,noreferrer")
      return
    }
    if (data.status === "declined") void navigate({ to: "/checkout" })
  }

  return (
    <>
      {data ? (
        <CheckoutView
          items={orderItems(data)}
          totals={orderTotals(data)}
          wallets={[orderWalletChoice(data)]}
          walletId={data.wallet.id}
          onWalletChange={noop}
          network={data.network}
          onNetworkChange={noop}
          values={data.collector}
          onValuesChange={noop}
          errors={{}}
          confirm={{ pending: false, disabled: true, label: "Pedido enviado" }}
          onConfirm={noop}
          readOnly
        />
      ) : (
        <CheckoutSkeleton />
      )}
      <OrderConfirmationModal
        open={open}
        onOpenChange={onOpenChange}
        data={data ? toReceipt(data) : undefined}
        onPrimaryAction={primaryAction}
      />
    </>
  )
}
