import { z } from "zod"

const envSchema = z.object({
  VITE_API_URL: z.string().min(1).default("/api"),
  VITE_SOCKET_URL: z.url(),
  VITE_ENABLE_MOCKS: z.stringbool().default(true),
  VITE_MOCK_SCENARIO: z.string().default("default"),
})

const parsed = envSchema.safeParse(import.meta.env)
if (!parsed.success) {
  throw new Error(`Invalid environment configuration:\n${z.prettifyError(parsed.error)}`)
}

export const env = {
  apiUrl: parsed.data.VITE_API_URL,
  socketUrl: parsed.data.VITE_SOCKET_URL,
  enableMocks: parsed.data.VITE_ENABLE_MOCKS,
  mockScenario: parsed.data.VITE_MOCK_SCENARIO,
} as const
