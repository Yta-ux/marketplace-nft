import axios from "axios"
import type { z } from "zod"
import { credentials, GUEST_CART_HEADER } from "@/api/credentials"
import { ApiError, toApiError } from "@/api/errors"
import { env } from "@/lib/env"

export const REQUEST_TIMEOUT_MS = 10_000

export const http = axios.create({
  baseURL: env.apiUrl,
  timeout: REQUEST_TIMEOUT_MS,
  headers: { Accept: "application/json" },
})

http.interceptors.request.use((config) => {
  const token = credentials.getToken()
  if (token) config.headers.set("Authorization", `Bearer ${token}`)
  else config.headers.set(GUEST_CART_HEADER, credentials.getGuestCartId())
  return config
})

type UnauthorizedListener = (code: "UNAUTHENTICATED" | "SESSION_EXPIRED") => void
const unauthorizedListeners = new Set<UnauthorizedListener>()

export function onUnauthorized(listener: UnauthorizedListener): () => void {
  unauthorizedListeners.add(listener)
  return () => unauthorizedListeners.delete(listener)
}

http.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const apiError = toApiError(error)
    if (apiError.code === "UNAUTHENTICATED" || apiError.code === "SESSION_EXPIRED") {
      for (const listener of unauthorizedListeners) listener(apiError.code)
    }
    return Promise.reject(apiError)
  },
)

export function parseResponse<T extends z.ZodType>(schema: T, data: unknown): z.infer<T> {
  const result = schema.safeParse(data)
  if (!result.success) {
    throw new ApiError(0, {
      code: "INTERNAL",
      message: "Response does not match contract",
      details: { issues: result.error.issues },
    })
  }
  return result.data
}
