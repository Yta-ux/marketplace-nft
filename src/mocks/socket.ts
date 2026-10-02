import { toSocketIo } from "@mswjs/socket.io-binding"
import { type WebSocketHandlerConnection, ws } from "msw"
import { type RealtimeEvent, socketAuthSchema } from "@/api/contracts"
import { env } from "@/lib/env"
import { sessionFromToken } from "@/mocks/lib/auth"

const PING_INTERVAL_MS = 20_000
const HISTORY_LIMIT = 50

type Client = {
  id: number
  io: ReturnType<typeof toSocketIo>
  close: () => void
  token: string | null
  authenticated: boolean
}

const clients = new Map<number, Client>()
const history: RealtimeEvent[] = []
let nextClientId = 1
let downUntil: number | null = null
let restoreTimer: ReturnType<typeof setTimeout> | null = null

function isDown(): boolean {
  if (downUntil === null) return false
  if (downUntil !== Number.POSITIVE_INFINITY && Date.now() >= downUntil) {
    downUntil = null
    return false
  }
  return true
}

export function handleConnection(connection: WebSocketHandlerConnection): void {
  if (isDown()) {
    connection.client.close(4000, "Simulated outage")
    return
  }

  const client: Client = {
    id: nextClientId++,
    io: toSocketIo(connection),
    close: () => connection.client.close(1000, "Server closed connection"),
    token: null,
    authenticated: false,
  }
  clients.set(client.id, client)

  const heartbeat = setInterval(() => connection.client.send("2"), PING_INTERVAL_MS)

  connection.client.addEventListener("message", (event) => {
    if (typeof event.data !== "string" || !event.data.startsWith("40")) return
    const raw = event.data.slice(2)
    const parsed = socketAuthSchema.safeParse(raw ? JSON.parse(raw) : { token: null })
    client.token = parsed.success ? parsed.data.token : null
    client.authenticated = true
  })

  connection.client.addEventListener("close", () => {
    clearInterval(heartbeat)
    clients.delete(client.id)
  })
}

function deliver(client: Client, event: RealtimeEvent): void {
  client.io.client.emit(event.type, event)
}

function record(event: RealtimeEvent): void {
  history.push(event)
  if (history.length > HISTORY_LIMIT) history.shift()
}

export function broadcast(event: RealtimeEvent): void {
  record(event)
  if (isDown()) return
  for (const client of clients.values()) deliver(client, event)
}

export function emitToUser(userId: string, event: RealtimeEvent): void {
  record(event)
  if (isDown()) return
  emitToUserRaw(userId, event)
}

export function replay(count: number, userId?: string): RealtimeEvent[] {
  const events = history.slice(-count)
  for (const event of events) {
    if (event.type === "order.updated" && userId) emitToUserRaw(userId, event)
    else for (const client of clients.values()) deliver(client, event)
  }
  return events
}

export function emitRaw(event: RealtimeEvent, userId?: string): void {
  if (userId) emitToUserRaw(userId, event)
  else for (const client of clients.values()) deliver(client, event)
}

function emitToUserRaw(userId: string, event: RealtimeEvent): void {
  for (const client of clients.values()) {
    const auth = sessionFromToken(client.token)
    if (auth && auth !== "expired" && auth.user.id === userId) deliver(client, event)
  }
}

export function disconnectAll(downForMs?: number): number {
  const count = clients.size
  downUntil = downForMs === undefined ? Number.POSITIVE_INFINITY : Date.now() + downForMs
  if (restoreTimer) clearTimeout(restoreTimer)
  if (downForMs !== undefined) restoreTimer = setTimeout(restore, downForMs)
  for (const client of [...clients.values()]) client.close()
  return count
}

export function restore(): void {
  downUntil = null
  if (restoreTimer) clearTimeout(restoreTimer)
  restoreTimer = null
}

export function socketStatus() {
  return {
    down: isDown(),
    connections: [...clients.values()].map((c) => ({
      id: c.id,
      authenticated: c.authenticated,
      userId: (() => {
        const auth = sessionFromToken(c.token)
        return auth && auth !== "expired" ? auth.user.id : null
      })(),
    })),
    history: history.length,
  }
}

export function resetSocketState(): void {
  history.length = 0
  restore()
}

const socketOrigin = env.socketUrl.replace(/^http/, "ws").replace(/\/$/, "")

const realtime = ws.link(socketOrigin)

export const socketHandlers = [
  realtime.addEventListener("connection", (connection) => handleConnection(connection)),
]
