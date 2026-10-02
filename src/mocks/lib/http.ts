import { HttpResponse, type PathParams } from "msw"
import type { z } from "zod"
import { type ApiErrorBody, type ApiErrorCode, apiErrorStatus } from "@/api/contracts"
import { env } from "@/lib/env"

export const api = (path: string) => `${env.apiUrl}${path}`

export class HttpError extends Error {
  readonly code: ApiErrorCode
  readonly fields?: Record<string, string>
  readonly details?: Record<string, unknown>

  constructor(
    code: ApiErrorCode,
    message: string,
    extra?: Pick<ApiErrorBody, "fields" | "details">,
  ) {
    super(message)
    this.code = code
    this.fields = extra?.fields
    this.details = extra?.details
  }
}

export function errorResponse(error: HttpError) {
  const body: ApiErrorBody = {
    code: error.code,
    message: error.message,
    ...(error.fields && { fields: error.fields }),
    ...(error.details && { details: error.details }),
  }
  return HttpResponse.json(body, { status: apiErrorStatus[error.code] })
}

type ResolverArgs<TParams> = { request: Request; params: TParams }
type Resolver<TParams> = (args: ResolverArgs<TParams>) => Response | Promise<Response>

export function route<TParams = PathParams>(resolver: Resolver<TParams>): Resolver<TParams> {
  return async (args) => {
    try {
      return await resolver(args)
    } catch (error) {
      if (error instanceof HttpError) return errorResponse(error)
      console.error("[mocks] unhandled error", error)
      return errorResponse(new HttpError("INTERNAL", "Unexpected mock error"))
    }
  }
}

export function fieldErrors(error: z.ZodError): Record<string, string> {
  const fields: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_"
    fields[key] ??= issue.message
  }
  return fields
}

export async function parseBody<T extends z.ZodType>(
  request: Request,
  schema: T,
): Promise<z.infer<T>> {
  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    raw = undefined
  }
  const result = schema.safeParse(raw)
  if (!result.success) {
    throw new HttpError("VALIDATION_ERROR", "Some fields are invalid", {
      fields: fieldErrors(result.error),
    })
  }
  return result.data
}

export const now = () => new Date()
export const nowIso = () => new Date().toISOString()
