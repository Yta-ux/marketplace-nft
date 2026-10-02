import { z } from "zod"
import { isoDateSchema } from "./common"

export const emailSchema = z.email("Enter a valid email").trim().toLowerCase().max(120)

export const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters")
  .max(72, "Use at most 72 characters")
  .regex(/[A-Za-z]/, "Include at least one letter")
  .regex(/\d/, "Include at least one number")

export const displayNameSchema = z
  .string()
  .trim()
  .min(2, "Use at least 2 characters")
  .max(40, "Use at most 40 characters")

export const userSchema = z.object({
  id: z.string(),
  email: z.string(),
  displayName: z.string(),
  avatarUrl: z.string().nullable(),
})
export type User = z.infer<typeof userSchema>

export const registerRequestSchema = z.object({
  displayName: displayNameSchema,
  email: emailSchema,
  password: passwordSchema,
})
export type RegisterRequest = z.infer<typeof registerRequestSchema>

export const loginRequestSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password"),
})
export type LoginRequest = z.infer<typeof loginRequestSchema>

export const sessionSchema = z.object({
  user: userSchema,
  expiresAt: isoDateSchema,
})
export type Session = z.infer<typeof sessionSchema>

export const authResponseSchema = sessionSchema.extend({
  token: z.string().min(1),
})
export type AuthResponse = z.infer<typeof authResponseSchema>
