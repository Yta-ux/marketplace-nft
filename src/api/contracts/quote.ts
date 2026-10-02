import { z } from "zod"
import { appliedCouponSchema } from "./cart"
import { ethAmountSchema, isoDateSchema, networkSchema, quantitySchema } from "./common"

export const quoteLineSchema = z.object({
  nftId: z.string(),
  editionId: z.string(),
  name: z.string(),
  editionLabel: z.string(),
  imageUrl: z.string(),
  unitPrice: ethAmountSchema,
  quantity: quantitySchema,
  lineTotal: ethAmountSchema,
})
export type QuoteLine = z.infer<typeof quoteLineSchema>

export const quoteSchema = z.object({
  id: z.string(),
  lines: z.array(quoteLineSchema).min(1),
  coupon: appliedCouponSchema.nullable(),
  subtotal: ethAmountSchema,
  discount: ethAmountSchema,
  networkFee: ethAmountSchema,
  total: ethAmountSchema,
  network: networkSchema,
  cartVersion: z.number().int(),
  createdAt: isoDateSchema,
  expiresAt: isoDateSchema,
})
export type Quote = z.infer<typeof quoteSchema>

export const createQuoteRequestSchema = z.object({ network: networkSchema })
export type CreateQuoteRequest = z.infer<typeof createQuoteRequestSchema>

export const quoteChangeSchema = z.object({
  nftId: z.string(),
  editionId: z.string(),
  name: z.string(),
  field: z.enum(["price", "available", "coupon", "networkFee", "removed"]),
  previous: z.string().nullable(),
  current: z.string().nullable(),
})
export type QuoteChange = z.infer<typeof quoteChangeSchema>

export const quoteOutdatedDetailsSchema = z.object({
  changes: z.array(quoteChangeSchema),
})
export type QuoteOutdatedDetails = z.infer<typeof quoteOutdatedDetailsSchema>
