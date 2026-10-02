import { HttpResponse, http } from "msw"
import {
  AVATAR_MAX_BYTES,
  AVATAR_MIME_TYPES,
  changePasswordRequestSchema,
  type Profile,
  updateProfileRequestSchema,
} from "@/api/contracts"
import { commit, type DbUser, getDb } from "@/mocks/db"
import { requireAuth } from "@/mocks/lib/auth"
import { hashPassword, randomToken } from "@/mocks/lib/crypto"
import { api, HttpError, nowIso, parseBody, route } from "@/mocks/lib/http"

const toProfile = (u: DbUser): Profile => ({
  id: u.id,
  email: u.email,
  displayName: u.displayName,
  bio: u.bio,
  website: u.website,
  avatarUrl: u.avatarUrl,
  createdAt: u.createdAt,
  updatedAt: u.updatedAt,
})

function updateUser(userId: string, patch: Partial<DbUser>): DbUser {
  return commit((db) => {
    const user = db.users.find((u) => u.id === userId)
    if (!user) throw new HttpError("NOT_FOUND", "User not found")
    Object.assign(user, patch, { updatedAt: nowIso() })
    return user
  })
}

async function readAvatar(request: Request): Promise<string> {
  let file: FormDataEntryValue | null = null
  try {
    file = (await request.formData()).get("file")
  } catch {
    file = null
  }
  if (!(file instanceof File))
    throw new HttpError("VALIDATION_ERROR", "Choose an image", {
      fields: { file: "Choose an image" },
    })
  if (!(AVATAR_MIME_TYPES as readonly string[]).includes(file.type)) {
    throw new HttpError("VALIDATION_ERROR", "Unsupported image type", {
      fields: { file: "Use PNG, JPEG or WebP" },
    })
  }
  if (file.size > AVATAR_MAX_BYTES) {
    throw new HttpError("VALIDATION_ERROR", "Image too large", {
      fields: { file: "Maximum size is 1 MB" },
    })
  }
  const bytes = new Uint8Array(await file.arrayBuffer())
  let binary = ""
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return `data:${file.type};base64,${btoa(binary)}`
}

export const profileHandlers = [
  http.get(
    api("/me"),
    route(({ request }) => HttpResponse.json(toProfile(requireAuth(request).user))),
  ),

  http.patch(
    api("/me"),
    route(async ({ request }) => {
      const { user } = requireAuth(request)
      const body = await parseBody(request, updateProfileRequestSchema)
      if (getDb().users.some((u) => u.id !== user.id && u.email === body.email)) {
        throw new HttpError("CONFLICT", "This email is used by another account", {
          fields: { email: "Email already in use" },
        })
      }
      return HttpResponse.json(toProfile(updateUser(user.id, body)))
    }),
  ),

  http.put(
    api("/me/avatar"),
    route(async ({ request }) => {
      const { user } = requireAuth(request)
      return HttpResponse.json(
        toProfile(updateUser(user.id, { avatarUrl: await readAvatar(request) })),
      )
    }),
  ),

  http.delete(
    api("/me/avatar"),
    route(({ request }) =>
      HttpResponse.json(toProfile(updateUser(requireAuth(request).user.id, { avatarUrl: null }))),
    ),
  ),

  http.put(
    api("/me/password"),
    route(async ({ request }) => {
      const { user } = requireAuth(request)
      const body = await parseBody(request, changePasswordRequestSchema)
      if ((await hashPassword(user.passwordSalt, body.currentPassword)) !== user.passwordHash) {
        throw new HttpError("VALIDATION_ERROR", "Current password is incorrect", {
          fields: { currentPassword: "Current password is incorrect" },
        })
      }
      const salt = randomToken().slice(0, 16)
      updateUser(user.id, {
        passwordSalt: salt,
        passwordHash: await hashPassword(salt, body.newPassword),
      })
      return new HttpResponse(null, { status: 204 })
    }),
  ),
]
