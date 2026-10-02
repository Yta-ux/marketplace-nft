import type { AppliedCoupon, Network } from "@/api/contracts"
import { eth } from "@/lib/eth"
import { type DbCoupon, getDb } from "@/mocks/db"
import { HttpError } from "@/mocks/lib/http"

export const DEFAULT_NETWORK: Network = "ethereum"

export const NETWORK_FEES: Record<Network, string> = {
  ethereum: "0.0042",
  polygon: "0.0003",
  arbitrum: "0.0008",
  base: "0.0005",
}

export function findCoupon(code: string): DbCoupon | undefined {
  return getDb().coupons.find((c) => c.code === code.toUpperCase())
}

type CouponEvaluation = { coupon: AppliedCoupon; discount: string }

export function evaluateCoupon(code: string, subtotal: string): CouponEvaluation {
  const coupon = findCoupon(code)
  if (!coupon) {
    return {
      coupon: { code, description: "Unknown coupon", status: "not-applicable" },
      discount: eth.zero,
    }
  }
  if (new Date(coupon.expiresAt).getTime() <= Date.now()) {
    return {
      coupon: { code, description: coupon.description, status: "expired" },
      discount: eth.zero,
    }
  }
  if (coupon.minSubtotal && eth.cmp(subtotal, coupon.minSubtotal) < 0) {
    return {
      coupon: { code, description: coupon.description, status: "not-applicable" },
      discount: eth.zero,
    }
  }
  const raw =
    coupon.kind === "percent" ? eth.percentOf(subtotal, Number(coupon.value)) : coupon.value
  return {
    coupon: { code, description: coupon.description, status: "applied" },
    discount: eth.min(raw, subtotal),
  }
}

export function assertCouponApplicable(code: string, subtotal: string): void {
  const coupon = findCoupon(code)
  if (!coupon)
    throw new HttpError("COUPON_INVALID", "This coupon code is not valid", {
      fields: { code: "Invalid coupon code" },
    })
  if (new Date(coupon.expiresAt).getTime() <= Date.now()) {
    throw new HttpError("COUPON_EXPIRED", "This coupon has expired", {
      fields: { code: "Coupon expired" },
    })
  }
  if (coupon.minSubtotal && eth.cmp(subtotal, coupon.minSubtotal) < 0) {
    throw new HttpError(
      "COUPON_INVALID",
      `This coupon requires a subtotal of at least ${coupon.minSubtotal} ETH`,
      {
        fields: { code: `Minimum subtotal is ${coupon.minSubtotal} ETH` },
      },
    )
  }
}

export function summarize(lineTotals: string[], couponCode: string | null, network: Network) {
  const subtotal = eth.sum(lineTotals)
  const evaluation = couponCode ? evaluateCoupon(couponCode, subtotal) : null
  const discount = evaluation?.discount ?? eth.zero
  const networkFee = lineTotals.length > 0 ? NETWORK_FEES[network] : eth.zero
  return {
    subtotal,
    discount,
    networkFee,
    total: eth.add(eth.sub(subtotal, discount), networkFee),
    network,
    coupon: evaluation?.coupon ?? null,
  }
}
