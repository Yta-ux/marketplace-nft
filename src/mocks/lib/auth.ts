import { GUEST_CART_HEADER } from "@/api/contracts"
import { commit, type DbSession, type DbUser, getDb } from "@/mocks/db"
import { HttpError } from "@/mocks/lib/http"

function bearer(request: Request): string | null {
  const header = request.headers.get("Authorization")
  return header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : null
}

export function sessionFromToken(
  token: string | null,
): { session: DbSession; user: DbUser } | "expired" | null {
  if (!token) return null
  const session = getDb().sessions.find((s) => s.token === token)
  if (!session) return null
  if (new Date(session.expiresAt).getTime() <= Date.now()) return "expired"
  const user = getDb().users.find((u) => u.id === session.userId)
  return user ? { session, user } : null
}

export function requireAuth(request: Request): { session: DbSession; user: DbUser } {
  const result = sessionFromToken(bearer(request))
  if (result === "expired") {
    commit((db) => {
      db.sessions = db.sessions.filter((s) => s.token !== bearer(request))
    })
    throw new HttpError("SESSION_EXPIRED", "Your session has expired. Please sign in again.")
  }
  if (!result) throw new HttpError("UNAUTHENTICATED", "Sign in to continue")
  return result
}

export function optionalAuth(request: Request): { session: DbSession; user: DbUser } | null {
  if (!bearer(request)) return null
  return requireAuth(request)
}

export function guestCartId(request: Request): string | null {
  return request.headers.get(GUEST_CART_HEADER)
}

export { bearer }
