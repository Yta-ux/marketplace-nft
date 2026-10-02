import type { MockDb } from "@/mocks/db/schema"
import { DB_SCHEMA_VERSION, seedDb } from "@/mocks/fixtures"

const STORAGE_KEY = "nft-mock:db"

let db: MockDb = load()

function load(): MockDb {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as MockDb
      if (parsed.schemaVersion === DB_SCHEMA_VERSION) return parsed
    }
  } catch {}
  return seedDb()
}

function persist(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  } catch {}
}

export function getDb(): Readonly<MockDb> {
  return db
}

export function commit<T>(mutator: (draft: MockDb) => T): T {
  const result = mutator(db)
  persist()
  return result
}

export function resetDb(): void {
  db = seedDb()
  persist()
}

export function nextId(counter: keyof MockDb["counters"], prefix: string, width = 4): string {
  return commit((draft) => {
    draft.counters[counter] += 1
    return `${prefix}-${String(draft.counters[counter]).padStart(width, "0")}`
  })
}

export type * from "@/mocks/db/schema"
