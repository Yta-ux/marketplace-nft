import { Link } from "@tanstack/react-router"
import { CheckoutSkeleton } from "@/components/checkout-skeleton"
import { CheckoutView } from "@/components/checkout-view"
import { ScreenHeader } from "@/components/screen-header"
import { Button } from "@/components/ui/button"
import { CheckoutNotice } from "@/pages/checkout/components/checkout-notice"
import { useCheckout } from "@/pages/checkout/use-checkout"

function Message({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col gap-6 bg-ink px-7 py-8 lg:min-h-0 lg:p-0 lg:pt-8">
      <ScreenHeader title="Pagamento" className="lg:hidden" />
      <div
        role="alert"
        className="flex min-h-[300px] flex-col items-start justify-center gap-4 bg-surface p-8"
      >
        <p className="font-bold text-title-sm text-foreground">{title}</p>
        {children}
      </div>
    </div>
  )
}

export function CheckoutContent() {
  const checkout = useCheckout()

  if (checkout.status === "loading") return <CheckoutSkeleton />

  if (checkout.status === "empty") {
    return (
      <Message title="Seu carrinho está vazio.">
        <Link
          to="/"
          hash="catalogo"
          className="text-body leading-[normal] text-highlight hover:underline"
        >
          Continuar explorando
        </Link>
      </Message>
    )
  }

  if (checkout.status === "error" || !checkout.totals) {
    return (
      <Message title="Não foi possível preparar o pagamento.">
        <p className="text-body-sm text-text-secondary">Verifique sua conexão e tente novamente.</p>
        <Button type="button" variant="brand" size="compact" onClick={checkout.retry}>
          Tentar novamente
        </Button>
      </Message>
    )
  }

  const notice = checkout.problem ? (
    <CheckoutNotice
      problem={checkout.problem}
      onRefresh={checkout.refresh}
      refreshing={checkout.refreshing}
    />
  ) : undefined

  return (
    <CheckoutView
      items={checkout.items}
      totals={checkout.totals}
      wallets={checkout.wallets}
      walletId={checkout.walletId}
      onWalletChange={checkout.changeWallet}
      network={checkout.network}
      onNetworkChange={checkout.changeNetwork}
      values={checkout.values}
      onValuesChange={checkout.changeValues}
      errors={checkout.errors}
      confirm={checkout.confirmState}
      onConfirm={checkout.confirm}
      notice={notice}
    />
  )
}
