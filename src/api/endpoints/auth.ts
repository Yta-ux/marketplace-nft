import {
  type AuthResponse,
  authResponseSchema,
  type LoginRequest,
  type RegisterRequest,
  type Session,
  sessionSchema,
} from "@/api/contracts"
import { http, parseResponse } from "@/api/http"

export const authApi = {
  register: async (body: RegisterRequest): Promise<AuthResponse> =>
    parseResponse(authResponseSchema, (await http.post("/auth/register", body)).data),

  login: async (body: LoginRequest): Promise<AuthResponse> =>
    parseResponse(authResponseSchema, (await http.post("/auth/login", body)).data),

  session: async (signal?: AbortSignal): Promise<Session> =>
    parseResponse(sessionSchema, (await http.get("/auth/session", { signal })).data),

  logout: async (): Promise<void> => {
    await http.post("/auth/logout")
  },
}
