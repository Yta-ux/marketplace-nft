import type { DbCoupon } from "@/mocks/db/schema"

export const coupons: DbCoupon[] = [
  {
    code: "WELCOME10",
    description: "10% off your order",
    kind: "percent",
    value: "10",
    minSubtotal: null,
    expiresAt: "2099-12-31T23:59:59.000Z",
  },
  {
    code: "FLAT005",
    description: "0.05 ETH off orders above 0.2 ETH",
    kind: "fixed",
    value: "0.05",
    minSubtotal: "0.2",
    expiresAt: "2099-12-31T23:59:59.000Z",
  },
  {
    code: "EXPIRED20",
    description: "20% off (campaign ended)",
    kind: "percent",
    value: "20",
    minSubtotal: null,
    expiresAt: "2025-01-01T00:00:00.000Z",
  },
]
