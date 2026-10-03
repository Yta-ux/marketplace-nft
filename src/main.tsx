import { env } from "@/lib/env"
import "./index.css"

async function enableMocking() {
  if (!env.enableMocks) return
  const { startMockWorker } = await import("@/mocks/browser")
  await startMockWorker()

  document.documentElement.dataset.mocks = "ready"
}

enableMocking()
  .then(() => import("@/app/start"))
  .then(({ startApp }) => startApp())
