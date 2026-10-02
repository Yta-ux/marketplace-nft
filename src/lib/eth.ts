import Big from "big.js"

export type EthAmount = string

Big.DP = 18
Big.RM = Big.roundHalfUp

const ZERO = "0"

function assertQuantity(quantity: number): void {
  if (!Number.isInteger(quantity) || quantity < 0) {
    throw new TypeError(`Quantity must be a non-negative integer, got ${quantity}`)
  }
}

export const eth = {
  zero: ZERO,
  add: (a: EthAmount, b: EthAmount): EthAmount => new Big(a).plus(b).toFixed(),
  sub: (a: EthAmount, b: EthAmount): EthAmount => new Big(a).minus(b).toFixed(),
  mul: (a: EthAmount, quantity: number): EthAmount => {
    assertQuantity(quantity)
    return new Big(a).times(quantity).toFixed()
  },

  percentOf: (a: EthAmount, percent: number): EthAmount =>
    new Big(a).times(percent).div(100).round(18, Big.roundHalfUp).toFixed(),
  sum: (values: EthAmount[]): EthAmount =>
    values.reduce((acc, v) => acc.plus(v), new Big(0)).toFixed(),
  min: (a: EthAmount, b: EthAmount): EthAmount => (new Big(a).lte(b) ? a : b),
  max: (a: EthAmount, b: EthAmount): EthAmount => (new Big(a).gte(b) ? a : b),
  cmp: (a: EthAmount, b: EthAmount): -1 | 0 | 1 => new Big(a).cmp(b),
  eq: (a: EthAmount, b: EthAmount): boolean => new Big(a).eq(b),

  format: (value: EthAmount, maxDecimals = 4): string =>
    `${new Big(value).round(maxDecimals, Big.roundDown).toFixed()} ETH`,
}
