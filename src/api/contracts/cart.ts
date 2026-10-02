import { z } from "zod"
import { ethAmountSchema, isoDateSchema, networkSchema, quantitySchema } from "./common"
import { nftImageSchema } from "./nft"

export const cartItemStatusSchema = z.enum(["ok", "insufficient-stock", "sold-out"])

export const cartItemSchema = z.object({
  id: z.string(),
  nftId: z.string(),
  editionId: z.string(),
  name: z.string(),
  editionLabel: z.string(),
  image: nftImageSchema,

  unitPrice: ethAmountSchema,
  quantity: quantitySchema,
  lineTotal: ethAmountSchema,
  available: z.number().int().min(0),
  maxPerOrder: z.number().int().min(1),
  status: cartItemStatusSchema,

  nftVersion: z.number().int().min(1),
})
export type CartItem = z.infer<typeof cartItemSchema>

export const appliedCouponSchema = z.object({
  code: z.string(),
  description: z.string(),

  status: z.enum(["applied", "expired", "not-applicable"]),
})
export type AppliedCoupon = z.infer<typeof appliedCouponSchema>

export const priceSummarySchema = z.object({
  subtotal: ethAmountSchema,
  discount: ethAmountSchema,
  networkFee: ethAmountSchema,
  total: ethAmountSchema,
  network: networkSchema,
})
export type PriceSummary = z.infer<typeof priceSummarySchema>

export const cartSchema = z.object({
  id: z.string(),
  items: z.array(cartItemSchema),
  coupon: appliedCouponSchema.nullable(),

  summary: priceSummarySchema,
  itemCount: z.number().int().min(0),
  version: z.number().int().min(0),
  updatedAt: isoDateSchema,
})
export type Cart = z.infer<typeof cartSchema>

export const addCartItemRequestSchema = z.object({
  nftId: z.string().min(1),
  editionId: z.string().min(1),
  quantity: quantitySchema,
})
export type AddCartItemRequest = z.infer<typeof addCartItemRequestSchema>

export const updateCartItemRequestSchema = z.object({ quantity: quantitySchema })
export type UpdateCartItemRequest = z.infer<typeof updateCartItemRequestSchema>

export const applyCouponRequestSchema = z.object({
  code: z.string().trim().toUpperCase().min(1, "Enter a coupon code").max(32),
})
export type ApplyCouponRequest = z.infer<typeof applyCouponRequestSchema>

export const mergeCartRequestSchema = z.object({ guestCartId: z.string().min(1) })
export type MergeCartRequest = z.infer<typeof mergeCartRequestSchema>

export const GUEST_CART_HEADER = "X-Guest-Cart-Id"
