import { useQueryClient } from "@tanstack/react-query"
import { createContext, type ReactNode, useContext, useEffect, useState } from "react"
import { credentials } from "@/api/credentials"
import { useSession } from "@/queries/session"
import { applyNftUpdated, applyOrderUpdated, reconcileActiveQueries } from "@/realtime/apply-events"
import { cartChanges } from "@/realtime/cart-changes"
import { type ConnectionStatus, RealtimeSession } from "@/realtime/realtime-session"

const StatusContext = createContext<ConnectionStatus>("idle")

export const useRealtimeStatus = () => useContext(StatusContext)

type Versioned = { id: string; version: number }

function observeCachedVersions(
  realtime: RealtimeSession,
  queryKey: readonly unknown[],
  data: unknown,
) {
  const [scope, kind, id] = queryKey
  if (!data || typeof data !== "object") return
  if (scope === "nfts" && kind === "detail" && typeof id === "string") {
    realtime.observeVersion("nft", id, (data as Versioned).version)
  }
  if (scope === "nfts" && kind === "list" && "items" in data) {
    for (const item of (data as { items: Versioned[] }).items) {
      realtime.observeVersion("nft", item.id, item.version)
    }
  }
  if (scope === "orders" && typeof kind === "string" && "version" in data) {
    realtime.observeVersion("order", kind, (data as Versioned).version)
  }
}

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const session = useSession()
  const [status, setStatus] = useState<ConnectionStatus>("idle")
  const userId = session.isPending ? undefined : (session.data?.user.id ?? null)

  useEffect(() => {
    if (userId === undefined) return
    const realtime = new RealtimeSession(credentials.getToken())
    cartChanges.clear()

    realtime.on("nft.updated", (event) => applyNftUpdated(queryClient, event))
    realtime.on("order.updated", (event) => applyOrderUpdated(queryClient, event))
    realtime.onReconnect(() => reconcileActiveQueries(queryClient))
    realtime.onStatus(setStatus)

    const unsubscribe = queryClient.getQueryCache().subscribe((cacheEvent) => {
      if (cacheEvent.type !== "updated" || cacheEvent.action.type !== "success") return
      observeCachedVersions(realtime, cacheEvent.query.queryKey, cacheEvent.query.state.data)
    })

    realtime.start()
    return () => {
      unsubscribe()
      realtime.close()
      cartChanges.clear()
    }
  }, [userId, queryClient])

  useEffect(() => {
    document.documentElement.dataset.realtime = status
  }, [status])

  return <StatusContext value={status}>{children}</StatusContext>
}
