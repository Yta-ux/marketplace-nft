import type { ReactNode } from "react"
import type { Network } from "@/api/contracts"
import { Breadcrumb } from "@/components/breadcrumb"
import type { CartSummaryData } from "@/components/cart-summary"
import { CheckoutSummary } from "@/components/checkout-summary"
import { CollectorForm } from "@/components/collector-form"
import { MobileCheckout } from "@/components/mobile-checkout"
import type { OrderItemData } from "@/components/order-item"
import type {
  CollectorErrors,
  CollectorValues,
  ConfirmState,
  WalletChoice,
} from "@/lib/checkout-types"

export type CheckoutViewProps = {
  items: OrderItemData[]
  totals: CartSummaryData
  wallets: WalletChoice[]
  walletId: string | null
  onWalletChange: (id: string) => void
  network: Network
  onNetworkChange: (network: Network) => void
  values: CollectorValues
  onValuesChange: (patch: Partial<CollectorValues>) => void
  errors: CollectorErrors
  confirm: ConfirmState
  onConfirm: () => void
  notice?: ReactNode
  readOnly?: boolean
}

export function CheckoutView({
  items,
  totals,
  wallets,
  walletId,
  onWalletChange,
  network,
  onNetworkChange,
  values,
  onValuesChange,
  errors,
  confirm,
  onConfirm,
  notice,
  readOnly,
}: CheckoutViewProps) {
  return (
    <>
      <MobileCheckout
        total={totals.total}
        wallets={wallets}
        walletId={walletId}
        onWalletChange={onWalletChange}
        network={network}
        onNetworkChange={onNetworkChange}
        walletError={errors.walletId ?? errors.fullName ?? errors.email}
        confirm={confirm}
        onConfirm={onConfirm}
        readOnly={readOnly}
        notice={notice}
      />
      <div className="hidden flex-col gap-8 pt-8 lg:flex">
        <Breadcrumb
          items={[
            { label: "Início", link: { to: "/" } },
            { label: "Mercado", link: { to: "/", hash: "catalogo" } },
            { label: "Pagamento" },
          ]}
        />
        {notice}
        <div className="flex flex-col gap-8 xl:flex-row xl:items-start">
          <CollectorForm
            values={values}
            onValuesChange={onValuesChange}
            errors={errors}
            network={network}
            onNetworkChange={onNetworkChange}
            wallets={wallets}
            walletId={walletId}
            onWalletChange={onWalletChange}
            readOnly={readOnly}
          />
          <CheckoutSummary
            items={items}
            totals={totals}
            wallets={wallets}
            walletId={walletId}
            onWalletChange={onWalletChange}
            walletError={errors.walletId}
            confirm={confirm}
            onConfirm={onConfirm}
          />
        </div>
      </div>
    </>
  )
}
