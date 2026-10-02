import type { MockDb } from "@/mocks/db/schema"
import { coupons } from "@/mocks/fixtures/coupons"
import { buildNfts, creators } from "@/mocks/fixtures/nfts"
import { favorites, users } from "@/mocks/fixtures/users"
import { wallets } from "@/mocks/fixtures/wallets"

export { FIXTURE_PASSWORD } from "@/mocks/fixtures/users"

export const DB_SCHEMA_VERSION = 6

export function seedDb(): MockDb {
  return structuredClone({
    schemaVersion: DB_SCHEMA_VERSION,
    users,
    sessions: [],
    creators,
    nfts: buildNfts(),
    favorites,
    carts: {},
    coupons,
    quotes: {},
    orders: {},
    idempotency: {},
    wallets,
    counters: { user: 100, cartItem: 0, cart: 0, quote: 0, order: 0, wallet: 100, event: 0 },
  })
}
