import { z } from "zod"
import { ethAmountSchema, isoDateSchema } from "./common"
import { orderStatusSchema, orderTransactionSchema } from "./order"

const envelope = <TType extends string, TResource extends string, TData extends z.ZodType>(
  type: TType,
  resource: TResource,
  data: TData,
) =>
  z.object({
    id: z.string(),
    type: z.literal(type),
    resource: z.object({ type: z.literal(resource), id: z.string() }),
    version: z.number().int().min(1),
    occurredAt: isoDateSchema,
    data,
  })

export const nftUpdatedEventSchema = envelope(
  "nft.updated",
  "nft",
  z.object({
    nftId: z.string(),
    priceFrom: ethAmountSchema,
    totalAvailable: z.number().int().min(0),
    editions: z.array(
      z.object({ id: z.string(), price: ethAmountSchema, available: z.number().int().min(0) }),
    ),
  }),
)
export type NftUpdatedEvent = z.infer<typeof nftUpdatedEventSchema>

export const orderUpdatedEventSchema = envelope(
  "order.updated",
  "order",
  z.object({
    orderId: z.string(),
    status: orderStatusSchema,
    transaction: orderTransactionSchema.nullable(),
    failureReason: z.string().nullable(),
    updatedAt: isoDateSchema,
  }),
)
export type OrderUpdatedEvent = z.infer<typeof orderUpdatedEventSchema>

export const realtimeEventSchema = z.discriminatedUnion("type", [
  nftUpdatedEventSchema,
  orderUpdatedEventSchema,
])
export type RealtimeEvent = z.infer<typeof realtimeEventSchema>

export const SOCKET_EVENTS = {
  nftUpdated: "nft.updated",
  orderUpdated: "order.updated",
} as const

export const socketAuthSchema = z.object({ token: z.string().nullable() })
export type SocketAuth = z.infer<typeof socketAuthSchema>
