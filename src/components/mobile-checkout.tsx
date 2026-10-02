import { useNavigate } from "@tanstack/react-router"
import type { ReactNode } from "react"
import type { Network } from "@/api/contracts"
import { WalletCard, WalletOptionCard } from "@/components/mobile-wallet-cards"
import { ScreenHeader } from "@/components/screen-header"
import { Button } from "@/components/ui/button"
import { networkLabels, networkOptions, shortAddress } from "@/lib/account-labels"
import type { ConfirmState, WalletChoice } from "@/lib/checkout-types"

type MobileCheckoutProps = {
  total: string
  wallets: WalletChoice[]
  walletId: string | null
  onWalletChange: (id: string) => void
  network: Network
  onNetworkChange: (network: Network) => void
  walletError?: string
  confirm: ConfirmState
  onConfirm: () => void
  readOnly?: boolean
  notice?: ReactNode
}

function walletSubtitle(wallet: WalletChoice): string {
  if (wallet.connectedNetwork) return `Conectada em ${networkLabels[wallet.connectedNetwork]}`
  return wallet.networks.map((item) => networkLabels[item]).join(" · ")
}

export function MobileCheckout({
  total,
  wallets,
  walletId,
  onWalletChange,
  network,
  onNetworkChange,
  walletError,
  confirm,
  onConfirm,
  readOnly = false,
  notice,
}: MobileCheckoutProps) {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-dvh flex-col bg-ink px-7 py-8 lg:hidden">
      <div className="flex flex-1 flex-col justify-between gap-6">
        <div className="flex flex-col gap-4">
          <ScreenHeader title="Pagamento com carteira" />
          {notice}
          <div className="flex items-center justify-between font-bold leading-4">
            <h2 className="text-body-lg text-foreground">Carteira conectada</h2>
            <button
              type="button"
              onClick={() => void navigate({ to: "/wallets" })}
              className="rounded-xs text-body-sm text-highlight hover:underline"
            >
              Trocar carteira
            </button>
          </div>
          <div className="flex flex-col gap-5">
            {wallets.length === 0 ? (
              <p className="text-body-sm leading-6 text-text-secondary">
                Você ainda não tem carteiras. Adicione uma em "Trocar carteira".
              </p>
            ) : (
              wallets.map((wallet) => (
                <WalletCard
                  key={wallet.id}
                  name={wallet.label}
                  lines={[shortAddress(wallet.address), walletSubtitle(wallet)]}
                  selected={walletId === wallet.id}
                  onSelect={() => !readOnly && onWalletChange(wallet.id)}
                />
              ))
            )}
          </div>
          <fieldset disabled={readOnly} className="m-0 flex min-w-0 flex-col gap-4 border-0 p-0">
            <legend className="mb-4 font-bold text-body-lg leading-4 text-foreground">
              Carteira e rede
            </legend>
            {networkOptions.map((option) => (
              <WalletOptionCard
                key={option.value}
                id={option.value}
                label={option.label}
                initial={option.label.charAt(0)}
                selected={network === option.value}
                onSelect={() => onNetworkChange(option.value)}
              />
            ))}
          </fieldset>
          {walletError && (
            <p role="alert" className="text-caption leading-4 text-danger">
              {walletError}
            </p>
          )}
          <div className="flex items-center justify-end gap-7 font-bold leading-4">
            <span className="text-body-lg text-foreground">Total:</span>
            <span className="text-title-sm whitespace-nowrap text-highlight">{total}</span>
          </div>
        </div>
        <Button
          variant="pill"
          size="pill"
          className="text-body"
          onClick={onConfirm}
          disabled={confirm.disabled || confirm.pending}
          aria-busy={confirm.pending || undefined}
        >
          {confirm.label}
        </Button>
      </div>
    </div>
  )
}
