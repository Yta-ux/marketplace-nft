import { AxiosError } from "axios"
import { type ApiErrorBody, type ApiErrorCode, apiErrorSchema } from "@/api/contracts"

export class ApiError extends Error {
  readonly status: number
  readonly code: ApiErrorCode | "NETWORK" | "TIMEOUT" | "CANCELED"
  readonly fields?: Record<string, string>
  readonly details?: Record<string, unknown>

  constructor(
    status: number,
    body: Pick<ApiErrorBody, "message" | "fields" | "details"> & { code: ApiError["code"] },
  ) {
    super(body.message)
    this.name = "ApiError"
    this.status = status
    this.code = body.code
    this.fields = body.fields
    this.details = body.details
  }

  get isRetryable(): boolean {
    return (
      this.code === "TRANSIENT" ||
      this.code === "NETWORK" ||
      this.code === "TIMEOUT" ||
      this.status >= 500
    )
  }
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error
  if (error instanceof AxiosError) {
    if (error.code === AxiosError.ERR_CANCELED) {
      return new ApiError(0, { code: "CANCELED", message: "Request canceled" })
    }
    if (error.code === AxiosError.ECONNABORTED || error.code === AxiosError.ETIMEDOUT) {
      return new ApiError(0, { code: "TIMEOUT", message: "Request timed out" })
    }
    if (!error.response) {
      return new ApiError(0, { code: "NETWORK", message: "Network unavailable" })
    }
    const parsed = apiErrorSchema.safeParse(error.response.data)
    if (parsed.success) return new ApiError(error.response.status, parsed.data)
    return new ApiError(error.response.status, { code: "INTERNAL", message: error.message })
  }
  return new ApiError(0, {
    code: "INTERNAL",
    message: error instanceof Error ? error.message : "Unknown error",
  })
}
