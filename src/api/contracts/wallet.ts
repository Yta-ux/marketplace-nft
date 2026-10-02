import { z } from "zod"
import { isoDateSchema, networkSchema } from "./common"

export const walletProviderSchema = z.enum(["metamask", "coinbase", "walletconnect"])
export type WalletProvider = z.infer<typeof walletProviderSchema>

export const walletRoleSchema = z.enum(["primary", "secondary"])
export type WalletRole = z.infer<typeof walletRoleSchema>

export const walletAddressSchema = z
  .string()
  .trim()
  .regex(/^0x[a-fA-F0-9]{40}$/, "Enter a valid address (0x followed by 40 hex characters)")

export const walletConnectionSchema = z.object({
  network: networkSchema,
  connectedAt: isoDateSchema,
})
export type WalletConnection = z.infer<typeof walletConnectionSchema>

export const walletSchema = z.object({
  id: z.string(),
  label: z.string(),
  address: z.string(),
  provider: walletProviderSchema,
  role: walletRoleSchema,
  networks: z.array(networkSchema).min(1),

  connection: walletConnectionSchema.nullable(),
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
})
export type Wallet = z.infer<typeof walletSchema>

export const walletsResponseSchema = z.object({ items: z.array(walletSchema) })
export type WalletsResponse = z.infer<typeof walletsResponseSchema>

export const walletLabelSchema = z
  .string()
  .trim()
  .min(1, "Enter a label")
  .max(30, "Use at most 30 characters")

export const createWalletRequestSchema = z.object({
  label: walletLabelSchema,
  address: walletAddressSchema,
  provider: walletProviderSchema,
  role: walletRoleSchema,
  networks: z.array(networkSchema).min(1, "Select at least one network"),
})
export type CreateWalletRequest = z.infer<typeof createWalletRequestSchema>

export const updateWalletRequestSchema = createWalletRequestSchema.partial()
export type UpdateWalletRequest = z.infer<typeof updateWalletRequestSchema>

export const connectWalletRequestSchema = z.object({ network: networkSchema })
export type ConnectWalletRequest = z.infer<typeof connectWalletRequestSchema>
