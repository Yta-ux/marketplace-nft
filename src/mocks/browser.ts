import { setupWorker } from "msw/browser"
import { resumePendingSettlements } from "@/mocks/domain/orders"
import { handlers } from "@/mocks/handlers"
import { initScenario } from "@/mocks/scenarios"
import { socketHandlers } from "@/mocks/socket"

export const worker = setupWorker(...handlers, ...socketHandlers)

export async function startMockWorker(): Promise<void> {
  const scenario = initScenario()
  await worker.start({
    onUnhandledRequest: "bypass",
    quiet: import.meta.env.PROD,
    serviceWorker: { url: `${import.meta.env.BASE_URL}mockServiceWorker.js` },
  })

  resumePendingSettlements()
  if (import.meta.env.DEV) console.info(`[mocks] scenario: ${scenario}`)
}
