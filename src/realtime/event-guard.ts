import type { RealtimeEvent } from "@/api/contracts"

const SEEN_LIMIT = 500

export class EventGuard {
  private readonly seen = new Set<string>()
  private readonly versions = new Map<string, number>()

  static key(resource: RealtimeEvent["resource"]): string {
    return `${resource.type}:${resource.id}`
  }

  observe(resourceKey: string, version: number): void {
    const current = this.versions.get(resourceKey) ?? 0
    if (version > current) this.versions.set(resourceKey, version)
  }

  accept(event: RealtimeEvent): boolean {
    if (this.seen.has(event.id)) return false
    this.remember(event.id)
    const key = EventGuard.key(event.resource)
    const known = this.versions.get(key) ?? 0
    if (event.version <= known) return false
    this.versions.set(key, event.version)
    return true
  }

  clear(): void {
    this.seen.clear()
    this.versions.clear()
  }

  private remember(id: string): void {
    this.seen.add(id)
    if (this.seen.size > SEEN_LIMIT) {
      const oldest = this.seen.values().next().value
      if (oldest !== undefined) this.seen.delete(oldest)
    }
  }
}
