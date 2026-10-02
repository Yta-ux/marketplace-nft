import { io, type Socket } from "socket.io-client"
import {
  type RealtimeEvent,
  realtimeEventSchema,
  SOCKET_EVENTS,
  type SocketAuth,
} from "@/api/contracts"
import { env } from "@/lib/env"
import { EventGuard } from "@/realtime/event-guard"

export const SOCKET_CONNECT_TIMEOUT_MS = 5_000

export function createSocket(): Socket {
  return io(env.socketUrl, {
    transports: ["websocket"],
    withCredentials: true,
    autoConnect: false,
    reconnection: true,
    reconnectionDelay: 500,
    reconnectionDelayMax: 5_000,
    timeout: SOCKET_CONNECT_TIMEOUT_MS,
  })
}

type EventType = RealtimeEvent["type"]
type EventOf<T extends EventType> = Extract<RealtimeEvent, { type: T }>
type Handler<T extends EventType> = (event: EventOf<T>) => void

export type ConnectionStatus = "idle" | "connecting" | "connected" | "reconnecting" | "closed"

export class RealtimeSession {
  private readonly socket: Socket
  private readonly guard = new EventGuard()
  private readonly handlers = new Map<EventType, Set<(event: RealtimeEvent) => void>>()
  private readonly reconnectListeners = new Set<() => void>()
  private readonly statusListeners = new Set<(status: ConnectionStatus) => void>()
  private hasConnected = false
  private status: ConnectionStatus = "idle"

  constructor(token: string | null) {
    this.socket = createSocket()
    const auth: SocketAuth = { token }
    this.socket.auth = auth

    this.socket.on("connect", () => {
      const isReconnect = this.hasConnected
      this.hasConnected = true
      this.setStatus("connected")

      if (isReconnect) for (const listener of this.reconnectListeners) listener()
    })
    this.socket.on("disconnect", () => {
      if (this.status !== "closed") this.setStatus("reconnecting")
    })
    this.socket.io.on("reconnect_attempt", () => {
      if (this.status !== "closed") this.setStatus("reconnecting")
    })

    for (const type of Object.values(SOCKET_EVENTS)) {
      this.socket.on(type, (payload: unknown) => this.dispatch(payload))
    }
  }

  start(): this {
    this.setStatus("connecting")
    this.socket.connect()
    return this
  }

  close(): void {
    this.setStatus("closed")
    this.socket.removeAllListeners()
    this.socket.io.removeAllListeners()
    this.socket.disconnect()
    this.handlers.clear()
    this.reconnectListeners.clear()
    this.statusListeners.clear()
    this.guard.clear()
  }

  on<T extends EventType>(type: T, handler: Handler<T>): () => void {
    const set = this.handlers.get(type) ?? new Set()
    const wrapped = handler as (event: RealtimeEvent) => void
    set.add(wrapped)
    this.handlers.set(type, set)
    return () => set.delete(wrapped)
  }

  onReconnect(listener: () => void): () => void {
    this.reconnectListeners.add(listener)
    return () => this.reconnectListeners.delete(listener)
  }

  onStatus(listener: (status: ConnectionStatus) => void): () => void {
    this.statusListeners.add(listener)
    listener(this.status)
    return () => this.statusListeners.delete(listener)
  }

  observeVersion(resource: RealtimeEvent["resource"]["type"], id: string, version: number): void {
    this.guard.observe(`${resource}:${id}`, version)
  }

  getStatus(): ConnectionStatus {
    return this.status
  }

  private dispatch(payload: unknown): void {
    const parsed = realtimeEventSchema.safeParse(payload)
    if (!parsed.success) {
      if (import.meta.env.DEV) console.warn("[realtime] dropped invalid event", parsed.error.issues)
      return
    }
    if (!this.guard.accept(parsed.data)) return
    for (const handler of this.handlers.get(parsed.data.type) ?? []) handler(parsed.data)
  }

  private setStatus(status: ConnectionStatus): void {
    if (this.status === status) return
    this.status = status
    for (const listener of this.statusListeners) listener(status)
  }
}
