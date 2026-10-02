import type { Network, WalletProvider } from "@/api/contracts"

export const networkLabels: Record<Network, string> = {
  ethereum: "Ethereum",
  polygon: "Polygon",
  arbitrum: "Arbitrum",
  base: "Base",
}

export const providerLabels: Record<WalletProvider, string> = {
  metamask: "MetaMask",
  coinbase: "Coinbase Wallet",
  walletconnect: "WalletConnect",
}

export const networkOptions = (Object.keys(networkLabels) as Network[]).map((value) => ({
  value,
  label: networkLabels[value],
}))

export const providerOptions = (Object.keys(providerLabels) as WalletProvider[]).map((value) => ({
  value,
  label: providerLabels[value],
}))

export function shortAddress(address: string): string {
  return address.length > 12 ? `${address.slice(0, 6)}…${address.slice(-4)}` : address
}
