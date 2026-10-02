import { z } from "zod"
import { ethAmountSchema, isoDateSchema, networkSchema, quantitySchema } from "./common"
import { emailSchema } from "./session"
import { walletProviderSchema } from "./wallet"

export const orderStatusSchema = z.enum(["pending", "confirmed", "declined"])
export type OrderStatus = z.infer<typeof orderStatusSchema>

export const TERMINAL_ORDER_STATUSES: readonly OrderStatus[] = ["confirmed", "declined"]

export const collectorSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(80),
  email: emailSchema,
})
export type Collector = z.infer<typeof collectorSchema>

export const orderLineSchema = z.object({
  nftId: z.string(),
  editionId: z.string(),
  name: z.string(),
  editionLabel: z.string(),
  imageUrl: z.string(),
  unitPrice: ethAmountSchema,
  quantity: quantitySchema,
  lineTotal: ethAmountSchema,
})
export type OrderLine = z.infer<typeof orderLineSchema>

export const orderTransactionSchema = z.object({
  hash: z.string(),
  explorerUrl: z.string(),
})

export const orderSchema = z.object({
  id: z.string(),
  status: orderStatusSchema,
  lines: z.array(orderLineSchema).min(1),
  couponCode: z.string().nullable(),
  subtotal: ethAmountSchema,
  discount: ethAmountSchema,
  networkFee: ethAmountSchema,
  total: ethAmountSchema,
  network: networkSchema,
  wallet: z.object({
    id: z.string(),
    label: z.string(),
    address: z.string(),
    provider: walletProviderSchema,
  }),
  collector: collectorSchema,
  quoteId: z.string(),

  transaction: orderTransactionSchema.nullable(),
  failureReason: z.string().nullable(),
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,

  version: z.number().int().min(1),
})
export type Order = z.infer<typeof orderSchema>

export const createOrderRequestSchema = z.object({
  quoteId: z.string().min(1),
  walletId: z.string().min(1),
  network: networkSchema,
  collector: collectorSchema,
})
export type CreateOrderRequest = z.infer<typeof createOrderRequestSchema>

export const IDEMPOTENCY_HEADER = "Idempotency-Key"

export const ordersResponseSchema = z.object({ items: z.array(orderSchema) })
export type OrdersResponse = z.infer<typeof ordersResponseSchema>
