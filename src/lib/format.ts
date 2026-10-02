import Big from "big.js"
import type { EthAmount } from "@/lib/eth"

function fixed(value: EthAmount, minDecimals: number, maxDecimals: number): string {
  const rounded = new Big(value).round(maxDecimals, Big.roundHalfUp)
  const [, decimals = ""] = rounded.toFixed().split(".")
  return rounded.toFixed(Math.max(minDecimals, Math.min(decimals.length, maxDecimals)))
}

export function formatEth(value: EthAmount): string {
  return `${fixed(value, 2, 4)} ETH`
}

export function formatEthPtBr(value: EthAmount): string {
  return fixed(value, 2, 4).replace(".", ",")
}
