import type { Network } from "@/api/contracts"

export type WalletChoice = {
  id: string
  label: string
  address: string
  providerLabel: string
  networks: Network[]
  connectedNetwork: Network | null
}

export type CollectorValues = { fullName: string; email: string }

export type CollectorErrors = Partial<
  Record<keyof CollectorValues | "network" | "walletId", string>
>

export type ConfirmState = { pending: boolean; disabled: boolean; label: string }
