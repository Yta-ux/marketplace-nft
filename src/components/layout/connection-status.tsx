import { useEffect, useRef, useState } from "react"
import { useRealtimeStatus } from "@/realtime/realtime-provider"

const RESTORED_VISIBLE_MS = 3_000

export function ConnectionStatus() {
  const status = useRealtimeStatus()
  const [restored, setRestored] = useState(false)
  const wasDown = useRef(false)

  useEffect(() => {
    if (status === "reconnecting") {
      wasDown.current = true
      setRestored(false)
      return
    }
    if (status === "connected" && wasDown.current) {
      wasDown.current = false
      setRestored(true)
      const timer = setTimeout(() => setRestored(false), RESTORED_VISIBLE_MS)
      return () => clearTimeout(timer)
    }
  }, [status])

  const message =
    status === "reconnecting"
      ? "Reconectando ao tempo real…"
      : restored
        ? "Conexão em tempo real restabelecida."
        : null

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-3 z-50 flex justify-center lg:top-20"
    >
      {message && (
        <p
          data-state={status === "reconnecting" ? "reconnecting" : "restored"}
          className="animate-in rounded-full border border-primary bg-surface px-4 py-2 text-caption-lg text-foreground shadow-card duration-300 fade-in"
        >
          {message}
        </p>
      )}
    </div>
  )
}
