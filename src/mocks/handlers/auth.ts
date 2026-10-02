import { HttpResponse, http } from "msw"
import {
  type AuthResponse,
  loginRequestSchema,
  registerRequestSchema,
  type Session,
  type User,
} from "@/api/contracts"
import { commit, type DbUser, getDb, nextId } from "@/mocks/db"
import { bearer, requireAuth } from "@/mocks/lib/auth"
import { hashPassword, randomToken } from "@/mocks/lib/crypto"
import { api, HttpError, nowIso, parseBody, route } from "@/mocks/lib/http"
import { scenario } from "@/mocks/scenarios"

export const toUser = (user: DbUser): User => ({
  id: user.id,
  email: user.email,
  displayName: user.displayName,
  avatarUrl: user.avatarUrl,
})

function startSession(user: DbUser): AuthResponse {
  const token = randomToken()
  const expiresAt = new Date(Date.now() + scenario.config.sessionTtlMs).toISOString()
  commit((db) => {
    db.sessions.push({ token, userId: user.id, createdAt: nowIso(), expiresAt })
  })
  return { token, user: toUser(user), expiresAt }
}

export const authHandlers = [
  http.post(
    api("/auth/register"),
    route(async ({ request }) => {
      const body = await parseBody(request, registerRequestSchema)
      if (getDb().users.some((u) => u.email === body.email)) {
        throw new HttpError("CONFLICT", "An account with this email already exists", {
          fields: { email: "This email is already registered" },
        })
      }
      const salt = randomToken().slice(0, 16)
      const user: DbUser = {
        id: nextId("user", "user"),
        email: body.email,
        displayName: body.displayName,
        bio: "",
        website: null,
        avatarUrl: null,
        passwordSalt: salt,
        passwordHash: await hashPassword(salt, body.password),
        createdAt: nowIso(),
        updatedAt: nowIso(),
      }
      commit((db) => {
        db.users.push(user)
        db.favorites[user.id] = []
      })
      return HttpResponse.json(startSession(user), { status: 201 })
    }),
  ),

  http.post(
    api("/auth/login"),
    route(async ({ request }) => {
      const body = await parseBody(request, loginRequestSchema)
      const user = getDb().users.find((u) => u.email === body.email)
      const hash = user ? await hashPassword(user.passwordSalt, body.password) : null
      if (!user || hash !== user.passwordHash) {
        throw new HttpError("INVALID_CREDENTIALS", "Email or password is incorrect")
      }
      return HttpResponse.json(startSession(user))
    }),
  ),

  http.get(
    api("/auth/session"),
    route(({ request }) => {
      const { user, session } = requireAuth(request)
      const body: Session = { user: toUser(user), expiresAt: session.expiresAt }
      return HttpResponse.json(body)
    }),
  ),

  http.post(
    api("/auth/logout"),
    route(({ request }) => {
      const token = bearer(request)
      commit((db) => {
        db.sessions = db.sessions.filter((s) => s.token !== token)
      })
      return new HttpResponse(null, { status: 204 })
    }),
  ),
]
