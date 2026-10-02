import type { DbUser } from "@/mocks/db/schema"

export const FIXTURE_PASSWORD = "Collector#2026"

export const users: DbUser[] = [
  {
    id: "user-ana",
    email: "ana@collector.test",
    displayName: "Ana Collector",
    bio: "Collecting generative art since the first drops.",
    website: "https://ana.collector.test",
    avatarUrl: null,
    passwordSalt: "s4lt-ana-01",
    passwordHash: "11ec77f344dfe8aa857eb2390c9e8b7936ba178ba8b9ac9e3cc3b9057149262c",
    createdAt: "2026-01-10T12:00:00.000Z",
    updatedAt: "2026-01-10T12:00:00.000Z",
  },
  {
    id: "user-bruno",
    email: "bruno@collector.test",
    displayName: "Bruno Trader",
    bio: "",
    website: null,
    avatarUrl: null,
    passwordSalt: "s4lt-bruno-02",
    passwordHash: "e715d62fc1db268272ad2055697d3d5682e1679058585fa3bd4334c9e6638660",
    createdAt: "2026-02-03T09:30:00.000Z",
    updatedAt: "2026-02-03T09:30:00.000Z",
  },
  {
    id: "user-carla",
    email: "carla@collector.test",
    displayName: "Carla Newcomer",
    bio: "",
    website: null,
    avatarUrl: null,
    passwordSalt: "s4lt-carla-03",
    passwordHash: "935697b9d53ca5ee7106415cd23d3de5baa4f203c11404186724183b8a856ff4",
    createdAt: "2026-03-15T18:45:00.000Z",
    updatedAt: "2026-03-15T18:45:00.000Z",
  },
]

export const favorites: Record<string, string[]> = {
  "user-ana": ["nft-002", "nft-005", "nft-011"],
  "user-bruno": ["nft-003"],
  "user-carla": [],
}
