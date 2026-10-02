import { useSyncExternalStore } from "react"

export type CartChange = {
  key: string
  nftId: string
  name: string
  field: "price" | "available"
  previous: string
  current: string
}

type Listener = () => void

let changes: CartChange[] = []
const listeners = new Set<Listener>()

function emit() {
  for (const listener of listeners) listener()
}

export const cartChanges = {
  record(incoming: CartChange[]) {
    if (incoming.length === 0) return
    const next = new Map(changes.map((change) => [change.key, change]))
    for (const change of incoming) {
      const existing = next.get(change.key)
      const previous = existing?.previous ?? change.previous
      if (previous === change.current) next.delete(change.key)
      else next.set(change.key, { ...change, previous })
    }
    changes = [...next.values()]
    emit()
  },
  clear() {
    if (changes.length === 0) return
    changes = []
    emit()
  },
  snapshot: () => changes,
  subscribe(listener: Listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
}

export function useCartChanges(): CartChange[] {
  return useSyncExternalStore(cartChanges.subscribe, cartChanges.snapshot, cartChanges.snapshot)
}
