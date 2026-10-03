import { test as base, expect, type Page } from "@playwright/test"

export type ApiResult<T = unknown> =
  | { status: number; body: T; ok: boolean }
  | { networkError: string }

type CallOptions = {
  body?: unknown
  token?: string | null
  guestCartId?: string
  headers?: Record<string, string>
}

export async function callApi<T = unknown>(
  page: Page,
  method: string,
  path: string,
  options: CallOptions = {},
): Promise<ApiResult<T>> {
  return page.evaluate(
    async ({ method, path, options }) => {
      const headers: Record<string, string> = { Accept: "application/json", ...options.headers }
      if (options.body !== undefined) headers["Content-Type"] = "application/json"
      if (options.token) headers.Authorization = `Bearer ${options.token}`
      if (options.guestCartId) headers["X-Guest-Cart-Id"] = options.guestCartId
      try {
        const res = await fetch(`/api${path}`, {
          method,
          headers,
          body: options.body === undefined ? undefined : JSON.stringify(options.body),
        })
        const text = await res.text()
        return { status: res.status, ok: res.ok, body: text ? JSON.parse(text) : null }
      } catch (error) {
        return { networkError: String(error) }
      }
    },
    { method, path, options },
  ) as Promise<ApiResult<T>>
}

export function expectResponse<T>(result: ApiResult<T>): { status: number; body: T; ok: boolean } {
  if ("networkError" in result) throw new Error(`Network error: ${result.networkError}`)
  return result
}

export function mockControl(page: Page) {
  const call = (method: string, path: string, body?: unknown) =>
    callApi(page, method, `/__mocks${path}`, { body }).then(expectResponse)
  return {
    reset: (scenario?: string) => call("POST", "/reset", { scenario }),
    setScenario: (name: string) => call("PUT", "/scenario", { name }),
    updateEdition: (
      nftId: string,
      editionId: string,
      patch: { price?: string; available?: number },
    ) => call("PATCH", `/nfts/${nftId}/editions/${editionId}`, patch),
    settleOrder: (orderId: string, outcome?: "confirmed" | "declined") =>
      call("POST", `/orders/${orderId}/settle`, { outcome }),
    expireSessions: () => call("POST", "/session/expire"),
    socket: {
      status: () => call("GET", "/socket"),
      disconnect: (downForMs?: number) => call("POST", "/socket/disconnect", { downForMs }),
      restore: () => call("POST", "/socket/restore"),
      replay: (count = 1, userId?: string) => call("POST", "/socket/replay", { count, userId }),
      emit: (event: unknown, userId?: string) => call("POST", "/socket/emit", { event, userId }),
    },
  }
}

export const USERS = {
  ana: { id: "user-ana", email: "ana@collector.test", password: "Collector#2026" },
  bruno: { id: "user-bruno", email: "bruno@collector.test", password: "Collector#2026" },
  carla: { id: "user-carla", email: "carla@collector.test", password: "Collector#2026" },
} as const

export type Api = <T = unknown>(
  method: string,
  path: string,
  options?: Parameters<typeof callApi>[3],
) => ReturnType<typeof callApi<T>>

export type UserKey = keyof typeof USERS

export async function signInViaApi(page: Page, user: UserKey): Promise<string> {
  const result = expectResponse(
    await callApi<{ token: string }>(page, "POST", "/auth/login", {
      body: { email: USERS[user].email, password: USERS[user].password },
    }),
  )
  if (result.status !== 200) throw new Error(`Login failed with ${result.status}`)
  await page.evaluate(
    (token) => localStorage.setItem("nft:session-token", token),
    result.body.token,
  )
  return result.body.token
}

export async function waitForRealtime(
  page: Page,
  status: "connected" | "reconnecting" | "connecting" | "closed",
  timeout = 10_000,
) {
  await page.locator(`html[data-realtime=${status}]`).waitFor({ state: "attached", timeout })
}

type Fixtures = {
  gotoWithScenario: (path: string, scenario?: string) => Promise<void>
  mock: ReturnType<typeof mockControl>
  api: Api
  signIn: (user: UserKey, path?: string) => Promise<string>
}

export const test = base.extend<Fixtures>({
  gotoWithScenario: async ({ page }, use) => {
    await use(async (path, scenario = "default") => {
      const url = new URL(path, "http://placeholder")
      url.searchParams.set("scenario", scenario)
      await page.goto(`${url.pathname}${url.search}`)
      await page.locator("html[data-mocks=ready]").waitFor({ state: "attached" })
    })
  },
  mock: async ({ page }, use) => {
    await use(mockControl(page))
  },
  api: async ({ page }, use) => {
    await use((method, path, options) => callApi(page, method, path, options))
  },
  signIn: async ({ page }, use) => {
    await use(async (user, path = "/") => {
      await page.goto("/")
      await page.locator("html[data-mocks=ready]").waitFor({ state: "attached" })
      const token = await signInViaApi(page, user)
      await page.goto(path)
      await page.locator("html[data-mocks=ready]").waitFor({ state: "attached" })
      return token
    })
  },
})

export { expect }
