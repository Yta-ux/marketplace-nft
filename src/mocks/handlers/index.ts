import { authHandlers } from "@/mocks/handlers/auth"
import { cartHandlers } from "@/mocks/handlers/cart"
import { controlHandlers } from "@/mocks/handlers/control"
import { favoriteHandlers } from "@/mocks/handlers/favorites"
import { networkConditions } from "@/mocks/handlers/network"
import { nftHandlers } from "@/mocks/handlers/nfts"
import { orderHandlers } from "@/mocks/handlers/orders"
import { profileHandlers } from "@/mocks/handlers/profile"
import { quoteHandlers } from "@/mocks/handlers/quotes"
import { walletHandlers } from "@/mocks/handlers/wallets"

export const handlers = [
  ...controlHandlers,
  networkConditions,
  ...authHandlers,
  ...nftHandlers,
  ...favoriteHandlers,
  ...cartHandlers,
  ...quoteHandlers,
  ...orderHandlers,
  ...profileHandlers,
  ...walletHandlers,
]
