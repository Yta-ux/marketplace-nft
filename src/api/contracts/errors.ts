import { z } from "zod"

export const apiErrorCodeSchema = z.enum([
  "VALIDATION_ERROR",
  "INVALID_CREDENTIALS",
  "UNAUTHENTICATED",
  "SESSION_EXPIRED",
  "FORBIDDEN",
  "NOT_FOUND",
  "CONFLICT",
  "IDEMPOTENCY_CONFLICT",
  "AVAILABILITY_CONFLICT",
  "QUOTE_OUTDATED",
  "QUOTE_EXPIRED",
  "COUPON_INVALID",
  "COUPON_EXPIRED",
  "WALLET_REJECTED",
  "WALLET_NOT_CONNECTED",
  "PAYMENT_DECLINED",
  "TRANSIENT",
  "INTERNAL",
])

export type ApiErrorCode = z.infer<typeof apiErrorCodeSchema>

export const apiErrorSchema = z.object({
  code: apiErrorCodeSchema,
  message: z.string(),
  fields: z.record(z.string(), z.string()).optional(),
  details: z.record(z.string(), z.unknown()).optional(),
})

export type ApiErrorBody = z.infer<typeof apiErrorSchema>

export const apiErrorStatus = {
  VALIDATION_ERROR: 422,
  INVALID_CREDENTIALS: 401,
  UNAUTHENTICATED: 401,
  SESSION_EXPIRED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  IDEMPOTENCY_CONFLICT: 409,
  AVAILABILITY_CONFLICT: 409,
  QUOTE_OUTDATED: 409,
  QUOTE_EXPIRED: 409,
  COUPON_INVALID: 422,
  COUPON_EXPIRED: 422,
  WALLET_REJECTED: 403,
  WALLET_NOT_CONNECTED: 409,
  PAYMENT_DECLINED: 402,
  TRANSIENT: 503,
  INTERNAL: 500,
} as const satisfies Record<ApiErrorCode, number>
