import { useQuery } from "@tanstack/react-query"
import { AccountLayout } from "@/components/account-layout"
import { AccountFormSkeleton } from "@/components/account-skeleton"
import { AccountError } from "@/components/account-state"
import { WalletsForm } from "@/pages/wallets/components/wallets-form"
import { walletsQueryOptions } from "@/queries/account"

export function WalletsPage() {
  const wallets = useQuery(walletsQueryOptions())
  return (
    <AccountLayout>
      {wallets.isPending ? (
        <AccountFormSkeleton label="Carregando carteiras" fields={9} />
      ) : wallets.isError ? (
        <AccountError
          title="Não foi possível carregar suas carteiras."
          onRetry={() => void wallets.refetch()}
        />
      ) : (
        <WalletsForm wallets={wallets.data.items} />
      )}
    </AccountLayout>
  )
}
