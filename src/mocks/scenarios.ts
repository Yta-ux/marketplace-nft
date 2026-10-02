import { env } from "@/lib/env"

export type ScenarioConfig = {
  description: string

  latency: (req: { method: string; path: string; seq: number }) => number

  offline?: boolean

  serverErrorOn?: string
  timeoutOn?: string

  flakyAttempts?: number
  emptyCatalog?: boolean
  sessionTtlMs: number
  favoritesFail?: boolean
  walletRejects?: boolean

  checkoutChange?: "price" | "sold-out"
  checkoutChangeDelayMs?: number

  orderTimeout?: boolean
  paymentOutcome: "confirmed" | "declined"

  settleDelayMs: number | null
}

const DEFAULT_LATENCY_MS = 120
const SESSION_TTL_MS = 30 * 60_000
const VARIABLE_LATENCIES = [1600, 250, 900, 120, 1200, 400]

const base: ScenarioConfig = {
  description: "Happy path with small constant latency",
  latency: () => DEFAULT_LATENCY_MS,
  sessionTtlMs: SESSION_TTL_MS,
  paymentOutcome: "confirmed",
  settleDelayMs: 3_000,
}

export const scenarios = {
  default: base,
  "empty-catalog": {
    ...base,
    description: "Catalog and featured return no items",
    emptyCatalog: true,
  },
  "slow-network": { ...base, description: "Every request takes 2.5s", latency: () => 2_500 },
  "variable-latency": {
    ...base,
    description:
      "Deterministic latency sequence; earlier catalog requests may resolve after later ones",
    latency: ({ seq }) => VARIABLE_LATENCIES[seq % VARIABLE_LATENCIES.length] ?? DEFAULT_LATENCY_MS,
  },
  offline: {
    ...base,
    description: "Network unavailable (connection error on every request)",
    offline: true,
  },
  "request-timeout": {
    ...base,
    description: "Catalog GETs never respond; the client gives up after its request timeout",
    timeoutOn: "/nfts",
  },
  "server-error": {
    ...base,
    description: "Catalog/detail GETs respond 500",
    serverErrorOn: "/nfts",
  },
  flaky: {
    ...base,
    description: "Each GET fails with 503 three times, then succeeds",
    flakyAttempts: 3,
  },
  "session-expired": {
    ...base,
    description: "Sessions expire 60s after login",
    sessionTtlMs: 60_000,
  },
  "favorites-failure": {
    ...base,
    description: "Favorite add/remove respond 503",
    favoritesFail: true,
  },
  "wallet-rejected": {
    ...base,
    description: "Wallet connection is refused by the user",
    walletRejects: true,
  },
  "price-changed-during-checkout": {
    ...base,
    description: "1.5s after the first quote, the first item's price rises 10% (nft.updated)",
    checkoutChange: "price",
    checkoutChangeDelayMs: 1_500,
  },
  "sold-out-during-checkout": {
    ...base,
    description: "1.5s after the first quote, the first item's edition sells out (nft.updated)",
    checkoutChange: "sold-out",
    checkoutChangeDelayMs: 1_500,
  },
  "order-timeout": {
    ...base,
    description: "First order attempt is created but the response never arrives; retry recovers it",
    orderTimeout: true,
    settleDelayMs: 20_000,
  },
  "order-pending": {
    ...base,
    description: "Orders stay pending until settled via the mock control API",
    settleDelayMs: null,
  },
  "payment-declined": {
    ...base,
    description: "Payments are declined on settlement",
    paymentOutcome: "declined",
  },
} satisfies Record<string, ScenarioConfig>

export type ScenarioName = keyof typeof scenarios
export const scenarioNames = Object.keys(scenarios) as ScenarioName[]

const STORAGE_KEY = "nft-mock:scenario"

export const isScenario = (value: unknown): value is ScenarioName =>
  typeof value === "string" && Object.hasOwn(scenarios, value)

function initialScenario(): ScenarioName {
  const fromUrl = new URLSearchParams(window.location.search).get("scenario")
  if (isScenario(fromUrl)) {
    sessionStorage.setItem(STORAGE_KEY, fromUrl)
    return fromUrl
  }
  const stored = sessionStorage.getItem(STORAGE_KEY)
  if (isScenario(stored)) return stored
  return isScenario(env.mockScenario) ? env.mockScenario : "default"
}

const runtime = {
  name: "default" as ScenarioName,
  seq: 0,
  attempts: new Map<string, number>(),
  checkoutChangeApplied: false,
  timedOutOrderKeys: new Set<string>(),
}

export function initScenario(): ScenarioName {
  setScenario(initialScenario())
  return runtime.name
}

export function setScenario(name: ScenarioName): void {
  runtime.name = name
  runtime.seq = 0
  runtime.attempts.clear()
  runtime.checkoutChangeApplied = false
  runtime.timedOutOrderKeys.clear()
  sessionStorage.setItem(STORAGE_KEY, name)
}

export const scenario = {
  get name(): ScenarioName {
    return runtime.name
  },
  get config(): ScenarioConfig {
    return scenarios[runtime.name]
  },
  nextSeq: () => runtime.seq++,

  attempt: (key: string) => {
    const count = runtime.attempts.get(key) ?? 0
    runtime.attempts.set(key, count + 1)
    return count
  },
  claimCheckoutChange: () => {
    if (runtime.checkoutChangeApplied) return false
    runtime.checkoutChangeApplied = true
    return true
  },

  claimOrderTimeout: (key: string) => {
    if (runtime.timedOutOrderKeys.has(key)) return false
    runtime.timedOutOrderKeys.add(key)
    return true
  },
}
