import {
  type ConnectWalletRequest,
  type CreateWalletRequest,
  type UpdateWalletRequest,
  type Wallet,
  type WalletsResponse,
  walletSchema,
  walletsResponseSchema,
} from "@/api/contracts"
import { http, parseResponse } from "@/api/http"

const wallet = (walletId: string) => `/me/wallets/${encodeURIComponent(walletId)}`

export const walletsApi = {
  list: async (signal?: AbortSignal): Promise<WalletsResponse> =>
    parseResponse(walletsResponseSchema, (await http.get("/me/wallets", { signal })).data),

  create: async (body: CreateWalletRequest): Promise<Wallet> =>
    parseResponse(walletSchema, (await http.post("/me/wallets", body)).data),

  update: async (walletId: string, body: UpdateWalletRequest): Promise<Wallet> =>
    parseResponse(walletSchema, (await http.patch(wallet(walletId), body)).data),

  connect: async (walletId: string, body: ConnectWalletRequest): Promise<Wallet> =>
    parseResponse(walletSchema, (await http.post(`${wallet(walletId)}/connection`, body)).data),

  disconnect: async (walletId: string): Promise<Wallet> =>
    parseResponse(walletSchema, (await http.delete(`${wallet(walletId)}/connection`)).data),
}
