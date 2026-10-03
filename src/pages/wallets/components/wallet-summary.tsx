import type { Wallet } from "@/api/contracts"
import { Button } from "@/components/ui/button"
import { networkLabels, providerLabels, shortAddress } from "@/lib/account-labels"
import { useConnectWallet, useDisconnectWallet } from "@/queries/account"

export function WalletSummary({ wallet }: { wallet: Wallet }) {
  const connect = useConnectWallet()
  const disconnect = useDisconnectWallet()
  const busy = connect.isPending || disconnect.isPending
  const connected = wallet.connection

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 bg-surface p-4">
      <div className="flex min-w-0 flex-col gap-1.5 leading-4">
        <p className="font-bold text-body-lg text-foreground">{wallet.label}</p>
        <p className="text-body-sm text-text-secondary">
          {providerLabels[wallet.provider]} · {shortAddress(wallet.address)} ·{" "}
          {wallet.networks.map((network) => networkLabels[network]).join(", ")}
        </p>
        <p className="text-caption text-highlight">
          {connected ? `Conectada na rede ${networkLabels[connected.network]}` : "Não conectada"}
        </p>
      </div>
      <Button
        type="button"
        variant="outline-brand"
        size="compact"
        disabled={busy}
        onClick={() =>
          connected
            ? disconnect.mutate(wallet.id)
            : connect.mutate({
                id: wallet.id,
                body: { network: wallet.networks[0] ?? "ethereum" },
              })
        }
      >
        {connected ? "Desconectar" : "Conectar"}
      </Button>
    </div>
  )
}
