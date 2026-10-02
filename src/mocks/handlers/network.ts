import { delay, HttpResponse, http } from "msw"
import { api, errorResponse, HttpError } from "@/mocks/lib/http"
import { scenario } from "@/mocks/scenarios"

export const networkConditions = http.all(api("/*"), async ({ request }) => {
  const url = new URL(request.url)
  if (url.pathname.includes("/__mocks/")) return

  const config = scenario.config
  const seq = scenario.nextSeq()
  await delay(config.latency({ method: request.method, path: url.pathname, seq }))

  if (config.offline) return HttpResponse.error()

  if (request.method === "GET") {
    if (config.timeoutOn && url.pathname.includes(config.timeoutOn)) {
      await delay("infinite")
    }
    if (config.serverErrorOn && url.pathname.includes(config.serverErrorOn)) {
      return errorResponse(new HttpError("INTERNAL", "Simulated server error"))
    }
    if (config.flakyAttempts) {
      const previous = scenario.attempt(`${url.pathname}${url.search}`)
      if (previous < config.flakyAttempts) {
        return errorResponse(new HttpError("TRANSIENT", "Service temporarily unavailable"))
      }
    }
  }
})
