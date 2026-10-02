import type { z } from "zod"
import { ApiError } from "@/api/errors"

export type FieldErrors = Record<string, string>

export function readForm(form: HTMLFormElement): Record<string, string> {
  const values: Record<string, string> = {}
  for (const [key, value] of new FormData(form)) {
    if (typeof value === "string") values[key] = value
  }
  return values
}

export function zodFieldErrors(error: z.ZodError): FieldErrors {
  const errors: FieldErrors = {}
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form")
    if (!(key in errors)) errors[key] = issue.message
  }
  return errors
}

export function apiFieldErrors(error: unknown): FieldErrors {
  return error instanceof ApiError && error.fields ? error.fields : {}
}
