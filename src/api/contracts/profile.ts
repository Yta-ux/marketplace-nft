import { z } from "zod"
import { isoDateSchema } from "./common"
import { displayNameSchema, emailSchema, passwordSchema } from "./session"

export const profileSchema = z.object({
  id: z.string(),
  email: z.string(),
  displayName: z.string(),
  bio: z.string(),
  website: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
})
export type Profile = z.infer<typeof profileSchema>

export const updateProfileRequestSchema = z.object({
  displayName: displayNameSchema,
  email: emailSchema,
  bio: z.string().trim().max(280, "Use at most 280 characters"),
  website: z
    .union([z.url("Enter a valid URL").max(200), z.literal("")])
    .transform((v) => v || null),
})
export type UpdateProfileRequest = z.input<typeof updateProfileRequestSchema>

export const AVATAR_MAX_BYTES = 1024 * 1024
export const AVATAR_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"] as const

export const changePasswordRequestSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: passwordSchema,
  })
  .refine((v) => v.currentPassword !== v.newPassword, {
    path: ["newPassword"],
    message: "New password must be different from the current one",
  })
export type ChangePasswordRequest = z.infer<typeof changePasswordRequestSchema>
