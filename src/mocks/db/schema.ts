import type {
  Collector,
  Edition,
  Network,
  NftCategory,
  NftChain,
  NftImage,
  OrderLine,
  OrderStatus,
  QuoteLine,
  WalletProvider,
  WalletRole,
} from "@/api/contracts"

export type DbUser = {
  id: string
  email: string
  displayName: string
  bio: string
  website: string | null
  avatarUrl: string | null
  passwordSalt: string

  passwordHash: string
  createdAt: string
  updatedAt: string
}

export type DbSession = { token: string; userId: string; createdAt: string; expiresAt: string }

export type DbCreator = { id: string; name: string; avatarUrl: string | null }

export type DbNft = {
  id: string
  name: string
  description: string
  creatorId: string
  category: NftCategory
  chain: NftChain
  compareAtPrice: string | null
  gallery: NftImage[]
  editions: Edition[]
  tags: string[]
  contractAddress: string
  tokenStandard: "ERC-721" | "ERC-1155"
  favoritesCount: number
  featured: boolean
  createdAt: string
  version: number
}

export type DbCartItem = { id: string; nftId: string; editionId: string; quantity: number }

export type DbCart = {
  id: string
  items: DbCartItem[]
  couponCode: string | null
  version: number
  updatedAt: string
}

export type DbCoupon = {
  code: string
  description: string
  kind: "percent" | "fixed"

  value: string
  minSubtotal: string | null
  expiresAt: string
}

export type DbQuote = {
  id: string
  userId: string
  lines: QuoteLine[]
  couponCode: string | null
  couponStatus: "applied" | "expired" | "not-applicable" | null
  subtotal: string
  discount: string
  networkFee: string
  total: string
  network: Network
  cartVersion: number
  createdAt: string
  expiresAt: string
}

export type DbOrder = {
  id: string
  userId: string
  status: OrderStatus
  lines: OrderLine[]
  couponCode: string | null
  subtotal: string
  discount: string
  networkFee: string
  total: string
  network: Network
  wallet: { id: string; label: string; address: string; provider: WalletProvider }
  collector: Collector
  quoteId: string
  transaction: { hash: string; explorerUrl: string } | null
  failureReason: string | null

  plannedOutcome: "confirmed" | "declined"

  settleAt: string | null
  createdAt: string
  updatedAt: string
  version: number
}

export type DbIdempotencyRecord = { orderId: string; requestHash: string }

export type DbWallet = {
  id: string
  userId: string
  label: string
  address: string
  provider: WalletProvider
  role: WalletRole
  networks: Network[]
  connection: { network: Network; connectedAt: string } | null
  createdAt: string
  updatedAt: string
}

export type MockDb = {
  schemaVersion: number
  users: DbUser[]
  sessions: DbSession[]
  creators: DbCreator[]
  nfts: DbNft[]

  favorites: Record<string, string[]>
  carts: Record<string, DbCart>
  coupons: DbCoupon[]
  quotes: Record<string, DbQuote>
  orders: Record<string, DbOrder>

  idempotency: Record<string, DbIdempotencyRecord>
  wallets: DbWallet[]
  counters: Record<"user" | "cartItem" | "cart" | "quote" | "order" | "wallet" | "event", number>
}
